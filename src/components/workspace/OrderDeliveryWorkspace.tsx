import React, { useState, useRef } from 'react';
import { 
  Send, 
  UploadCloud, 
  FileAudio, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Download, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  Music,
  Coins,
  Award,
  Plus,
  Trash2,
  X,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { Order, OrderFileAttachment, OrderDelivery } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';
import { FiverrOrderReviewBox } from '../reviews/FiverrOrderReviewBox';
import { storageService } from '../../services/storageService';
import { getDriveAccessToken } from '../../services/googleDriveService';

interface OrderDeliveryWorkspaceProps {
  order: Order;
  viewMode: 'seller' | 'buyer';
  onSubmitDelivery: (orderId: string, deliveryData: { message: string; files: OrderFileAttachment[] }) => void;
  onRequestRevision: (orderId: string, note: string) => void;
  onAcceptDelivery: (orderId: string) => void;
  onSimulateClearingComplete: (orderId: string) => void;
}

export const OrderDeliveryWorkspace: React.FC<OrderDeliveryWorkspaceProps> = ({
  order,
  viewMode,
  onSubmitDelivery,
  onRequestRevision,
  onAcceptDelivery,
  onSimulateClearingComplete
}) => {
  // Delivery form state
  const [deliveryMessage, setDeliveryMessage] = useState(
    'Hi Aarav, here is the finalized commercial master! Mastered to -14 LUFS integrated loudness with pristine stereo width and clean low-end punch. Studio-grade lossless 24-bit 48kHz WAV format is included.'
  );
  const [stagedFiles, setStagedFiles] = useState<OrderFileAttachment[]>([
    {
      id: 'del_file_wav_1',
      name: 'Final_Commercial_Master_24bit_48k.wav',
      size: 58 * 1024 * 1024,
      type: 'audio/wav',
      duration: '3:46',
      uploaded_at: new Date().toISOString(),
      url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
    }
  ]);
  const [isDelivering, setIsDelivering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Revision modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newFile: OrderFileAttachment = {
      id: `del_custom_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'audio/wav',
      duration: 'Studio Master',
      uploaded_at: new Date().toISOString(),
      url: objectUrl,
      storage_provider: getDriveAccessToken() ? 'google_drive' : 'wix_media'
    };
    setStagedFiles(prev => [...prev, newFile]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSampleStem = () => {
    const newFile: OrderFileAttachment = {
      id: `del_stem_${Date.now()}`,
      name: 'Instrumental_Mixdown_Bounce.wav',
      size: 45 * 1024 * 1024,
      type: 'audio/wav',
      duration: '3:46',
      uploaded_at: new Date().toISOString(),
      url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3',
      storage_provider: getDriveAccessToken() ? 'google_drive' : 'wix_media'
    };
    setStagedFiles(prev => [...prev, newFile]);
  };

  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) {
      alert('Please attach at least one audio deliverable file.');
      return;
    }
    setIsDelivering(true);
    setTimeout(() => {
      onSubmitDelivery(order.id, {
        message: deliveryMessage,
        files: stagedFiles
      });
      setIsDelivering(false);
    }, 400);
  };

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) return;
    setIsRequestingRevision(true);
    setTimeout(() => {
      onRequestRevision(order.id, revisionNote.trim());
      setIsRequestingRevision(false);
      setShowRevisionModal(false);
      setRevisionNote('');
    }, 400);
  };

  // Revisions math
  const revisionsAllowed = order.revisions_allowed ?? 3;
  const revisionsUsed = order.revisions_used ?? 0;
  const revisionsRemaining = Math.max(0, revisionsAllowed - revisionsUsed);

  // Deliveries list - strict WAV-only delivery policy: filter out any MP3 deliverables
  const deliveries = (order.deliveries || []).map(deliv => ({
    ...deliv,
    message: deliv.message
      ?.replace(/Both 24-bit 48kHz WAV and 320kbps MP3 versions are included/gi, 'Studio 24-bit 48kHz WAV master is included')
      ?.replace(/and 320kbps MP3 versions are included/gi, 'is included')
      ?.replace(/320kbps MP3/gi, '24-bit WAV')
      ?.replace(/MP3/gi, 'WAV') || deliv.message,
    files: (deliv.files || []).filter(file => {
      const name = (file.name || '').toLowerCase();
      return !name.endsWith('.mp3') && file.type !== 'audio/mpeg' && !name.includes('_320k');
    })
  }));

  return (
    <div className="space-y-6">
      {/* 1. ORDER STATUS BANNER - Order Successfully Completed */}
      {order.status === 'Completed' && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/95 via-slate-950 to-emerald-950/90 p-6 sm:p-7 shadow-xl shadow-emerald-950/40 backdrop-blur-xs">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-90" />

          {/* Hero Content */}
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              {/* Dual-ring Achievement Badge */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Order Finalized
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 font-semibold text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
                    Quality Approved
                  </span>
                  <span className="text-xs text-emerald-300/80 font-medium">Escrow Released</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  Order Successfully Completed
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 leading-relaxed max-w-xl">
                  The buyer accepted the final delivery. Escrow funds have been successfully released and secured for payout.
                </p>
              </div>
            </div>

            {/* Right Status Pill */}
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                Delivered & Completed
              </span>
              <span className="text-xs font-mono text-emerald-400/80 font-medium">Order #{order.order_number}</span>
            </div>
          </div>

          {/* Quick Highlights Strip */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-emerald-900/50">
            <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileAudio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Deliverables</span>
                <span className="text-xs font-bold text-white">Files Approved & Archived</span>
              </div>
            </div>
            <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Escrow Security</span>
                <span className="text-xs font-bold text-emerald-300">100% Released</span>
              </div>
            </div>
            <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Order Value</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {order.pricing_currency === 'USD' ? `$${(order.price_usd || (order.total_price_inr / 100)).toFixed(2)} USD` : `₹${order.total_price_inr.toLocaleString('en-IN')} INR`}
                </span>
              </div>
            </div>
          </div>

          {/* 7-DAY CLEARING PERIOD SECTION (SELLER-ONLY per Section 7 & 11) */}
          {viewMode === 'seller' && (
            <div className="relative mt-5 pt-5 border-t border-emerald-900/60">
              <div className="bg-slate-900/90 border border-emerald-800/40 rounded-xl p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        7-Day Escrow Clearing Period
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {order.clearing_status === 'cleared' ? 'Funds Cleared & Available for Payout' : 'Pending — 7-Day Studio Quality Window'}
                      </h4>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    order.clearing_status === 'cleared'
                      ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-300'
                      : 'bg-amber-900/60 border border-amber-500 text-amber-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${order.clearing_status === 'cleared' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    {order.clearing_status === 'cleared' ? 'Available to Withdraw' : '7-Day Clearing Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs mb-4">
                  <div className="bg-slate-950/90 p-3.5 rounded-lg border border-slate-800/90">
                    <span className="text-slate-400 block mb-1 font-medium">Provider Net (80%)</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      ₹{order.provider_earnings_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Direct into Studio Wallet</span>
                  </div>

                  <div className="bg-slate-950/90 p-3.5 rounded-lg border border-slate-800/90">
                    <span className="text-slate-400 block mb-1 font-medium">Clearing Window</span>
                    <span className="text-lg font-black text-white font-mono">
                      7 Days
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Nain Music Escrow Policy</span>
                  </div>

                  <div className="bg-slate-950/90 p-3.5 rounded-lg border border-slate-800/90">
                    <span className="text-slate-400 block mb-1 font-medium">Ledger Status</span>
                    <span className={`text-base font-bold flex items-center gap-1.5 mt-0.5 ${order.clearing_status === 'cleared' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {order.clearing_status === 'cleared' ? 'Cleared' : 'In Clearing Pipeline'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {order.clearing_status === 'cleared' ? 'Ready for Bank Transfer' : 'Auto-clears in 7 days'}
                    </span>
                  </div>
                </div>

                {order.clearing_status !== 'cleared' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 max-w-md leading-relaxed">
                      Per marketplace policy, provider payout clears 7 days following delivery acceptance to ensure studio audio quality.
                    </span>
                    <button
                      onClick={() => onSimulateClearingComplete(order.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      Simulate 7-Day Clearing Complete
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-emerald-300 flex items-center gap-2 bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-700/60">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-medium">₹{order.provider_earnings_inr.toLocaleString('en-IN')} has cleared! Funds are ready for payout in your Seller Studio Earnings tab.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BUYER CONFIRMATION SECTION */}
          {viewMode === 'buyer' && (
            <div className="relative mt-5 pt-4 border-t border-emerald-900/50">
              <div className="bg-slate-900/80 border border-emerald-800/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">Delivery Approved & Archived</span>
                    <span className="text-emerald-300/80">You have permanent access to all approved master files and deliverables below.</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-semibold">
                  Commercial License Active
                </span>
              </div>
            </div>
          )}

          {/* FIVERR-STYLE ORDER REVIEW & SELLER REPLY (Buyer rates first, seller can only reply) */}
          <div className="relative mt-6 pt-4 border-t border-emerald-900/40">
            <FiverrOrderReviewBox 
              order={order}
              viewMode={viewMode}
            />
          </div>
        </div>
      )}

      {/* 2. REVISION REQUESTED NOTICE - Visible to Seller Only (Requirement 3) */}
      {order.status === 'Revision Requested' && viewMode === 'seller' && (
        <div className="bg-orange-950/40 border border-orange-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="text-base font-bold text-white">
                  Buyer Requested Adjustments
                </h4>
                <div className="text-xs font-mono px-2.5 py-1 bg-orange-900/60 text-orange-200 border border-orange-700/60 rounded-md">
                  Revisions: {revisionsUsed} used / {revisionsRemaining} remaining
                </div>
              </div>

              {order.revision_history && order.revision_history.length > 0 && (
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-orange-200 mt-2">
                  <span className="text-xs text-slate-400 block mb-1">
                    Buyer Note (#{order.revision_history[order.revision_history.length - 1].revision_number}):
                  </span>
                  "{order.revision_history[order.revision_history.length - 1].request_note}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Buyer status card when revision requested */}
      {order.status === 'Revision Requested' && viewMode === 'buyer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Your revision request has been submitted. The provider will review your notes and deliver updated files.</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {revisionsRemaining} revision{revisionsRemaining !== 1 ? 's' : ''} left
          </span>
        </div>
      )}

      {/* 3. DELIVERED SECTION: PREVIOUS DELIVERIES */}
      {deliveries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              Delivered Work ({deliveries.length})
            </h3>
            {order.status === 'Delivered' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold">
                Under Buyer Review
              </span>
            )}
          </div>

          {deliveries.map((deliv) => (
            <div 
              key={deliv.id}
              className="bg-slate-900 border border-purple-900/40 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                    #{deliv.delivery_number}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Delivery by {deliv.seller_name}
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {new Date(deliv.delivered_at).toLocaleString()}
                </span>
              </div>

              {/* Delivery message */}
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                {deliv.message}
              </p>

              {/* Delivered Files */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 block">
                  Delivered Master Files ({deliv.files.length})
                </span>

                {deliv.files.map((file) => {
                  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                  const isAudio = file.type.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3');

                  return (
                    <div key={file.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <FileAudio className="w-5 h-5 text-purple-400 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-white font-mono break-all">
                              {file.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {sizeMb} MB • {file.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                            </div>
                          </div>
                        </div>

                        <a 
                          href={file.url || '#'}
                          download={file.name}
                          onClick={(e) => {
                            if (!file.url || file.url === '#') {
                              e.preventDefault();
                              alert(`Downloading ${file.name} (${sizeMb} MB)`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download ({sizeMb} MB)
                        </a>
                      </div>

                      {/* Audio playback */}
                      {isAudio && file.url && (
                        <div className="pt-2 border-t border-slate-850">
                          <AudioPlayer 
                            src={file.url}
                            title={file.name}
                            artist={deliv.seller_name}
                            compact={true}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Review Actions when Order is in 'Delivered' state */}
              {order.status === 'Delivered' && (
                <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/60 -mx-5 -mb-5 p-4 rounded-b-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Waiting for Buyer Action:</span> Accept master to complete order or request revision.
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                      Request Revision
                    </button>

                    <button
                      onClick={() => onAcceptDelivery(order.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Delivery & Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. SUBMIT DELIVERY FORM (Available when In Progress or Revision Requested) */}
      {(order.status === 'In Progress' || order.status === 'Revision Requested') && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {order.status === 'Revision Requested' ? 'Submit Revised Delivery' : 'Deliver Completed Work'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deliver final mixed & mastered tracks, stems, or project files to the buyer.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              Delivery Section
            </span>
          </div>

          <form onSubmit={handleDeliverySubmit} className="space-y-5">
            {/* Delivery Message */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Delivery Message to Buyer <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={deliveryMessage}
                onChange={(e) => setDeliveryMessage(e.target.value)}
                placeholder="Explain the changes made, loudness specifications (-14 LUFS, true peak), and instructions for playback..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Attached Files List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Audio & Stem Files ({stagedFiles.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddSampleStem}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Instrumental Mixdown
                </button>
              </div>

              <div className="space-y-2">
                {stagedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm">
                    <div className="flex items-center gap-2.5">
                      <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-mono text-slate-200 text-xs sm:text-sm">{file.name}</span>
                      <span className="text-xs text-slate-400">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStagedFile(file.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Upload Dropzone & Delivery File Sources */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl p-5 text-center transition-colors bg-slate-950/40 space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomFileUpload}
                accept="audio/*,.wav,.aif,.aiff,.zip,.rar,.flac"
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 text-amber-400 mx-auto" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Upload Finished Master Files & Stems
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lossless 24-bit 48kHz WAV audio or multi-track ZIP archives (stored securely in Studio Storage).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-950" />
                  <span>Choose WAV / ZIP File</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddSampleStem}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attach Demo Stem</span>
                </button>
              </div>

              {/* Large stems external link guidance */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
                <span>Heavy multi-gigabyte session?</span>
                <a
                  href="https://wetransfer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  WeTransfer
                </a>
                <span>•</span>
                <a
                  href="https://www.transfernow.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  TransferNow
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDelivering || stagedFiles.length === 0}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <Send className="w-4 h-4" />
              {isDelivering ? 'Submitting Delivery to Buyer...' : order.status === 'Revision Requested' ? 'Submit Revised Delivery' : 'Deliver Work'}
            </button>
          </form>
        </div>
      )}

      {/* REVISION REQUEST MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white">Request a Revision</h3>
              </div>
              <button 
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Specify clear, actionable instructions for the music engineer. 
              Remaining revisions available: <strong className="text-white">{revisionsRemaining}</strong>.
            </p>

            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Example: The vocal sits a bit too loud in the chorus, please dip 2.5kHz by 1.5dB and bring up the snare crack slightly..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRequestingRevision || !revisionNote.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isRequestingRevision ? 'Sending...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
