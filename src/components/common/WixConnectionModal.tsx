import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  Link2, 
  ArrowRight, 
  Layers, 
  X, 
  Code,
  CheckCircle2
} from 'lucide-react';
import { WIX_CONFIG, getWixConnectedAppUrl } from '../../config/wixIntegrationConfig';

interface WixConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRoute?: (view: string, serviceId?: string) => void;
}

export const WixConnectionModal: React.FC<WixConnectionModalProps> = ({
  isOpen,
  onClose,
  onNavigateToRoute,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'routes' | 'dns' | 'architecture'>('routes');

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : WIX_CONFIG.appSubdomainUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Wix Website ↔ Nain Music App Connection
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready for Production
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecting marketing website (<span className="text-amber-300">nain-music.com</span>) to actual marketplace app (<span className="text-amber-300">app.nain-music.com</span>).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-200 bg-slate-50 gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab('routes')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              selectedTab === 'routes'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>CTA Button & Route Mapping ({WIX_CONFIG.routeMappings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('dns')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              selectedTab === 'dns'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>DNS / Subdomain Setup (CNAME)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('architecture')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              selectedTab === 'architecture'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Architecture & Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Route Mappings */}
          {selectedTab === 'routes' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Globe className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">How to connect buttons inside your Wix Website Editor:</p>
                  <p className="text-amber-800 leading-relaxed">
                    Open your Wix Editor &gt; Select any Button (e.g. "Browse Gigs" or "Book a Class") &gt; Click <strong>Link</strong> &gt; Choose <strong>Web Address</strong> &gt; Paste the exact App URL below.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {WIX_CONFIG.routeMappings.map((route, idx) => {
                  const fullUrl = getWixConnectedAppUrl(route.queryParam, WIX_CONFIG.appSubdomainUrl);
                  const previewLocalUrl = getWixConnectedAppUrl(route.queryParam, currentOrigin);

                  return (
                    <div key={idx} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{route.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {route.wixPageLocation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{route.description}</p>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-amber-700 bg-amber-50/70 px-2 py-1 rounded-md border border-amber-100 break-all">
                          <span>{fullUrl}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(`route_${idx}`, fullUrl)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5"
                          title="Copy direct production link for Wix button"
                        >
                          {copiedKey === `route_${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                        
                        <a
                          href={previewLocalUrl}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          title="Test this route directly"
                        >
                          <span>Test Route</span>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DNS & Subdomain Setup */}
          {selectedTab === 'dns' && (
            <div className="space-y-5">
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  <span>Subdomain DNS Configuration ({WIX_CONFIG.dnsSubdomain})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To serve the actual Nain Music marketplace seamlessly at <strong>https://app.nain-music.com</strong> alongside your main Wix website at <strong>https://www.nain-music.com</strong>, add the following CNAME record in your Domain Registrar (GoDaddy, Namecheap, Google Domains, Cloudflare, or Wix DNS):
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-800 text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">Record Type</th>
                        <th className="p-3">Host / Name</th>
                        <th className="p-3">Points to / Value</th>
                        <th className="p-3">TTL</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                      <tr>
                        <td className="p-3 font-bold text-amber-400">CNAME</td>
                        <td className="p-3">app</td>
                        <td className="p-3 text-emerald-400">ghs.googlehosted.com.</td>
                        <td className="p-3 font-sans text-slate-400">3600 (Auto)</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy('cname_val', 'ghs.googlehosted.com.')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans"
                          >
                            {copiedKey === 'cname_val' ? 'Copied' : 'Copy Target'}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Google Cloud Run automatically manages and provisions free TLS/SSL certificates with zero configuration required.
                  </span>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quick 3-Step Setup in Wix / Domain Manager:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">1</span>
                    <h5 className="font-bold text-xs text-slate-900">Manage DNS</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Go to your domain provider or Wix Dashboard &gt; Settings &gt; Domains &gt; Manage DNS Records.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-xs text-slate-900">Add CNAME</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Add a CNAME record with Host <code>app</code> pointing to <code>ghs.googlehosted.com.</code>
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">3</span>
                    <h5 className="font-bold text-xs text-slate-900">Link Wix Buttons</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Set your Wix CTA buttons to point to <code>https://app.nain-music.com/?view=preview&ref=wix</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Architecture & Security */}
          {selectedTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Wix Marketing Layer (Public)</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Marketing landing pages & company info</li>
                    <li>Music Academy & coaching descriptions</li>
                    <li>Permanent visual assets (Logos, cover art)</li>
                    <li>SEO & high-speed static CDN delivery</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <Server className="w-4 h-4 text-amber-600" />
                    <span>Nain Music App Layer (Dedicated)</span>
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>Universal Gig Builder & audio service creator</li>
                    <li>Real-time 1-to-1 studio chat with custom offers</li>
                    <li>80% Seller / 20% Platform fee escrow</li>
                    <li>Secure Google Drive Vault for heavy WAV/stem deliverables</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Direct Subdomain Advantage (Zero Iframe Constraints)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  By using <code>app.nain-music.com</code> rather than an iframe, users get 100% native mobile responsiveness, seamless browser history, fast PayPal/UPI checkout modals, and zero cookie/third-party security restrictions.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Nain Music Architecture • Wix Marketing + Cloud Run Marketplace
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
