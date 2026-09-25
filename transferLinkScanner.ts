/**
 * Security Scanner for External Project File Transfer Links (WeTransfer, TransferNow)
 *
 * Enforces strict URL-level and destination-level safety checks:
 * 1. HTTPS Protocol Verification
 * 2. Strict Hostname & Subdomain Extraction (no loose string search)
 * 3. Whitelisted Transfer Providers only: WeTransfer (wetransfer.com, we.tl), TransferNow (transfernow.net)
 * 4. Suspicious Redirect & User-Info Injection Checks (@, open-redirect params)
 * 5. Malformed URL Prevention
 * 6. Known Phishing & IP-Logger Signatures
 * 7. Off-Platform Payment & Contact Diversion Signals (UPI, WhatsApp, PayPal, direct wires)
 *
 * NOTE: Nain performs destination and URL-level security verification;
 * it does not claim to inspect third-party hosted file payloads directly.
 */

export type TransferScanStatus = 'scanning' | 'approved' | 'blocked';

export type TransferServiceName = 'WeTransfer' | 'TransferNow';

export type TransferBlockCategory = 
  | 'insecure_protocol'
  | 'unauthorized_domain'
  | 'suspicious_redirect'
  | 'phishing_signal'
  | 'payment_diversion'
  | 'malformed_url';

export interface TransferScanChecklist {
  httpsProtocol: boolean;
  validHostname: boolean;
  allowedDomain: boolean;
  noUserInfoInjection: boolean;
  noSuspiciousRedirects: boolean;
  noPhishingSignals: boolean;
  noPaymentDiversion: boolean;
}

export interface TransferScanResult {
  status: 'approved' | 'blocked';
  serviceName: TransferServiceName;
  canonicalDomain: string;
  sanitizedUrl: string;
  blockCategory?: TransferBlockCategory;
  errorMessage?: string;
  checklist: TransferScanChecklist;
  checkedAt: string;
}

// Strictly allowed root domains for external file transfers
const ALLOWED_TRANSFER_DOMAINS: Record<TransferServiceName, string[]> = {
  WeTransfer: ['wetransfer.com', 'we.tl'],
  TransferNow: ['transfernow.net']
};

// Known payment diversion triggers
const PAYMENT_DIVERSION_PATTERNS = [
  // UPI Handles
  /[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|oksbi|okicici|paytm|gpay|ybl|upi|ibl|axl|apl|barodampay|postbank|idfcbank)/i,
  // Payment URLs / query schemes
  /upi:\/\//i,
  /paypal\.(me|com\/pay)/i,
  /paytm\.me/i,
  /gpay\.app/i,
  /phonepe/i,
  // Direct off-platform payment keywords
  /\b(pay\s+(me\s+)?directly|pay\s+outside|outside\s+payment|direct\s+gpay|send\s+(money\s+)?to\s+upi|bypass\s+fees|direct\s+bank\s+transfer|wire\s+me)\b/i,
  // Contact diversion keywords
  /\b(whatsapp\s+me|wa\.me|contact\s+me\s+on\s+whatsapp)\b/i
];

// Open redirect and suspicious query parameters
const SUSPICIOUS_REDIRECT_PARAMS = [
  'url', 'redirect', 'redirect_uri', 'dest', 'destination', 
  'target', 'next', 'r', 'out', 'link', 'to', 'forward', 'forward_to'
];

// Known IP-logger, phishing and scam domain fragments
const PHISHING_INDICATORS = [
  'iplogger', 'grabify', '2no.co', 'bit.do', 'free-nitro', 
  'login-verify', 'account-confirm', 'token-grab', 'claim-reward'
];

/**
 * Fast detection of whether a candidate URL belongs to a recognized transfer service
 */
export function isCandidateTransferUrl(rawUrl: string): {
  isCandidate: boolean;
  serviceName?: TransferServiceName;
} {
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase().replace(/\.+$/, '');

    // Check WeTransfer
    if (
      host === 'wetransfer.com' || host.endsWith('.wetransfer.com') ||
      host === 'we.tl' || host.endsWith('.we.tl')
    ) {
      return { isCandidate: true, serviceName: 'WeTransfer' };
    }

    // Check TransferNow
    if (host === 'transfernow.net' || host.endsWith('.transfernow.net')) {
      return { isCandidate: true, serviceName: 'TransferNow' };
    }

    return { isCandidate: false };
  } catch {
    return { isCandidate: false };
  }
}

/**
 * Validates a transfer URL against strict security rules
 */
export function scanTransferUrlSync(rawUrl: string, messageContext = ''): TransferScanResult {
  const timestamp = new Date().toISOString();
  const checklist: TransferScanChecklist = {
    httpsProtocol: false,
    validHostname: false,
    allowedDomain: false,
    noUserInfoInjection: false,
    noSuspiciousRedirects: false,
    noPhishingSignals: false,
    noPaymentDiversion: false
  };

  // 1. Basic URL Parsing
  let parsedUrl: URL;
  let normalized = rawUrl.trim();

  // Flag explicit insecure HTTP if user provided explicit http://
  const hasExplicitHttp = /^http:\/\//i.test(normalized);

  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  try {
    parsedUrl = new URL(normalized);
  } catch {
    return {
      status: 'blocked',
      serviceName: 'TransferNow',
      canonicalDomain: 'invalid',
      sanitizedUrl: rawUrl,
      blockCategory: 'malformed_url',
      errorMessage: 'This external link could not be verified and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }

  // 2. Protocol Check
  if (parsedUrl.protocol === 'https:' && !hasExplicitHttp) {
    checklist.httpsProtocol = true;
  } else {
    checklist.httpsProtocol = false;
    return {
      status: 'blocked',
      serviceName: 'TransferNow',
      canonicalDomain: parsedUrl.hostname,
      sanitizedUrl: normalized,
      blockCategory: 'insecure_protocol',
      errorMessage: 'This external link could not be verified (requires secure HTTPS protocol) and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }

  // 3. Prevent User-Info Injection (e.g., https://wetransfer.com@attacker.com)
  if (parsedUrl.username || parsedUrl.password) {
    checklist.noUserInfoInjection = false;
    return {
      status: 'blocked',
      serviceName: 'TransferNow',
      canonicalDomain: parsedUrl.hostname,
      sanitizedUrl: normalized,
      blockCategory: 'suspicious_redirect',
      errorMessage: 'This external link could not be verified and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }
  checklist.noUserInfoInjection = true;

  // 4. Strict Hostname & Subdomain Validation
  let hostname = parsedUrl.hostname.toLowerCase().trim();
  while (hostname.endsWith('.')) {
    hostname = hostname.slice(0, -1);
  }

  // Reject raw IP addresses
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    checklist.validHostname = false;
    return {
      status: 'blocked',
      serviceName: 'TransferNow',
      canonicalDomain: hostname,
      sanitizedUrl: normalized,
      blockCategory: 'unauthorized_domain',
      errorMessage: 'This external link could not be verified and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }
  checklist.validHostname = true;

  // Identify Allowed Service
  let matchedService: TransferServiceName | null = null;
  for (const [service, domains] of Object.entries(ALLOWED_TRANSFER_DOMAINS)) {
    const isMatch = domains.some(allowed => hostname === allowed || hostname.endsWith(`.${allowed}`));
    if (isMatch) {
      matchedService = service as TransferServiceName;
      break;
    }
  }

  if (!matchedService) {
    checklist.allowedDomain = false;
    return {
      status: 'blocked',
      serviceName: 'TransferNow',
      canonicalDomain: hostname,
      sanitizedUrl: normalized,
      blockCategory: 'unauthorized_domain',
      errorMessage: 'This external link could not be verified and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }
  checklist.allowedDomain = true;

  // 5. Check for Open Redirects & Suspicious Query Parameters
  const params = parsedUrl.searchParams;
  let hasSuspiciousRedirect = false;

  for (const paramName of SUSPICIOUS_REDIRECT_PARAMS) {
    const val = params.get(paramName);
    if (val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('//'))) {
      hasSuspiciousRedirect = true;
      break;
    }
  }

  if (hasSuspiciousRedirect) {
    checklist.noSuspiciousRedirects = false;
    return {
      status: 'blocked',
      serviceName: matchedService,
      canonicalDomain: hostname,
      sanitizedUrl: normalized,
      blockCategory: 'suspicious_redirect',
      errorMessage: 'This external link could not be verified and has been hidden for your safety.',
      checklist,
      checkedAt: timestamp
    };
  }
  checklist.noSuspiciousRedirects = true;

  // 6. Phishing & Logger Signatures
  const fullSearchString = (hostname + parsedUrl.pathname + parsedUrl.search).toLowerCase();
  for (const indicator of PHISHING_INDICATORS) {
    if (fullSearchString.includes(indicator)) {
      checklist.noPhishingSignals = false;
      return {
        status: 'blocked',
        serviceName: matchedService,
        canonicalDomain: hostname,
        sanitizedUrl: normalized,
        blockCategory: 'phishing_signal',
        errorMessage: 'This external link could not be verified and has been hidden for your safety.',
        checklist,
        checkedAt: timestamp
      };
    }
  }
  checklist.noPhishingSignals = true;

  // 7. Payment Diversion & Contact Evasion Checks
  // Check the URL itself as well as surrounding message context
  const fullTextToInspect = `${normalized} ${messageContext}`;
  for (const pattern of PAYMENT_DIVERSION_PATTERNS) {
    if (pattern.test(fullTextToInspect)) {
      checklist.noPaymentDiversion = false;
      return {
        status: 'blocked',
        serviceName: matchedService,
        canonicalDomain: hostname,
        sanitizedUrl: normalized,
        blockCategory: 'payment_diversion',
        errorMessage: 'For your protection, payments must be completed through Nain Music. This external link has been hidden.',
        checklist,
        checkedAt: timestamp
      };
    }
  }
  checklist.noPaymentDiversion = true;

  // All checks passed! Link is verified and approved.
  return {
    status: 'approved',
    serviceName: matchedService,
    canonicalDomain: hostname,
    sanitizedUrl: parsedUrl.toString(),
    checklist,
    checkedAt: timestamp
  };
}

// Session-level memory cache for scanned URLs
const scanCache = new Map<string, TransferScanResult>();

/**
 * Async scanner that simulates realistic security verification (~1.2s delay for fresh URLs)
 * and retrieves cached result if already scanned in the current session.
 */
export async function scanTransferUrlAsync(
  rawUrl: string, 
  messageContext = '',
  skipDelay = false
): Promise<TransferScanResult> {
  const cacheKey = `${rawUrl.trim()}_${messageContext.trim()}`;
  if (scanCache.has(cacheKey)) {
    return scanCache.get(cacheKey)!;
  }

  // Realistic security scan inspection delay (1.2s) unless skipped
  if (!skipDelay) {
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  const result = scanTransferUrlSync(rawUrl, messageContext);
  scanCache.set(cacheKey, result);
  return result;
}

/**
 * Helper to get cached scan result synchronously if already available
 */
export function getCachedTransferScan(rawUrl: string, messageContext = ''): TransferScanResult | null {
  const cacheKey = `${rawUrl.trim()}_${messageContext.trim()}`;
  return scanCache.get(cacheKey) || null;
}
