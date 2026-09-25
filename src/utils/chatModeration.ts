import { ModerationResult, ModerationRecord, ModerationCategory } from '../types';

const STORAGE_MODERATION_KEY = 'nain_music_moderation_records';

/**
 * List of verified safe domains for external portfolio, audio, and reference sharing
 */
export const VERIFIED_SAFE_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'spotify.com',
  'open.spotify.com',
  'soundcloud.com',
  'bandcamp.com',
  'music.apple.com',
  'apple.com',
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'box.com',
  'app.box.com',
  'wetransfer.com',
  'we.tl',
  'transfernow.net',
  'vimeo.com',
  'audiomack.com',
  'beatport.com',
  'tidal.com',
  'behance.net',
  'artstation.com',
  'github.com',
  'nainmusic.com',
  'linktr.ee',
  'distrokid.com',
  'tunecore.com',
  'cdbaby.com',
];

/**
 * Blocked external social media, messaging, and community domains.
 * Direct links to these platforms are blocked before message delivery to protect
 * buyers and sellers from off-platform communication and escrow circumvention.
 */
export const BLOCKED_EXTERNAL_SOCIAL_DOMAINS = [
  // Meta / Social
  'facebook.com',
  'fb.com',
  'm.me',
  'messenger.com',
  'instagram.com',
  'instagr.am',
  'threads.net',

  // Messaging
  'whatsapp.com',
  'wa.me',
  'telegram.org',
  'telegram.me',
  't.me',
  'signal.org',
  'signal.me',
  'discord.com',
  'discord.gg',
  'viber.com',
  'line.me',
  'wechat.com',
  'qq.com',
  'kakao.com',
  'imo.im',

  // Social networks / communities
  'x.com',
  'twitter.com',
  't.co',
  'linkedin.com',
  'lnkd.in',
  'tiktok.com',
  'vm.tiktok.com',
  'snapchat.com',
  'reddit.com',
  'pinterest.com',
  'pin.it',
  'bluesky.app',
  'mastodon.social',
  'tumblr.com',
  'quora.com',
  'clubhouse.com',

  // China / regional social platforms
  'weibo.com',
  'douyin.com',
  'kuaishou.com',
  'kwai.com',
  'zhihu.com',
  'xiaohongshu.com',
  'xhslink.com',

  // India-focused social platforms
  'sharechat.com',
  'mojapp.in',
  'joshapp.com',
  'myjosh.in',

  // Other major social/community platforms with direct or private communication
  'twitch.tv',
  'patreon.com',
  'bereal.com',
  'lemon8-app.com',
];

/**
 * Checks if a hostname matches any blocked social/messaging platform or its subdomains.
 */
export function isBlockedSocialDomain(rawHostname: string): boolean {
  if (!rawHostname) return false;
  let host = rawHostname.toLowerCase().trim();
  host = host.split(':')[0];
  while (host.endsWith('.')) {
    host = host.slice(0, -1);
  }
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }

  return BLOCKED_EXTERNAL_SOCIAL_DOMAINS.some(blocked => {
    return host === blocked || host.endsWith(`.${blocked}`);
  });
}

/**
 * Normalizes a candidate URL/domain token and extracts its clean hostname.
 */
export function extractCleanHostname(rawToken: string): string {
  let cleaned = rawToken.trim().toLowerCase();
  cleaned = cleaned.replace(/^[<("'`\[{]+/, '').replace(/[>)'"`\]}.,:;!?]+$/, '');

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }
    return host;
  } catch {
    let host = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0].split(':')[0].toLowerCase();
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }
    return host;
  }
}

/**
 * Scans message text for any actual links or domain references to blocked social/messaging platforms.
 * Adheres strictly to:
 * - Block actual URL/domain only
 * - Do NOT block ordinary words ("Instagram", "Facebook", "WhatsApp", etc.) without a URL/domain
 * - Detects normal https://, http://, www., bare domain/subdomain with paths, query params, etc.
 */
export function detectBlockedSocialLink(text: string): { blocked: boolean; matchedUrl?: string; domain?: string } {
  if (!text || !text.trim()) {
    return { blocked: false };
  }

  const sortedDomains = [...BLOCKED_EXTERNAL_SOCIAL_DOMAINS].sort((a, b) => b.length - a.length);
  const domainPattern = sortedDomains.map(d => d.replace(/\./g, '\\.')).join('|');

  const scannerRegex = new RegExp(
    `(?:https?:\\/\\/|www\\.)[^\\s<>"'\`]+|\\b(?:[a-zA-Z0-9-]+\\.)*(?:${domainPattern})(?:[\\/:?#][^\\s<>"'\`]*)?`,
    'gi'
  );

  const matches = text.match(scannerRegex);
  if (!matches || matches.length === 0) {
    return { blocked: false };
  }

  for (const match of matches) {
    const host = extractCleanHostname(match);
    if (isBlockedSocialDomain(host)) {
      return {
        blocked: true,
        matchedUrl: match,
        domain: host,
      };
    }
  }

  return { blocked: false };
}

const EMAIL_COMMON_TLDS = new Set([
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'biz', 'info', 'mobi', 'name',
  'aero', 'asia', 'jobs', 'museum', 'co', 'in', 'io', 'ai', 'me', 'app',
  'dev', 'cloud', 'uk', 'ca', 'de', 'jp', 'fr', 'au', 'ru', 'ch', 'it',
  'nl', 'se', 'no', 'es', 'br', 'za', 'kr', 'cn', 'eu', 'tech', 'online',
  'site', 'xyz', 'club', 'live', 'store', 'agency', 'studio', 'pro', 'vip'
]);

const EMAIL_OBFUSCATION_STOPWORDS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'it', 'its',
  'my', 'your', 'his', 'her', 'our', 'their', 'some', 'any', 'each',
  'every', 'all', 'both', 'few', 'more', 'most', 'other', 'another',
  'same', 'such', 'no', 'nor', 'not', 'only', 'own', 'so'
]);

/**
 * Detects any actual email address or obfuscated email address representation.
 * Generic detection supports ALL email providers and custom domains.
 * Normal words mentioning email or providers ("I use Gmail", "check your email") are allowed.
 */
export function detectEmailAddress(text: string): { blocked: boolean; matchedEmail?: string } {
  if (!text || !text.trim()) {
    return { blocked: false };
  }

  const clean = text.trim();
  const withoutMailto = clean.replace(/^mailto:/i, '');

  // 1. Standard email addresses (generic detection across all providers and custom domains)
  // e.g. user@gmail.com, artist@musicstudio.in, contact@mycustommusicstudio.in, user@company.co.uk
  const standardEmailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
  const standardMatch = withoutMailto.match(standardEmailRegex);
  if (standardMatch) {
    return { blocked: true, matchedEmail: standardMatch[0] };
  }

  // 2. Emails with whitespace around @ or . (e.g. name @ gmail . com, name @gmail.com, name@gmail . com)
  const spacedEmailRegex = /\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9-]+(?:\s*\.\s*[A-Za-z0-9-]+)*\s*\.\s*[A-Za-z]{2,}\b/i;
  const spacedMatch = withoutMailto.match(spacedEmailRegex);
  if (spacedMatch) {
    return { blocked: true, matchedEmail: spacedMatch[0] };
  }

  // 3. Obfuscation with bracket/parenthesis delimiters
  // e.g. name[at]gmail[dot]com, name(at)gmail.com, name [at] gmail [dot] com, name(at)gmail(dot)com, name@gmail[dot]com
  const bracketEmailRegex = /\b[A-Za-z0-9._%+-]+\s*(?:\[at\]|\(at\)|\{at\}|<at>|@)\s*[A-Za-z0-9-]+(?:\s*(?:\.|\s*\[dot\]\s*|\s*\(dot\)\s*|\s*\{dot\}\s*|\s*<dot>\s*)\s*[A-Za-z0-9-]+)*\s*(?:\.|\s*\[dot\]\s*|\s*\(dot\)\s*|\s*\{dot\}\s*|\s*<dot>\s*|\s+dot\s+)\s*[A-Za-z]{2,}\b/i;
  const bracketMatch = withoutMailto.match(bracketEmailRegex);
  if (bracketMatch) {
    return { blocked: true, matchedEmail: bracketMatch[0] };
  }

  // 4. Bracketed at without dot obfuscation (e.g. name(at)gmail.com or name[at]domain.in)
  const atBracketRegex = /\b[A-Za-z0-9._%+-]+\s*(?:\[at\]|\(at\)|\{at\}|<at>)\s*[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b/i;
  const atBracketMatch = withoutMailto.match(atBracketRegex);
  if (atBracketMatch) {
    return { blocked: true, matchedEmail: atBracketMatch[0] };
  }

  // 5. Spoken words "at" and "dot" (e.g. "name at gmail dot com", "artist at musicstudio dot in")
  const spokenEmailRegex = /\b([A-Za-z0-9._%+-]+)\s+(?:at|@)\s+([A-Za-z0-9-]+)\s+(?:dot|\.)\s+([A-Za-z]{2,})\b/gi;
  let spokenMatch;
  while ((spokenMatch = spokenEmailRegex.exec(withoutMailto)) !== null) {
    const domainPart = spokenMatch[2].toLowerCase();
    const tldPart = spokenMatch[3].toLowerCase();

    // Avoid false positives on natural English phrases like "looking at the dot on" or "meet at the studio"
    if (!EMAIL_OBFUSCATION_STOPWORDS.has(domainPart) && (EMAIL_COMMON_TLDS.has(tldPart) || tldPart.length >= 2)) {
      return { blocked: true, matchedEmail: spokenMatch[0] };
    }
  }

  // 6. Mixed "@" with word "dot" (e.g. "name@gmail dot com")
  const atWithDotWord = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+)\s+dot\s+([A-Za-z]{2,})\b/i;
  const atDotMatch = withoutMailto.match(atWithDotWord);
  if (atDotMatch) {
    return { blocked: true, matchedEmail: atDotMatch[0] };
  }

  // 7. Word "at" with standard dot domain (e.g. "name at gmail.com", "artist at musicstudio.in")
  const atWordWithDotTld = /\b([A-Za-z0-9._%+-]+)\s+at\s+([A-Za-z0-9-]+)\.([A-Za-z]{2,})\b/i;
  const atWordMatch = withoutMailto.match(atWordWithDotTld);
  if (atWordMatch) {
    const domainPart = atWordMatch[2].toLowerCase();
    if (!EMAIL_OBFUSCATION_STOPWORDS.has(domainPart)) {
      return { blocked: true, matchedEmail: atWordMatch[0] };
    }
  }

  return { blocked: false };
}

/**
 * Known scam, phishing, IP logging, and bypass domain indicators
 */
export const SUSPICIOUS_DOMAIN_INDICATORS = [
  'grabify',
  'iplogger',
  '2no.co',
  'bit.do',
  'free-nitro',
  'telegram-hack',
  'crypto-airdrop',
  'claim-reward',
  'login-security',
  'bank-verify',
  'pay-direct',
  'escrow-bypass',
  'quick-transfer',
  'nain-payment-bypass',
  'bypass-fees',
  't.me/free',
  'free-gift',
  'bit-coins-bonus',
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.cam', '.click', '.rest'];

/**
 * Validates link safety based on URL analysis, trusted domain registry, and heuristic checks
 */
export function inspectUrlSafety(rawUrl: string): { isSafe: boolean; domain: string; reason?: string } {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();

    // 1. Check raw IP addresses (e.g., http://192.168.1.1 or http://45.33.32.156)
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return {
        isSafe: false,
        domain: hostname,
        reason: 'Direct IP address links without verified domain names are blocked for safety.'
      };
    }

    // 2. Check known phishing / IP logger / bypass keywords in hostname or pathname
    const fullTarget = (hostname + parsed.pathname).toLowerCase();
    for (const indicator of SUSPICIOUS_DOMAIN_INDICATORS) {
      if (fullTarget.includes(indicator)) {
        return {
          isSafe: false,
          domain: hostname,
          reason: 'This link was blocked because it appears unsafe, suspicious, or related to phishing/scam activity.'
        };
      }
    }

    // 3. Check for blocked external social media / messaging platforms
    if (isBlockedSocialDomain(hostname)) {
      return {
        isSafe: false,
        domain: hostname,
        reason: 'Please keep payments and transactions within Nain Music for your protection.'
      };
    }

    // 4. Check for verified safe music/portfolio platforms
    const isVerifiedDomain = VERIFIED_SAFE_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (isVerifiedDomain) {
      return { isSafe: true, domain: hostname };
    }

    // 5. Check for high-risk TLDs
    const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
    if (hasSuspiciousTld) {
      return {
        isSafe: false,
        domain: hostname,
        reason: 'This link was blocked because it uses an unverified high-risk domain.'
      };
    }

    // Default: allow standard legitimate websites with a clean reputation
    return { isSafe: true, domain: hostname };
  } catch {
    return {
      isSafe: false,
      domain: rawUrl,
      reason: 'This link was blocked because it has an invalid or malformed URL structure.'
    };
  }
}

/**
 * Standard music-production safe terms and slang that should never be falsely flagged
 */
export const MUSIC_SAFE_PHRASES = [
  /\bkill\s+(the\s+)?(beat|track|vocal|mix|hook|verse|drop|master)\b/i,
  /\b(blast|blasting)\s+(on\s+)?(monitors?|speakers?|headphones?|sub|sound\s*system)\b/i,
  /\bblast\s+(this\s+|the\s+)?(beat|track|song|music|tune|mix)\b/i,
  /\bdrop\s+(the\s+)?(beat|bass|track|song|album|single|stems|ep)\b/i,
  /\b(the\s+)?beat\s+drop\b/i,
  /\b(killer|deadly|fire|sick|insane)\s+(beat|track|mix|master|tune|riff|solo|melody|vocal|sound|bassline)\b/i,
  /\b(bomb|fire)\s+(beat|track|drop|mix)\b/i,
  /\bthis\s+(beat|track|song|mix|drop|solo)\s+is\s+(the\s+)?bomb\b/i,
  /\b(is|was|are|were|sounds?)\s+(the\s+)?bomb\b/i,
  /\bsex\s+pistols\b/i,
  /\bguns?\s*n['’]?\s*roses\b/i,
  /\bguns?\s*&\s*roses\b/i,
  /\bmachine\s+gun\s+kelly\b/i,
  /\btop\s+gun\b/i,
  /\byoung\s+guns\b/i,
  /\bmaster\s+(the\s+|these\s+)?stems?\b/i,
  /\bexport\s+to\s+(wav|mp3|flac|aiff|24-?bit(\s+wav)?)\b/i,
  /\bnormal\s+songwriting\/production\s+discussion\b/i
];

export function isMusicSlangBomb(text: string): boolean {
  return (
    /\b(is|was|are|were|sounds?)\s+(the\s+)?bomb\b/i.test(text) ||
    /\bthis\s+(beat|track|song|mix|drop|hook|solo)\s+is\s+(the\s+)?bomb\b/i.test(text) ||
    /\bbomb\s+(beat|track|drop|mix|song|hook|loop|production)\b/i.test(text)
  );
}

export function isMusicBandOrArtistWeapon(text: string): boolean {
  return (
    /\bsex\s+pistols\b/i.test(text) ||
    /\bguns?\s*n['’]?\s*roses\b/i.test(text) ||
    /\bguns?\s*&\s*roses\b/i.test(text) ||
    /\bmachine\s+gun\s+kelly\b/i.test(text) ||
    /\btop\s+gun\b/i.test(text) ||
    /\byoung\s+guns\b/i.test(text)
  );
}

export function isMusicBandOrArtistSex(text: string): boolean {
  return /\bsex\s+pistols\b/i.test(text);
}

export function isMusicSlangKill(text: string): boolean {
  return (
    /\bkill\s+(the\s+)?(beat|track|vocal|mix|hook|verse|drop|master|solo)\b/i.test(text) ||
    /\b(killer)\s+(beat|track|mix|master|tune|riff|solo|melody|vocal|sound|bassline)\b/i.test(text)
  );
}

export function isMusicSlangBlast(text: string): boolean {
  return (
    /\bblast\s+(on\s+)?(monitors?|speakers?|headphones?|sub|sound\s*system)\b/i.test(text) ||
    /\bblast\s+(this\s+|the\s+)?(beat|track|song|music|tune|mix)\b/i.test(text) ||
    /\bblasting\s+(the\s+|on\s+)?(monitors?|speakers?|music)\b/i.test(text)
  );
}

export function isMusicSlangDrop(text: string): boolean {
  return (
    /\bdrop\s+(the\s+)?(beat|bass|track|song|album|single|stems|ep)\b/i.test(text) ||
    /\b(the\s+)?beat\s+drop\b/i.test(text)
  );
}

export function isMusicProductionContextSafe(text: string): boolean {
  for (const phrase of MUSIC_SAFE_PHRASES) {
    if (phrase.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalizes text to detect evasion attempts (spaced letters, punctuation between letters, leetspeak)
 */
export function normalizeEvasionText(text: string): { lower: string; deobfuscated: string; stripped: string } {
  if (!text) return { lower: '', deobfuscated: '', stripped: '' };
  const lower = text.toLowerCase();

  // 1. De-obfuscate words with symbols/spaces between letters (e.g. p.o.r.n, b*o*m*b, b-o-m-b, b o m b)
  let deobfuscated = lower;
  // punctuation separated letters: p.i.s.t.o.l -> pistol, p*o*r*n -> porn
  deobfuscated = deobfuscated.replace(/\b([a-z0-9])[._*\-~]+([a-z0-9])[._*\-~]+([a-z0-9])(?:[._*\-~]+([a-z0-9]))*\b/gi, (m) => {
    return m.replace(/[._*\-~]/g, '');
  });
  // spaces between individual letters: e.g. "b o m b" -> "bomb"
  deobfuscated = deobfuscated.replace(/\b([a-z0-9])\s+([a-z0-9])\s+([a-z0-9])(?:\s+([a-z0-9]))*\b/gi, (m) => {
    return m.replace(/\s+/g, '');
  });

  // 2. Leetspeak map on deobfuscated
  deobfuscated = deobfuscated.replace(/[@4]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[$5]/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b');

  // Collapse repeated characters (3+ down to 1)
  deobfuscated = deobfuscated.replace(/(.)\1{2,}/g, '$1');

  // 3. Stripped alphanumeric version for evasion matching
  const stripped = lower
    .replace(/[@4]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[$5]/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/(.)\1{2,}/g, '$1')
    .replace(/[^a-z0-9]/g, '');

  return { lower, deobfuscated, stripped };
}

/**
 * Detects illegal activity, weapons, explosives, drug trafficking, or violent crime
 */
export function detectIllegalActivity(text: string): { blocked: boolean; category?: ModerationCategory } {
  const { lower, deobfuscated, stripped } = normalizeEvasionText(text);

  // 1. Explosives / Bombs / Weapons construction
  // Standalone or phrase: "bomb", "bombs", "pipe bomb", "c4", "dynamite", "ied", "detonator", "explosive(s)"
  const hasBombOrExplosive =
    /\b(bomb|bombs|pipe\s*bomb|pipe\s*bombs|c4|dynamite|tnt|ied|ieds|detonator|detonators|explosives?|grenades?|molotov(\s*cocktail)?|landmines?|missiles?|rocket\s*launchers?|rpgs?)\b/i.test(lower) ||
    /\b(bomb|bombs|pipe\s*bomb|pipe\s*bombs|c4|dynamite|tnt|ied|ieds|detonator|detonators|explosives?|grenades?|molotov|landmines?|missiles?)\b/i.test(deobfuscated) ||
    stripped === 'bomb' ||
    stripped.includes('howtomakeabomb') ||
    stripped.includes('makeabomb') ||
    stripped.includes('buildabomb') ||
    stripped.includes('makingbombs') ||
    stripped.includes('buildingbombs') ||
    stripped.includes('bombrecipe') ||
    stripped.includes('bombinstructions') ||
    stripped.includes('instructionsforexplosives') ||
    stripped.includes('pipebomb') ||
    stripped.includes('dynamite') ||
    stripped.includes('explosive');

  if (hasBombOrExplosive) {
    if (!isMusicSlangBomb(text)) {
      return { blocked: true, category: 'illegal_activity' };
    }
  }

  const bombWeaponsConstruction = [
    /\b(how\s+to\s+(make|build|assemble|create|manufacture|detonate))\s+(a\s+)?(bomb|explosive|pipe\s*bomb|ied|c4|dynamite|detonator|grenade|weapon|guns?)\b/i,
    /\b(make|making|build|building|assemble|assembling|create|manufacture|detonate)\s+(a\s+)?(bomb|bombs|pipe\s*bomb|ied|c4|dynamite|detonator|explosives?|explosive\s*devices?)\b/i,
    /\b(recipe|instructions|guide|blueprint|manual)\s+(for|to\s+make|to\s+build)\s+(a\s+)?(bomb|bombs|explosives?|weapons?|guns?)\b/i,
    /\b(bomb|explosives?|weapon)\s+(recipe|instructions?|guide|blueprint|manual)\b/i,
    /\b(buy|buying|acquire|acquiring|sell|selling|purchase)\s+(a\s+)?(bomb|bombs|c4|dynamite|pipe\s*bomb|explosives?)\b/i,
    /\binstructions\s+for\s+(explosives?|weapon\s*construction|weapons?)\b/i,
    /\bweapon\s*construction\b/i,
    /\bclear\s+explosive\/weapon\s+construction\s+request\b/i
  ];

  for (const pat of bombWeaponsConstruction) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      if (!isMusicSlangBomb(text)) {
        return { blocked: true, category: 'illegal_activity' };
      }
    }
  }

  // 2. Weapons / Firearms (pistol, glock, handgun, revolver, shotgun, firearm, rifle, ak47, ar15, ammo, gun, guns, weapon, weapons)
  const hasWeaponsTerm =
    /\b(pistols?|glocks?|handguns?|revolvers?|shotguns?|rifles?|assault\s*rifles?|ar-?15|ak-?47|firearms?|guns?|weapons?|silencers?|suppressors?|ammunition|ammo)\b/i.test(lower) ||
    /\b(pistols?|glocks?|handguns?|revolvers?|shotguns?|rifles?|assault\s*rifles?|ar-?15|ak-?47|firearms?|guns?|weapons?|silencers?|suppressors?|ammunition|ammo)\b/i.test(deobfuscated) ||
    stripped === 'pistol' ||
    stripped === 'gun' ||
    stripped === 'guns' ||
    stripped === 'weapon' ||
    stripped === 'weapons' ||
    stripped.includes('pistol') ||
    stripped.includes('glock') ||
    stripped.includes('handgun') ||
    stripped.includes('shotgun') ||
    stripped.includes('firearm') ||
    stripped.includes('ar15') ||
    stripped.includes('ak47') ||
    stripped.includes('needapistol') ||
    stripped.includes('buyapistol') ||
    stripped.includes('buyagun') ||
    stripped.includes('buyguns') ||
    stripped.includes('buyweapon') ||
    stripped.includes('buyweapons') ||
    stripped.includes('acquireapistol') ||
    stripped.includes('acquireweapons') ||
    stripped.includes('acquiringweapons') ||
    stripped.includes('makeweapons') ||
    stripped.includes('makingweapons');

  if (hasWeaponsTerm) {
    if (!isMusicBandOrArtistWeapon(text)) {
      return { blocked: true, category: 'illegal_activity' };
    }
  }

  const weaponsPatterns = [
    /\b(i\s+need|want\s+to\s+buy|looking\s+to\s+buy|sell\s+me|buy|buying|sell|selling|acquire|acquiring|get|getting|make|making)\s+(a\s+)?(illegal\s+|unregistered\s+|ghost\s+)?(guns?|pistol|glock|handgun|revolver|shotgun|rifle|rifles|assault\s*rifle|ar-?15|ak-?47|firearm|firearms?|weapons?|ammo|ammunition)\b/i,
    /\b(buy|buying|acquire|acquiring|sell|selling|get|need|make|making)\s+(illegal\s+|unregistered\s+|ghost\s+)?(guns?|firearms?|weapons?|ammo|ammunition)\b/i,
    /\b(buying|selling|acquire|acquiring)\s+(illegal\s+)?weapons?\b/i,
    /\b(unregistered|ghost|untraceable|illegal)\s+(guns?|pistols?|firearms?|weapons?)\b/i,
    /\b(smuggle|smuggling|trafficking)\s+(weapons?|guns?|firearms?)\b/i,
    /\b(3d\s*print|manufacture)\s+(a\s+)?(gun|guns|firearm|firearms|pistol|receiver)\b/i
  ];

  for (const pat of weaponsPatterns) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      if (!isMusicBandOrArtistWeapon(text)) {
        return { blocked: true, category: 'illegal_activity' };
      }
    }
  }

  // 3. Violent criminal activity / Hitman / Murder / Kidnap
  const violentCrimePatterns = [
    /\b(violent\s+(crime|criminal\s+activity))\b/i,
    /\b(hire|pay\s+for|find)\s+(a\s+)?(hitman|contract\s*killer|assassin)\b/i,
    /\b(contract\s*to\s*kill|murder\s+for\s+hire|hire\s+someone\s+to\s+kill|pay\s+to\s+kill)\b/i,
    /\b(how\s+to\s+)?(kidnap|abduct)\s+(someone|a\s+person|people)\b/i,
    /\b(mass\s+shooting|terrorist\s+attack)\b/i
  ];

  for (const pat of violentCrimePatterns) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      return { blocked: true, category: 'illegal_activity' };
    }
  }

  // 4. Illegal Drug trafficking, production, buying or selling
  const illegalDrugsPatterns = [
    /\b(cocaines?|heroins?|meth|methamphetamines?|crystal\s*meth|fentanyls?|crack\s*cocaine|lsd|mdma|ecstasy)\b/i,
    /\b(buy|buying|sell|selling|purchase|order|supply|trafficking|smuggling|deal)\s+(cocaine|heroin|meth|methamphetamine|fentanyl|crack\s*cocaine|lsd|mdma|ecstasy|illegal\s*drugs?|drugs)\b/i,
    /\b(cocaine|heroin|meth|methamphetamine|fentanyl)\s+(dealer|supplier|trafficking|supply|shipment|for\s+sale)\b/i,
    /\b(cook|produce|synthesize|manufacture|production)\s+(meth|methamphetamine|fentanyl|crack|illegal\s*drugs?)\b/i,
    /\b(where\s+to\s+buy|want\s+to\s+buy|sell\s+me)\s+(drugs|coke|dope|meth|heroin|fentanyl)\b/i,
    /\b(illegal\s+drugs?|illegal\s+drug\s+production|drug\s+trafficking)\b/i,
    /\bclear\s+illegal\s+drug\s+transaction\/production\s+request\b/i
  ];

  for (const pat of illegalDrugsPatterns) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      return { blocked: true, category: 'illegal_activity' };
    }
  }

  if (
    stripped.includes('cocaine') ||
    stripped.includes('heroin') ||
    stripped.includes('fentanyl') ||
    stripped.includes('buycocaine') ||
    stripped.includes('illegaldrugs') ||
    stripped.includes('violentcriminalactivity')
  ) {
    return { blocked: true, category: 'illegal_activity' };
  }

  return { blocked: false };
}

/**
 * Detects sexually explicit, pornographic, or non-consensual explicit content
 */
export function detectExplicitContent(text: string): { blocked: boolean; category?: ModerationCategory } {
  const { lower, deobfuscated, stripped } = normalizeEvasionText(text);

  // Band exception: Sex Pistols
  if (isMusicBandOrArtistSex(text)) {
    return { blocked: false };
  }

  // 1. Standalone "sex", "porn", "porno", "explicit content", "nudes", or explicit sexual phrases
  const hasExplicitWords =
    /\b(sex|porn|porno|pornography|hardcore\s*porn|softcore\s*porn|porn\s*video|porn\s*pics?|pornographic(\s*content|\s*material|\s*message)?)\b/i.test(lower) ||
    /\b(sex|porn|porno|pornography|hardcore\s*porn|softcore\s*porn|porn\s*video|porn\s*pics?)\b/i.test(deobfuscated) ||
    /\b(nudes?|naked\s*pics?|naked\s*photos?|explicit\s*(photos?|images?|pics?|pictures?|videos?|material|content))\b/i.test(lower) ||
    /\b(obscene(\s*content|\s*message|\s*solicitation)?)\b/i.test(lower) ||
    /\b(requests?\s+to\s+exchange\s+sexual|requests?\s+for\s+explicit\s+images?)\b/i.test(lower) ||
    /\b(non-consensual\s+sexual\s+content|sexually\s+explicit|explicit\s+sexual(\s+message|\s+content|\s+request)?)\b/i.test(lower) ||
    /\b(prostitut(e|es|ion)|hookers?|call\s*girls?|escort\s*service)\b/i.test(lower) ||
    /\b(nsfw\s*(pics?|images?|content)?)\b/i.test(lower);

  if (hasExplicitWords) {
    return { blocked: true, category: 'explicit_content' };
  }

  if (
    stripped === 'sex' ||
    stripped === 'explicitcontent' ||
    stripped.includes('porn') ||
    stripped.includes('porno') ||
    stripped.includes('sendnudes') ||
    stripped.includes('sendporn') ||
    stripped.includes('explicitcontent') ||
    stripped.includes('explicitphotos') ||
    stripped.includes('explicitimages')
  ) {
    return { blocked: true, category: 'explicit_content' };
  }

  // 2. Sexually explicit requests & descriptions
  const explicitSexualPatterns = [
    /\b(send\s+(me\s+)?(nudes?|naked\s+pics?|naked\s+photos?|explicit\s+(photos?|images?|pics?|pictures?|content)|boobs?|tits?|pussy|dick\s*pic|cock))\b/i,
    /\b(show\s+(me\s+)?(your\s+)?(body|boobs?|tits?|pussy|dick|ass|cock|penis|vagina))\b/i,
    /\b(want\s+to\s+|wanna\s+|let'?s\s+)(fuck|have\s+sex|hookup\s+for\s+sex)\b/i,
    /\b(fuck\s+me|fuck\s+you\s+hard|cybersex|dirty\s*talk|cam\s*show|escort\s*service|sexual\s+favors?)\b/i,
    /\b(masturbat(e|ing|ion)|blowjob|handjob|oral\s+sex)\b/i,
    /\b(boobs?|tits?|pussy|dick|cock|penis|vagina|clitoris)\b/i
  ];

  for (const pat of explicitSexualPatterns) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      return { blocked: true, category: 'explicit_content' };
    }
  }

  if (stripped.includes('wannafuck') || stripped.includes('letsfuck') || stripped.includes('fuckme') || stripped.includes('havesex')) {
    return { blocked: true, category: 'explicit_content' };
  }

  return { blocked: false };
}

/**
 * Detects abusive messages, harassment, and personal threats
 */
export function detectHarassmentThreat(text: string): { blocked: boolean; category?: ModerationCategory } {
  const { lower, deobfuscated, stripped } = normalizeEvasionText(text);

  // If text is safe music slang like "kill the beat", allow unless there is also a personal threat:
  if (isMusicSlangKill(text)) {
    if (!/\b(kill|murder|shoot|destroy)\s+(you|your\s+family)\b/i.test(lower)) {
      return { blocked: false };
    }
  }

  const threatAbusePatterns = [
    /\b(serious\s+threat|death\s+threat|threat|threats|harassment)\b/i,
    /\b(i\s+will|i'm\s+gonna|going\s+to)\s+(kill|murder|shoot|stab|beat\s+up|hunt\s+down|destroy)\s+(you|your\s+family)\b/i,
    /\b(die\s+in\s+a\s+fire|kys|go\s+kill\s+yourself|hope\s+you\s+die)\b/i,
    /\b(i\s+will\s+find\s+where\s+you\s+live)\b/i,
    /\b(fucking\s+(idiot|bitch|bastard|cunt|slut|whore|asshole))\b/i,
    /\b(you\s+(are\s+a\s+|r\s+a\s+)?(worthless|disgusting|pathetic)\s+piece\s+of\s+shit)\b/i,
    /\b(piece\s+of\s+shit)\b/i,
    /\bfuck\s+you\b/i,
    /\bharassment\/threat\b/i
  ];

  for (const pat of threatAbusePatterns) {
    if (pat.test(lower) || pat.test(deobfuscated)) {
      return { blocked: true, category: 'harassment_threat' };
    }
  }

  if (stripped.includes('iwillkillyou') || stripped.includes('gokillyourself') || stripped.includes('fuckyou') || stripped.includes('seriousthreat')) {
    return { blocked: true, category: 'harassment_threat' };
  }

  return { blocked: false };
}

/**
 * Returns the official category-specific Safety Reminder title and text
 */
export function getCategorySafetyNotice(category?: ModerationCategory | string): { title: string; message: string; fullNotice: string } {
  switch (category) {
    case 'illegal_activity':
    case 'illegal_dangerous':
      return {
        title: 'Safety Reminder',
        message: 'This message contains content related to illegal or dangerous activity and cannot be sent through Nain Music.',
        fullNotice: 'Safety Reminder — This message contains content related to illegal or dangerous activity and cannot be sent through Nain Music.',
      };
    case 'explicit_content':
    case 'obscene_sexual':
      return {
        title: 'Safety Reminder',
        message: 'Explicit or sexual content is not permitted in Nain Music chat.',
        fullNotice: 'Safety Reminder — Explicit or sexual content is not permitted in Nain Music chat.',
      };
    case 'harassment_threat':
      return {
        title: 'Safety Reminder',
        message: 'Harassment, threats, or abusive content is not permitted in Nain Music chat.',
        fullNotice: 'Safety Reminder — Harassment, threats, or abusive content is not permitted in Nain Music chat.',
      };
    case 'outside_payment':
      return {
        title: 'Safety Reminder',
        message: 'Please keep payments and transactions within Nain Music for your protection.',
        fullNotice: 'Safety Reminder — Please keep payments and transactions within Nain Music for your protection.',
      };
    case 'external_social_link':
    case 'email_address':
    case 'social_dm_link':
      return {
        title: 'Safety Reminder',
        message: 'Please keep payments and transactions within Nain Music for your protection.',
        fullNotice: 'Safety Reminder — Please keep payments and transactions within Nain Music for your protection.',
      };
    case 'suspicious_link':
      return {
        title: 'Safety Reminder',
        message: 'This link was blocked because it appears unsafe.',
        fullNotice: 'Safety Reminder — This link was blocked because it appears unsafe.',
      };
    default:
      return {
        title: 'Safety Reminder',
        message: 'Please keep communications and transactions within Nain Music for your protection.',
        fullNotice: 'Safety Reminder — Please keep communications and transactions within Nain Music for your protection.',
      };
  }
}

/**
 * Context-aware safety and moderation check for chat messages.
 * Carefully avoids flagging standard music terminology (e.g. "drop the bass", "bomb beat",
 * "shoot the video", "killer mix", "fire vocals", "stems", "revisions").
 */
export function checkMessageSafety(text: string): ModerationResult {
  if (!text || !text.trim()) {
    return { action: 'allow' };
  }

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  // -------------------------------------------------------------
  // 1. ILLEGAL & DANGEROUS ACTIVITY CHECK (Highest priority: BLOCK)
  // -------------------------------------------------------------
  const illegalCheck = detectIllegalActivity(cleanText);
  if (illegalCheck.blocked) {
    const notice = getCategorySafetyNotice('illegal_activity');
    return {
      action: 'block',
      category: 'illegal_activity',
      blockedReason: notice.fullNotice,
      warningMessage: notice.fullNotice,
    };
  }

  // -------------------------------------------------------------
  // 2. SEXUAL / EXPLICIT / PORNOGRAPHIC CHECK (BLOCK)
  // -------------------------------------------------------------
  const explicitCheck = detectExplicitContent(cleanText);
  if (explicitCheck.blocked) {
    const notice = getCategorySafetyNotice('explicit_content');
    return {
      action: 'block',
      category: 'explicit_content',
      blockedReason: notice.fullNotice,
      warningMessage: notice.fullNotice,
    };
  }

  // -------------------------------------------------------------
  // 2.5 ABUSE / THREATS / HARASSMENT CHECK (BLOCK)
  // -------------------------------------------------------------
  const harassmentCheck = detectHarassmentThreat(cleanText);
  if (harassmentCheck.blocked) {
    const notice = getCategorySafetyNotice('harassment_threat');
    return {
      action: 'block',
      category: 'harassment_threat',
      blockedReason: notice.fullNotice,
      warningMessage: notice.fullNotice,
    };
  }

  // -------------------------------------------------------------
  // 3. OUTSIDE PAYMENT / TRANSACTION BYPASS CHECK
  // -------------------------------------------------------------
  // Detects intentional attempts to circumvent platform escrow / payments (PayPal, UPI, bank transfer, cash, etc.)
  // Critical protection: Block message BEFORE delivery so it is never delivered or persisted to the other party.
  const outsidePaymentPatterns = [
    /\b(outside|off[-\s]*platform)\s+payment\b/i,
    /\bpayment\s+(outside|off[-\s]*platform)\b/i,
    /\bpay\s+(outside|off[-\s]*platform)\b/i,
    /\boutside\s+payment\b/i,
    /\bpay\s+(me\s+)?(directly|outside|off[-\s]*platform|offline|in\s+cash)\b/i,
    /\bpay\s+(me\s+)?(directly\s+)?(here\s*:\s*)?(on|via|through|using|to)\s+(paypal|venmo|zelle|cashapp|cash\s*app|gpay|google\s*pay|phonepe|paytm|upi|crypto|bitcoin|btc|usdt|bank|wire)\b/i,
    /\b(send|transfer|wire)\s+(me\s+)?(the\s+)?(money|payment|funds|cash|amount)\s+(directly\s+)?(to\s+my|via|through|on)\s+(personal\s+)?(account|bank|upi|gpay|phonepe|paytm|paypal|venmo|zelle|cashapp|crypto|wallet)\b/i,
    /\b(transfer|wire)\s+(directly\s+)?to\s+my\s+(bank|account|upi|phonepe|gpay|paypal)\b/i,
    /\b(avoid|bypass|skip)\s+(nain|platform|fee|escrow|commission)\b/i,
    /\bdeal\s+(outside|off)\s+nain\b/i,
    /\b(don'?t\s+pay\s+on\s+nain|avoid\s+paying\s+on\s+nain)\b/i,
    /\b(direct\s+(bank\s+transfer|wire\s+transfer|upi|paypal|cash\s+payment))\b/i,
    /\b(paypal\.me\/[a-z0-9_-]+)/i,
    /\bpay\s+me\s+(on|via|through|using)\s+paypal\b/i,
    /\bpay\s+directly\s+here\b/i,
    /\b(paypal|venmo|zelle|cashapp|paytm|upi)\b/i
  ];

  for (const pattern of outsidePaymentPatterns) {
    if (pattern.test(lower)) {
      const notice = getCategorySafetyNotice('outside_payment');
      return {
        action: 'block',
        category: 'outside_payment',
        blockedReason: notice.fullNotice,
        warningMessage: notice.fullNotice,
      };
    }
  }

  // -------------------------------------------------------------
  // 3.5 BLOCKED EXTERNAL SOCIAL & MESSAGING LINK CHECK
  // -------------------------------------------------------------
  // Blocks actual links to major social media, messaging, and community platforms
  // before message delivery so conversations/transactions are not moved outside Nain Music.
  const socialLinkCheck = detectBlockedSocialLink(cleanText);
  if (socialLinkCheck.blocked) {
    const notice = getCategorySafetyNotice('external_social_link');
    return {
      action: 'block',
      category: 'external_social_link',
      blockedReason: notice.fullNotice,
      warningMessage: notice.fullNotice,
    };
  }

  // -------------------------------------------------------------
  // 3.6 EMAIL ADDRESS MODERATION (BLOCK ALL EMAIL ADDRESSES)
  // -------------------------------------------------------------
  // Blocks actual email addresses across all providers/domains (generic detection)
  // as well as obfuscated attempts (e.g. name [at] gmail [dot] com) before message delivery.
  const emailCheck = detectEmailAddress(cleanText);
  if (emailCheck.blocked) {
    const notice = getCategorySafetyNotice('email_address');
    return {
      action: 'block',
      category: 'email_address',
      blockedReason: notice.fullNotice,
      warningMessage: notice.fullNotice,
    };
  }

  // -------------------------------------------------------------
  // 4. SUSPICIOUS LINK DETECTION
  // -------------------------------------------------------------
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const matches = cleanText.match(urlRegex);
  if (matches && matches.length > 0) {
    for (const url of matches) {
      const inspection = inspectUrlSafety(url);
      if (!inspection.isSafe) {
        return {
          action: 'warn',
          category: 'suspicious_link',
          hasSuspiciousLink: true,
          warningMessage: 'This link was blocked because it appears unsafe.',
        };
      }
    }
  }

  // Normal message passes without interruption
  return { action: 'allow' };
}

/**
 * Nudge cooldown checker (ensures gentle follow-ups are not sent repeatedly)
 */
export function canSendNudge(lastNudgedAt?: string): { allowed: boolean; waitMinutes?: number } {
  if (!lastNudgedAt) {
    return { allowed: true };
  }
  const lastTime = new Date(lastNudgedAt).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
  const COOLDOWN_MINUTES = 120; // 2 hour cooldown between nudges

  if (diffMinutes < COOLDOWN_MINUTES) {
    return { allowed: false, waitMinutes: COOLDOWN_MINUTES - diffMinutes };
  }
  return { allowed: true };
}

/**
 * Storage helpers for internal administration moderation records
 */
export function getModerationRecords(): ModerationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_MODERATION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveModerationRecord(
  data: Omit<ModerationRecord, 'id' | 'timestamp' | 'status'>
): ModerationRecord {
  const newRecord: ModerationRecord = {
    ...data,
    id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    status: 'pending_review',
  };

  try {
    const records = getModerationRecords();
    records.unshift(newRecord);
    localStorage.setItem(STORAGE_MODERATION_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save moderation record', e);
  }

  return newRecord;
}

export function updateModerationRecordStatus(
  id: string,
  status: 'pending_review' | 'actioned' | 'dismissed'
): void {
  try {
    const records = getModerationRecords();
    const updated = records.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(STORAGE_MODERATION_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update moderation record', e);
  }
}
