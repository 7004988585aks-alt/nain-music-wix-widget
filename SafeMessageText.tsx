import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  UploadCloud, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  Lock, 
  Flag, 
  ShieldCheck 
} from 'lucide-react';
import { inspectUrlSafety } from '../../utils/chatModeration';
import { 
  isCandidateTransferUrl, 
  scanTransferUrlAsync, 
  getCachedTransferScan, 
  TransferScanResult 
} from '../../utils/transferLinkScanner';
import { ChatMessage } from '../../types';

interface SafeMessageTextProps {
  text: string;
  isMe?: boolean;
  message?: ChatMessage;
  onReportMessage?: (message: ChatMessage) => void;
}

/**
 * Dedicated Card Renderer for WeTransfer & TransferNow external transfer links.
 * Enforces: Paste -> Send -> Scanning ("Checking external link...") -> Scan Result -> Approved/Blocked -> Card
 * No scan = No active external link!
 */
const TransferFilesCard: React.FC<{
  rawUrl: string;
  messageContext: string;
  isMe: boolean;
  message?: ChatMessage;
  onReportMessage?: (message: ChatMessage) => void;
}> = ({ rawUrl, messageContext, isMe, message, onReportMessage }) => {
  const [scanResult, setScanResult] = useState<TransferScanResult | null>(() => 
    getCachedTransferScan(rawUrl, messageContext)
  );
  const [isScanning, setIsScanning] = useState<boolean>(!scanResult);
  const [copied, setCopied] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cached = getCachedTransferScan(rawUrl, messageContext);
    if (cached) {
      setScanResult(cached);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    scanTransferUrlAsync(rawUrl, messageContext)
      .then(res => {
        if (isMounted) {
          setScanResult(res);
          setIsScanning(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsScanning(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [rawUrl, messageContext]);

  if (isRemoved) {
    return (
      <div className="my-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[10px] text-slate-400 italic">
        External transfer link removed from view.
      </div>
    );
  }

  const handleCopyLink = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReportLink = () => {
    setHasReported(true);
    if (message && onReportMessage) {
      onReportMessage(message);
    }
  };

  // -------------------------------------------------------------
  // STATE 1: SCANNING (Checking external link...)
  // -------------------------------------------------------------
  if (isScanning || !scanResult) {
    const candidate = isCandidateTransferUrl(rawUrl);
    const serviceName = candidate.serviceName || 'TransferNow';

    return (
      <div 
        className={`my-2 p-3.5 rounded-xl border text-xs space-y-2.5 transition shadow-xs ${
          isMe 
            ? 'bg-amber-600/15 border-amber-600/30 text-slate-900' 
            : 'bg-amber-50/90 border-amber-300 text-slate-800'
        }`}
      >
        {/* Animated Scanning Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            </div>
            <div className="min-w-0">
              <span className={`font-bold text-xs block ${isMe ? 'text-slate-950' : 'text-slate-900'}`}>
                Checking external link…
              </span>
              <span className={`text-[11px] block leading-tight ${isMe ? 'text-slate-900/80' : 'text-amber-800'}`}>
                Please wait while Nain verifies this link for safety.
              </span>
            </div>
          </div>

          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 border border-amber-300 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Verifying
          </span>
        </div>

        {/* Inactive / Non-clickable URL Display */}
        <div className={`p-2 rounded-lg font-mono text-[11px] truncate select-none opacity-80 border ${
          isMe ? 'bg-white/60 border-amber-600/20 text-slate-800' : 'bg-white border-amber-200 text-slate-600'
        }`}>
          {rawUrl}
        </div>

        {/* Disabled Action Button (No scan = No active link) */}
        <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
          <button
            type="button"
            disabled
            className="flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none opacity-80"
            title="Verification in progress... link destination is inactive"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Open on {serviceName} (Disabled during scan)</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: BLOCKED / VERIFICATION FAILED
  // -------------------------------------------------------------
  if (scanResult.status === 'blocked') {
    const isPaymentDiversion = scanResult.blockCategory === 'payment_diversion';

    return (
      <div className="my-2 p-3.5 rounded-xl border bg-rose-50 border-rose-300 text-rose-900 shadow-xs space-y-2.5 animate-in fade-in duration-200">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-xs text-rose-950 block">
              {isPaymentDiversion ? 'Security Alert: Payment Diversion' : 'External Link Hidden'}
            </span>
            <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
              {scanResult.errorMessage || 'This external link could not be verified and has been hidden for your safety.'}
            </p>
          </div>
        </div>

        {/* Hidden / Masked URL (Never clickable) */}
        <div className="p-2 rounded-lg font-mono text-[10px] text-rose-600 bg-white border border-rose-200 line-through select-none truncate">
          [External destination hidden by Nain security]
        </div>

        {/* Options: Remove & Report Link */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-rose-200">
          <span className="text-[10px] text-rose-700">
            {hasReported ? 'Report submitted to moderators' : 'Suspicious link blocked'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRemoved(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition"
              title="Remove this blocked message from view"
            >
              Remove
            </button>

            <button
              type="button"
              onClick={handleReportLink}
              disabled={hasReported}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                hasReported
                  ? 'bg-rose-100 text-rose-400 border-rose-200 cursor-default'
                  : 'text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 border-rose-300'
              }`}
              title="Report this link to Nain moderators"
            >
              <Flag className="w-3 h-3" />
              <span>{hasReported ? 'Reported' : 'Report Link'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: APPROVED (Link checked and approved)
  // -------------------------------------------------------------
  const isWeTransfer = scanResult.serviceName === 'WeTransfer';
  const serviceTitle = isWeTransfer ? 'WeTransfer Project Files' : 'TransferNow Project Files';
  const serviceBadgeColor = isWeTransfer 
    ? 'bg-sky-100 text-sky-800 border-sky-300' 
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div
      className={`my-2 p-3.5 rounded-xl border text-xs space-y-2.5 transition shadow-xs animate-in fade-in duration-200 ${
        isMe
          ? 'bg-amber-600/15 border-amber-600/30 text-slate-900'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Service Header: TransferNow / WeTransfer Project Files */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isMe ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-amber-600 border border-slate-200'}`}>
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={`font-bold text-xs block truncate leading-tight ${isMe ? 'text-slate-950' : 'text-slate-900'}`}>
              {serviceTitle}
            </span>
            <span className={`text-[10px] block font-mono truncate ${isMe ? 'text-slate-800' : 'text-slate-500'}`}>
              {scanResult.canonicalDomain}
            </span>
          </div>
        </div>

        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0 ${serviceBadgeColor}`}>
          {scanResult.serviceName}
        </span>
      </div>

      {/* Actual link display */}
      <div className={`p-2 rounded-lg font-mono text-[11px] truncate select-all border ${
        isMe ? 'bg-white/60 border-amber-600/20 text-slate-950' : 'bg-slate-50 border-slate-200 text-amber-700'
      }`}>
        {rawUrl}
      </div>

      {/* Link Verification Passed Banner */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-bold text-emerald-700">Link checked and approved</span>
        </div>
        <span className="text-[9px] text-emerald-600 font-normal">
          Nain Security Verified
        </span>
      </div>

      {/* Notice about external download & expiry */}
      <div className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${isMe ? 'text-slate-900' : 'text-slate-500'}`}>
        <span className="shrink-0 text-amber-600 font-bold">ℹ️</span>
        <span>
          External file transfer: links typically expire in 3–7 days. Please download files to your local drive promptly.
        </span>
      </div>

      {/* Active Action Buttons: Open on TransferNow / WeTransfer & Copy */}
      <div className="flex items-center gap-2 pt-1 border-t border-current/10">
        <a
          href={scanResult.sanitizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
            isMe
              ? 'bg-slate-900 text-amber-400 hover:bg-slate-800'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
          title={`Open download page on ${scanResult.serviceName}`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Open on {scanResult.serviceName}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
        </a>

        <button
          type="button"
          onClick={() => handleCopyLink(scanResult.sanitizedUrl)}
          className={`p-1.5 px-2.5 rounded-lg font-semibold text-[11px] flex items-center gap-1 border transition ${
            isMe
              ? 'border-slate-900/30 text-slate-900 hover:bg-slate-900/10'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
          title="Copy transfer link to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const SafeMessageText: React.FC<SafeMessageTextProps> = ({ 
  text, 
  isMe = false,
  message,
  onReportMessage 
}) => {
  if (!text) return null;

  // Regex to extract URLs while preserving surrounding text
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);

  if (parts.length <= 1) {
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }

  return (
    <div className="whitespace-pre-wrap break-words space-y-2">
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Reset regex state for fresh match
          urlRegex.lastIndex = 0;

          // Check if candidate for WeTransfer or TransferNow
          const candidateTransfer = isCandidateTransferUrl(part);

          if (candidateTransfer.isCandidate) {
            return (
              <TransferFilesCard
                key={`${index}_${part}`}
                rawUrl={part}
                messageContext={text}
                isMe={isMe}
                message={message}
                onReportMessage={onReportMessage}
              />
            );
          }

          // General URL safety check for other links (YouTube, Spotify, Soundcloud, etc.)
          const inspection = inspectUrlSafety(part);
          let targetUrl = part;
          if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
          }

          if (inspection.isSafe) {
            // Standard safe external link (portfolio, streaming, demo)
            return (
              <a
                key={index}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-semibold underline decoration-1 underline-offset-2 transition px-1 py-0.5 rounded ${
                  isMe
                    ? 'text-slate-950 hover:bg-slate-950/15'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                }`}
                title={`Open verified link (${inspection.domain})`}
              >
                <span>{part}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            );
          }

          // Unsafe / Blocked link
          return (
            <span
              key={index}
              className="block my-1.5 p-2 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-[11px] shadow-sm"
            >
              <span className="flex items-center gap-1.5 font-bold text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="line-through opacity-85 select-none">{part}</span>
                <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded font-mono font-bold text-rose-300 border border-rose-500/30">
                  BLOCKED
                </span>
              </span>
              <span className="block mt-1 text-[10px] text-rose-200/90 font-medium">
                {inspection.reason || 'This link was blocked because it appears unsafe.'}
              </span>
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};
