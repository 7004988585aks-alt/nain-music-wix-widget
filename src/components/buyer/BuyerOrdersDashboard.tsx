import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  FileAudio, 
  Download, 
  UploadCloud, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Star, 
  Volume2, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  Plus, 
  Trash2, 
  Printer, 
  Sliders,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { AudioPlayer } from '../common/AudioPlayer';
import { OrderInvoiceModal } from '../workspace/OrderInvoiceModal';
import { BuyerGigPreview } from '../preview/BuyerGigPreview';
import { OrderReviewModal } from '../reviews/OrderReviewModal';
import { FiverrOrderReviewBox } from '../reviews/FiverrOrderReviewBox';
import { OrderStatus, OrderFileAttachment, PackageType } from '../../types';

interface BuyerOrdersDashboardProps {
  onNavigateView: (view: 'dashboard' | 'builder' | 'preview') => void;
  onOpenOrderCheckout?: (packageType: PackageType, selectedExtraIds: string[]) => void;
}

export const BuyerOrdersDashboard: React.FC<BuyerOrdersDashboardProps> = ({
  onNavigateView,
  onOpenOrderCheckout
}) => {
  const { 
    orders, 
    selectedOrderId, 
    setSelectedOrderId,
    openChatWithBuyer,
    requestOrderRevision,
    acceptOrderDeliveryAndComplete,
    submitOrderRequirements,
    submitOrderDelivery,
    clearAllOrders,
    loadSampleOrder,
    setViewMode
  } = useGig();

  // Active tab in Buyer Dashboard:
  const [activeTab, setActiveTab] = useState<
    'active_orders' | 'deliveries' | 'requirements' | 'revisions' | 'invoices_chat' | 'marketplace'
  >('active_orders');

  // Currently focused order
  const activeOrder = orders.find(o => o.id === selectedOrderId) || (orders.length > 0 ? orders[0] : null);

  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Revision request modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [revisionTimestamp, setRevisionTimestamp] = useState('01:45');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSuccessMessage, setRevisionSuccessMessage] = useState(false);

  // Approval & Rating modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('Outstanding mix and master! The stereo width is immaculate and the vocal sits right in the pocket.');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalSuccessMessage, setApprovalSuccessMessage] = useState(false);

  // Requirements form state (for orders needing requirements)
  const [reqBrief, setReqBrief] = useState(activeOrder?.requirements_data?.creative_brief || '');
  const [reqReference, setReqReference] = useState(activeOrder?.requirements_data?.reference_track || '');
  const [reqKey, setReqKey] = useState('F# Minor');
  const [reqBpm, setReqBpm] = useState('124');
  const [isSubmittingReqs, setIsSubmittingReqs] = useState(false);
  const [requirementsSuccessAlert, setRequirementsSuccessAlert] = useState(false);

  // Stems list & extra stem upload
  const [newStemName, setNewStemName] = useState('');
  const [extraStems, setExtraStems] = useState<OrderFileAttachment[]>([]);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // If user switched to marketplace tab inside buyer view, render the BuyerGigPreview
  if (activeTab === 'marketplace') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-16 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Nain Music Public Marketplace (Buyer View)</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('active_orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Return to My Orders ({orders.length})</span>
            </button>
          </div>
        </div>
        <BuyerGigPreview 
          onNavigateView={onNavigateView}
          onOpenOrderCheckout={(pkg, extras) => {
            if (onOpenOrderCheckout) {
              onOpenOrderCheckout(pkg, extras);
            }
          }}
        />
      </div>
    );
  }

  const isCompleted = activeOrder?.status === 'Completed';
  const isDelivered = activeOrder?.status === 'Delivered';
  const isInProgress = activeOrder?.status === 'In Progress';
  const isRevisionRequested = activeOrder?.status === 'Revision Requested';
  const isRequirementsNeeded = activeOrder?.status === 'Requirements Needed';

  const deliveries = activeOrder?.deliveries || [];
  const latestDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;

  // Stems displayed in requirements tab
  const baseStems = activeOrder?.requirements_data?.audio_files || [];
  const allStems = [...baseStems, ...extraStems];

  // Handle Requirements Submission
  const handleRequirementsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setIsSubmittingReqs(true);
    const submittedStems: OrderFileAttachment[] = [
      {
        id: `stem_drum_${Date.now()}`,
        name: 'Multitrack_Drums_and_Bass_24bit_48k.zip',
        size: 154 * 1024 * 1024,
        type: 'application/zip',
        uploaded_at: new Date().toISOString(),
        url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
      },
      {
        id: `stem_vox_${Date.now()}`,
        name: 'Lead_and_Backing_Vocals_Tuned_Raw.wav',
        size: 42 * 1024 * 1024,
        type: 'audio/wav',
        duration: '3:45',
        uploaded_at: new Date().toISOString(),
        url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
      }
    ];

    submitOrderRequirements(activeOrder.id, {
      creative_brief: reqBrief.trim() || 'Modern commercial pop-rock mix with tight low-end and crisp vocals.',
      reference_track: reqReference.trim() || 'Modern radio reference track',
      additional_notes: `Key: ${reqKey} • Tempo: ${reqBpm} BPM`,
      submitted_at: new Date().toISOString(),
      audio_files: submittedStems
    });

    setIsSubmittingReqs(false);
    setRequirementsSuccessAlert(true);
    setActiveTab('active_orders');
    setTimeout(() => setRequirementsSuccessAlert(false), 5000);
  };

  // Handle Revision Submission
  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !revisionFeedback.trim()) return;

    setIsSubmittingRevision(true);
    const formattedNote = `[Timestamp ${revisionTimestamp || 'Global'}]: ${revisionFeedback.trim()}`;
    requestOrderRevision(activeOrder.id, formattedNote);
    setIsSubmittingRevision(false);
    setShowRevisionModal(false);
    setRevisionFeedback('');
    setRevisionSuccessMessage(true);
    setTimeout(() => setRevisionSuccessMessage(false), 5000);
  };

  // Handle Order Approval
  const handleApproveSubmit = () => {
    if (!activeOrder) return;
    setIsSubmittingApproval(true);
    acceptOrderDeliveryAndComplete(activeOrder.id, {
      rating,
      review_note: reviewNote.trim()
    });
    setIsSubmittingApproval(false);
    setShowApprovalModal(false);
    setApprovalSuccessMessage(true);
    setTimeout(() => setApprovalSuccessMessage(false), 5000);
  };

  // Handle Adding Additional Stem
  const handleAddStem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStemName.trim()) return;

    const newStem: OrderFileAttachment = {
      id: `stem_user_${Date.now()}`,
      name: newStemName.endsWith('.wav') || newStemName.endsWith('.zip') 
        ? newStemName 
        : `${newStemName.replace(/\s+/g, '_')}_24bit.wav`,
      size: Math.floor(25 * 1024 * 1024 + Math.random() * 30 * 1024 * 1024),
      type: newStemName.endsWith('.zip') ? 'application/zip' : 'audio/wav',
      duration: '3:45',
      uploaded_at: new Date().toISOString()
    };

    setExtraStems(prev => [...prev, newStem]);
    setNewStemName('');
    setUploadSuccessAlert(true);
    setTimeout(() => setUploadSuccessAlert(false), 4000);
  };

  // Simulate Producer Delivery for Test Mode
  const handleSimulateDelivery = () => {
    if (!activeOrder) return;
    submitOrderDelivery(activeOrder.id, {
      message: 'Hello! Your song mix and master has been completed on the analog console. Integrated loudness is set to -14.0 LUFS with -0.8 dBTP ceiling. Included are the 24-bit 48kHz WAV master, 320kbps streaming MP3, and all grouped submix stems.',
      files: [
        {
          id: `del_wav_${Date.now()}`,
          name: 'Final_Commercial_Master_24bit_48k.wav',
          size: 45 * 1024 * 1024,
          type: 'audio/wav',
          duration: '3:45',
          uploaded_at: new Date().toISOString(),
          url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
        },
        {
          id: `del_mp3_${Date.now()}`,
          name: 'Final_Commercial_Master_320k.mp3',
          size: 9 * 1024 * 1024,
          type: 'audio/mpeg',
          duration: '3:45',
          uploaded_at: new Date().toISOString(),
          url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
        },
        {
          id: `del_zip_${Date.now()}`,
          name: 'Processed_Multitrack_Submixes.zip',
          size: 168 * 1024 * 1024,
          type: 'application/zip',
          uploaded_at: new Date().toISOString()
        }
      ]
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Requirements Needed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-300 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Requirements Needed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 border border-blue-300 text-blue-800 animate-pulse">
            <Sliders className="w-3.5 h-3.5" />
            In Progress (Mixing in DAW)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 border border-purple-300 text-purple-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Delivered — Ready for Your Review
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 border border-orange-300 text-orange-800">
            <RotateCcw className="w-3.5 h-3.5" />
            Revision in Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Order Completed & Approved
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Buyer Portal Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">
                  Buyer Orders & Client Studio Hub
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Buyer Account Active
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • Total Orders: <strong className="text-amber-400 font-mono">{orders.length}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">Sarah Jenkins (Artist & Label Client)</strong> • Nain Music Verified Escrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {orders.length > 0 ? (
              <button
                type="button"
                onClick={clearAllOrders}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-medium border border-rose-800 transition"
                title="Clear all orders to test the empty zero state"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Orders (Test Zero State)</span>
                <span className="sm:hidden">Clear</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loadSampleOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 text-xs font-medium border border-emerald-700 transition"
                title="Load sample order to test the active dashboard"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Load Demo Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Explore Nain Music services & packages"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Browse Public Gigs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('seller');
                onNavigateView('dashboard');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-2xs"
              title="Switch back to Seller Studio"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Return to Seller Studio</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Success Alert Banners */}
        {requirementsSuccessAlert && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Requirements Submitted Successfully!</strong>
              <p className="text-emerald-800 mt-0.5">Your stems and creative instructions have been sent to the studio engineer console. The production clock is running.</p>
            </div>
          </div>
        )}

        {revisionSuccessMessage && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 text-orange-900 animate-in fade-in">
            <RotateCcw className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Revision Requested Successfully!</strong>
              <p className="text-orange-800 mt-0.5">Producer Nain Music has been notified of your timestamped notes and is currently revising the mix in the DAW.</p>
            </div>
          </div>
        )}

        {approvalSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Delivery Approved & Order Completed!</strong>
              <p className="text-emerald-800 mt-0.5">Thank you for confirming your order. Your commercial master files and stem licenses are unlocked for worldwide distribution.</p>
            </div>
          </div>
        )}

        {uploadSuccessAlert && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-blue-900 animate-in fade-in">
            <UploadCloud className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Audio Stem Uploaded!</strong>
              <p className="text-blue-800 mt-0.5">Your stems have been securely synced to the studio engineer console.</p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ZERO ORDERS EMPTY STATE (MATCHES FIVERR BUYER DASHBOARD) */}
        {/* ------------------------------------------------------------- */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 text-center shadow-xs space-y-6 max-w-2xl mx-auto my-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                You have no active orders
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Looking for professional audio mixing, analog mastering, vocal tuning, or custom beats? Browse Nain Music's studio gigs to place your order.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>How ordering works on Nain Music (Fiverr Model):</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Pick a verified studio package (Basic, Standard, or Gold Pro).</li>
                <li>Checkout with 100% Escrow Protection via UPI, Cards, or Net Banking.</li>
                <li>Upload your multitrack stems and reference tracks in the Requirements tab.</li>
                <li>Stream the lossless master, request revisions, or accept to complete the order.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('marketplace')}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-md flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Music Services & Order Now</span>
              </button>

              <button
                type="button"
                onClick={loadSampleOrder}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition border border-slate-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Load Sample Order (Test Mode)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* ACTIVE ORDERS BUYER DASHBOARD */
          /* ------------------------------------------------------------- */
          <>
            {/* Order Selector (if multiple orders exist) */}
            {orders.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Order:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {orders.map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                          (activeOrder?.id === o.id)
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{o.order_number}</span>
                        <span className="text-[10px] opacity-80">
                          ({o.package_name || 'Mix & Master'})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Total Orders: <strong className="text-slate-800">{orders.length}</strong>
                </div>
              </div>
            )}

            {/* Primary Order Overview Card */}
            {activeOrder && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        {activeOrder.order_number}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 border border-amber-300 text-amber-900 uppercase">
                        {activeOrder.order_type === 'custom_offer' ? 'Custom Studio Package' : 'Standard Gig Order'}
                      </span>
                      {getStatusBadge(activeOrder.status)}
                      {activeOrder.status === 'Completed' && (
                        <button
                          type="button"
                          onClick={() => setIsReviewModalOpen(true)}
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                          title="Click to view or edit review"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{activeOrder.buyer_review ? `${activeOrder.buyer_review.rating}★ Review` : 'Leave Review'}</span>
                        </button>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">
                      {activeOrder.gig_title || 'Stereo Stem Mixing & Analog Mastering'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Package: <strong className="text-slate-800">{activeOrder.package_name || 'Commercial Radio Master'}</strong> • Producer: <strong className="text-slate-800">Nain Music Studio</strong>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Total Paid (Escrow)</div>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono text-right">
                      {activeOrder.pricing_currency === 'USD' || activeOrder.custom_offer_details?.currency === 'USD' ? (
                        <>
                          <div>
                            ${(activeOrder.custom_offer_details?.offer_amount || activeOrder.custom_offer_details?.price_usd || activeOrder.price_usd || Math.round(activeOrder.total_price_inr / 100)).toFixed(2)} USD
                          </div>
                          <span className="block text-xs font-semibold text-slate-500 font-mono">
                            Base: ₹{activeOrder.total_price_inr.toLocaleString('en-IN')}
                          </span>
                        </>
                      ) : (
                        `₹${activeOrder.total_price_inr.toLocaleString('en-IN')}`
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Secured by Escrow Protection
                    </div>
                  </div>
                </div>

                {/* Studio Milestone Progress Track */}
                <div className="pt-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                    <span>Studio Production Pipeline</span>
                    <span className="text-amber-600 font-bold">
                      {isCompleted ? '100% Completed' : (isDelivered ? '90% Ready for Review' : (isInProgress ? '60% Mixing in DAW' : '30% Requirements Stage'))}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    {/* Step 1 */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-emerald-300 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">1. Order Placed</div>
                        <div className="text-[10px] text-slate-500">Escrow Secured</div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      isRequirementsNeeded 
                        ? 'bg-amber-50 border-amber-300' 
                        : 'bg-slate-50 border-emerald-300'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isRequirementsNeeded ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-emerald-500 text-white'
                      }`}>
                        {isRequirementsNeeded ? '!' : '✓'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">2. Stems / Requirements</div>
                        <div className="text-[10px] text-slate-500">
                          {isRequirementsNeeded ? 'Action Required' : 'Submitted'}
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      isInProgress 
                        ? 'bg-blue-50 border-blue-300' 
                        : (isDelivered || isCompleted || isRevisionRequested ? 'bg-slate-50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60')
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isInProgress ? 'bg-blue-600 text-white animate-spin' : (isDelivered || isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700')
                      }`}>
                        {isInProgress ? '⚙' : (isDelivered || isCompleted ? '✓' : '3')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">3. Studio Mixing</div>
                        <div className="text-[10px] text-slate-500">
                          {isInProgress ? 'In DAW Console' : (isDelivered || isCompleted ? 'Completed' : 'Pending')}
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      isDelivered 
                        ? 'bg-purple-50 border-purple-300 shadow-2xs' 
                        : (isCompleted ? 'bg-slate-50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60')
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDelivered ? 'bg-purple-600 text-white' : (isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700')
                      }`}>
                        {isDelivered ? '★' : (isCompleted ? '✓' : '4')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">4. Review & Approval</div>
                        <div className="text-[10px] text-slate-500">
                          {isDelivered ? 'Deliveries Ready' : (isCompleted ? 'Approved' : 'Pending')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation for 5 Core Buyer Functional Modules */}
            <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('active_orders')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'active_orders'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Active Orders & Milestones</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deliveries')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
                  activeTab === 'deliveries'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileAudio className="w-4 h-4" />
                <span>Delivery Files (Listen & Download)</span>
                {isDelivered && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping ml-1" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('requirements')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'requirements'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Requirements & Audio Stems</span>
                {isRequirementsNeeded && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black ml-1">
                    Action
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('revisions')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'revisions'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revisions & Approval</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('invoices_chat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'invoices_chat'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Invoices & Seller Chat</span>
              </button>
            </div>

            {/* TAB 1: ACTIVE ORDERS & STUDIO STATUS */}
            {activeTab === 'active_orders' && activeOrder && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-amber-600" />
                        Studio Production Status: {activeOrder.status}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Live monitoring updates straight from Nain Music studio room.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openChatWithBuyer('Sarah Jenkins', activeOrder.gig_id, 'buyer')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ask Producer a Question</span>
                    </button>
                  </div>

                  {/* Status Banner */}
                  {isRequirementsNeeded ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Action Required: Stems Needed
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          Please submit your multitrack audio stems and reference songs in the Requirements tab so the producer can begin working.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('requirements')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition"
                      >
                        Submit Stems Now →
                      </button>
                    </div>
                  ) : isDelivered ? (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-300 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                            Order Delivered: Final Files Ready
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          Producer Nain Music has delivered your master files. Please listen to the preview in the Delivery Files tab.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('deliveries')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shrink-0 transition shadow-xs"
                      >
                        Listen & Download Master →
                      </button>
                    </div>
                  ) : isCompleted ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold uppercase text-emerald-800">Order Completed & Approved</div>
                            <p className="text-sm font-semibold text-slate-900">All deliverables have been accepted and commercial licenses unlocked.</p>
                          </div>
                        </div>

                        <a
                          href="#fiverr-order-review-section"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{activeOrder.buyer_review ? 'View Your Review' : 'Rate Your Experience'}</span>
                        </a>
                      </div>

                      {/* Prominent Fiverr Rating & Review Component for Completed Order */}
                      <FiverrOrderReviewBox 
                        order={activeOrder}
                        viewMode="buyer"
                        onNavigateToGigPage={() => onNavigateView('preview')}
                      />
                    </div>
                  ) : isRevisionRequested ? (
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 flex items-center gap-3">
                      <RotateCcw className="w-5 h-5 text-orange-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold uppercase text-orange-800">Revision in Progress</div>
                        <p className="text-sm font-semibold text-slate-900">Producer is applying your timestamped mix feedback in the studio.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Live Studio Activity
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          Producer is currently setting dynamic multiband compression, stereo imaging, and harmonic analog tape warmth.
                        </p>
                        <p className="text-xs text-slate-600">
                          Target Loudness: <strong className="text-slate-900">-14.0 LUFS</strong> • Peak: <strong className="text-slate-900">-0.8 dBTP</strong> • Export: <strong className="text-slate-900">24-bit 48kHz WAV + 320k MP3</strong>
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-amber-200 sm:pl-4 shrink-0">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Estimated Delivery</div>
                        <div className="text-base font-bold text-slate-900">
                          {activeOrder.delivery_days || 4} Days
                        </div>
                        <div className="text-[11px] text-amber-700 font-medium">On Track</div>
                      </div>
                    </div>
                  )}

                  {/* Order Scope Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Selected Service</span>
                      <div className="font-bold text-slate-900 text-sm">
                        {activeOrder.package_name || 'Stem Mixing & Mastering'}
                      </div>
                      <p className="text-slate-500">
                        {activeOrder.package_scope || 'Up to 36 stems with analog bus processing.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Included Deliverables</span>
                      <div className="font-bold text-slate-900 text-sm">Lossless Master + MP3 + Stems</div>
                      <p className="text-slate-500">Ready for Spotify, Apple Music, YouTube & radio.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Revisions Policy</span>
                      <div className="font-bold text-slate-900 text-sm">
                        {activeOrder.revisions_used || 0} used of {activeOrder.revisions_allowed || 3} included
                      </div>
                      <p className="text-slate-500">You can request mix balance adjustments anytime upon delivery.</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('deliveries')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
                    >
                      <FileAudio className="w-4 h-4" />
                      <span>Go to Delivery Files & Audio Player</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('requirements')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      <UploadCloud className="w-4 h-4 text-slate-600" />
                      <span>View / Upload Audio Stems</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DELIVERY FILES (LISTEN & DOWNLOAD) */}
            {activeTab === 'deliveries' && activeOrder && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FileAudio className="w-5 h-5 text-purple-600" />
                        Producer Delivery Files & Interactive Audio Player
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Listen to the high-fidelity master rendered by Nain Music and download the full release package.
                      </p>
                    </div>

                    {latestDelivery ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 border border-purple-200 text-purple-800">
                        Delivery Received ({new Date(latestDelivery.delivered_at).toLocaleDateString()})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-200 text-amber-800">
                        Pending Studio Delivery
                      </span>
                    )}
                  </div>

                  {/* Check if delivery exists */}
                  {!latestDelivery ? (
                    <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <Clock className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">No delivery files uploaded yet</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Producer Nain Music is actively mixing and mastering your stems in the studio. Once your commercial master is ready, the lossless 24-bit 48kHz WAV, streaming MP3, and stem archives will appear here for you to preview and download.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleSimulateDelivery}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simulate Producer Delivery (Test Mode)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openChatWithBuyer('Sarah Jenkins', activeOrder.gig_id, 'buyer')}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition flex items-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message Producer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Master Audio Player Preview */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Volume2 className="w-4 h-4 text-amber-500" />
                            Interactive Studio Player (Lossless 24-bit 48kHz Stream)
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Loudness: -14.1 LUFS • True Peak: -0.8 dBTP
                          </span>
                        </div>

                        <AudioPlayer 
                          title={latestDelivery.files.find(f => f.type.startsWith('audio'))?.name || "Final_Commercial_Master_24bit_48k.wav"}
                          artist="Nain Music Studio Master"
                          hasBeforeAfter={true}
                        />
                      </div>

                      {/* Producer's Message */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="font-bold text-slate-900">Message from Producer Nain Music:</strong>
                          <span className="text-[10px] text-slate-400">
                            {new Date(latestDelivery.delivered_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          "{latestDelivery.message || 'Attached is your final commercial master bounce. Mastered to -14.0 LUFS with -0.8 dBTP ceiling. Stems archive included.'}"
                        </p>
                      </div>

                      {/* Download Deliverables Grid */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Ready for Download ({latestDelivery.files.length} Files)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {latestDelivery.files.map((file) => (
                            <div key={file.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-amber-400 transition">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 text-sm truncate" title={file.name}>
                                    {file.name}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0 ml-1">
                                    {file.type.includes('zip') ? 'Archive' : (file.name.endsWith('.mp3') ? 'MP3' : 'WAV')}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-2">
                                  File size: {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => alert(`Downloading ${file.name}...`)}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-2xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download File</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Buyer Action Footer */}
                      <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs">
                          <h4 className="font-bold text-purple-950 text-sm">Ready to finalize or need adjustments?</h4>
                          <p className="text-purple-800 mt-0.5">
                            If you love the sound, click <strong>Accept Delivery & Complete</strong>. If you want tweaks to vocal volume or EQ, click <strong>Request Revision</strong>.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowRevisionModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                            <span>Request Revision</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowApprovalModal(true)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Delivery & Complete</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* TAB 3: REQUIREMENTS & AUDIO STEMS */}
            {activeTab === 'requirements' && activeOrder && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-amber-600" />
                      Project Requirements & Multitrack Stems
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage the raw audio stems, reference tracks, and creative notes provided to the studio engineer.
                    </p>
                  </div>

                  {/* If requirements are needed, show the submission form */}
                  {isRequirementsNeeded || !activeOrder.requirements_data ? (
                    <form onSubmit={handleRequirementsSubmit} className="space-y-4">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Action Required: Please submit your song requirements to start production</span>
                        </div>
                        <p className="text-xs text-amber-800">
                          Producer Nain Music needs your creative direction and multitrack stems to start mixing. The delivery countdown begins as soon as you submit this form.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          1. Creative Brief & Sound Vision
                        </label>
                        <textarea
                          rows={3}
                          value={reqBrief}
                          onChange={(e) => setReqBrief(e.target.value)}
                          placeholder="e.g. Modern punchy indie-rock mix with upfront lead vocal, analog tape warmth, and tight kick/bass relationship."
                          className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">
                            Reference Track URL
                          </label>
                          <input
                            type="text"
                            value={reqReference}
                            onChange={(e) => setReqReference(e.target.value)}
                            placeholder="e.g. Spotify or YouTube link"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">
                            Musical Key
                          </label>
                          <input
                            type="text"
                            value={reqKey}
                            onChange={(e) => setReqKey(e.target.value)}
                            placeholder="e.g. F# Minor or C Major"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">
                            Tempo (BPM)
                          </label>
                          <input
                            type="text"
                            value={reqBpm}
                            onChange={(e) => setReqBpm(e.target.value)}
                            placeholder="e.g. 124"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800">
                          Audio Stems (Multitrack Archive):
                        </span>
                        <p className="text-xs text-slate-500">
                          Stems will be automatically packaged into 24-bit 48kHz WAV audio archives for the mixing console.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReqs}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSubmittingReqs ? 'Submitting Requirements...' : 'Submit Requirements & Start Order'}</span>
                      </button>
                    </form>
                  ) : (
                    <>
                      {/* Reference Track & Musical Context */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="font-bold text-slate-900 uppercase text-[10px] text-amber-700 tracking-wider">
                            Creative Brief & Direction
                          </span>
                          <p className="text-slate-700 leading-relaxed">
                            "{activeOrder.requirements_data.creative_brief || 'Modern punchy pop-rock mix with tight low-end and crystal-clear lead vocals.'}"
                          </p>
                          <div className="pt-2 border-t border-slate-200 flex items-center gap-4 text-slate-500">
                            <span>Key: <strong className="text-slate-800">{reqKey}</strong></span>
                            <span>•</span>
                            <span>Tempo: <strong className="text-slate-800">{reqBpm} BPM</strong></span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="font-bold text-slate-900 uppercase text-[10px] text-amber-700 tracking-wider">
                            Reference Track
                          </span>
                          <p className="text-slate-700 leading-relaxed">
                            {activeOrder.requirements_data.reference_track || 'Modern commercial streaming reference.'}
                          </p>
                          <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-blue-600">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="underline cursor-pointer">Listen on Reference Playlist</span>
                          </div>
                        </div>
                      </div>

                      {/* Stems List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Uploaded Audio Stems ({allStems.length} Tracks)
                          </h4>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            All Stems Verified 24-bit 48kHz
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                          {allStems.map((stem, idx) => (
                            <div key={stem.id} className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white hover:bg-slate-50 transition">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{stem.name}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {(stem.size / (1024 * 1024)).toFixed(1)} MB • {stem.type}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => alert(`Downloading stem: ${stem.name}`)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add / Upload Stems Form */}
                      <form onSubmit={handleAddStem} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-amber-600" />
                          Upload Additional Stem or Replacement Take
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newStemName}
                            onChange={(e) => setNewStemName(e.target.value)}
                            placeholder="e.g. 05_Acoustic_Guitar_Take2.wav or Synth_Pads.zip"
                            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition shadow-2xs whitespace-nowrap"
                          >
                            Upload Stem
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Accepted formats: WAV, AIFF, FLAC, ZIP (up to 2GB per file).
                        </p>
                      </form>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* TAB 4: REVISIONS & APPROVAL */}
            {activeTab === 'revisions' && activeOrder && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-orange-600" />
                        Revisions & Final Order Approval
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Request specific timestamped adjustments or accept delivery to complete the project and release escrow.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-300 text-amber-800">
                        {(activeOrder.revisions_allowed || 3) - (activeOrder.revisions_used || 0)} Revisions Available
                      </span>
                    </div>
                  </div>

                  {/* Status Dependent View */}
                  {isCompleted ? (
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                        <h4 className="text-base font-bold text-emerald-950">Order Completed & Delivery Approved</h4>
                        <p className="text-xs text-emerald-800 max-w-md mx-auto">
                          You approved the finished delivery. Commercial release rights and stem licenses are unlocked. Escrow funds have been cleared to Producer Nain Music.
                        </p>
                      </div>

                      {/* Fiverr Public Rating & Review Component */}
                      <FiverrOrderReviewBox 
                        order={activeOrder}
                        viewMode="buyer"
                        onNavigateToGigPage={() => onNavigateView('preview')}
                      />
                    </div>
                  ) : isRevisionRequested ? (
                    <div className="p-6 rounded-2xl bg-orange-50 border border-orange-300 text-center space-y-2">
                      <RotateCcw className="w-10 h-10 text-orange-600 mx-auto animate-spin" />
                      <h4 className="text-base font-bold text-orange-950">Revision in Progress</h4>
                      <p className="text-xs text-orange-800 max-w-md mx-auto">
                        Producer Nain Music has received your timestamped instructions and is actively updating the mix in the DAW.
                      </p>
                    </div>
                  ) : !latestDelivery ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">Revisions & Approval will unlock upon Delivery</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Once the studio producer uploads your first mix in the Delivery Files tab, you will be able to either accept the delivery or submit timestamped revision notes.
                      </p>
                    </div>
                  ) : (
                    /* Approval & Revision Actions (Active when delivery exists) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Approval Action Card */}
                      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Option A: Accept Delivery & Complete
                          </div>
                          <p className="text-xs text-emerald-900 leading-relaxed">
                            If the delivered mix meets your musical vision, approve the order. This releases escrow to Nain Music and unlocks full release rights and completion certificates.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowApprovalModal(true)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Complete Order</span>
                        </button>
                      </div>

                      {/* Revision Action Card */}
                      <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
                            <RotateCcw className="w-5 h-5 text-orange-600" />
                            Option B: Request a Mix Revision
                          </div>
                          <p className="text-xs text-orange-900 leading-relaxed">
                            Need a louder chorus vocal, cleaner sub-bass, or snare EQ change? Send detailed timestamped instructions directly to the engineer console.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowRevisionModal(true)}
                          className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Request Mix Revision</span>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Revision History Log */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Revision & Delivery History
                    </h4>

                    <div className="space-y-2">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          v1
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Commercial Master Delivered</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(activeOrder.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">
                            First commercial master bounce rendered by Nain Music Studio with 24-bit 48kHz WAV and 320kbps MP3 exports.
                          </p>
                        </div>
                      </div>

                      {activeOrder.revisions_used && activeOrder.revisions_used > 0 ? (
                        <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 text-xs flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            R1
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Revision Requested by Sarah</span>
                              <span className="text-[11px] text-orange-600 font-semibold">In Progress</span>
                            </div>
                            <p className="text-slate-600 mt-1">
                              "At 01:45 bring up the vocal delay and add more top-end sparkle to the lead vocal."
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: INVOICES & SELLER CHAT */}
            {activeTab === 'invoices_chat' && activeOrder && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        Billing Invoices & 1-to-1 Studio Chat
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Official tax receipts, escrow payment breakdowns, and direct communication channel with Producer Nain Music.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsInvoiceOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Download Tax Invoice (PDF)</span>
                    </button>
                  </div>

                  {/* Chat with Producer Highlight */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Producer Online & Active
                        </span>
                      </div>
                      <h4 className="text-base font-bold">1-to-1 Private Chat with Nain Music Studio</h4>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Share reference songs, ask engineering questions, discuss LUFS standards, or request custom acoustic arrangements.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openChatWithBuyer('Sarah Jenkins', activeOrder.gig_id, 'buyer')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                      <span>Open Live Chat</span>
                    </button>
                  </div>

                  {/* Invoice Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Payment & Escrow Statement (#{activeOrder.order_number})
                    </h4>

                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3 text-xs bg-slate-50/50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-600">Base Service ({activeOrder.package_name || 'Commercial Radio Master'})</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{Math.round(activeOrder.total_price_inr * 0.85).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-600">Lossless Multitrack Stems Addon</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{Math.round(activeOrder.total_price_inr * 0.15).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-600">Platform Escrow Fee & GST (18%)</span>
                        <span className="font-mono text-slate-600">Included in total</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-slate-900">
                        <span>Total Amount Paid (Secured)</span>
                        <span className="font-mono text-base text-amber-600">
                          ₹{activeOrder.total_price_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsInvoiceOpen(true)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold underline"
                    >
                      Click here to view full GST Tax Invoice with SAC Code & Seller GSTIN
                    </button>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* REVISION REQUEST MODAL */}
      {showRevisionModal && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                Request Mix Revision ({activeOrder.order_number})
              </h3>
              <button 
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRevisionSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Timestamp in Song (optional)
                </label>
                <input
                  type="text"
                  value={revisionTimestamp}
                  onChange={(e) => setRevisionTimestamp(e.target.value)}
                  placeholder="e.g. 01:45 or Chorus 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Detailed Revision Instructions:
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="Describe exact adjustments (e.g. bring up vocal by 1.5 dB, reduce harsh sibilance on 'S' sounds, tighten the sub-bass kick)."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
                You have <strong>{(activeOrder.revisions_allowed || 3) - (activeOrder.revisions_used || 0)} revisions remaining</strong>. Submitting this will notify Nain Music to re-open the project in the DAW.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmittingRevision ? 'Sending...' : 'Submit Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL & REVIEW MODAL */}
      {showApprovalModal && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Approve Delivery & Release Escrow
              </h3>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                By approving, you confirm that you have listened to and accepted the delivered masters. Escrow payment will be released to Producer Nain Music.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Rate Your Experience:</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Public Review / Feedback:</label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveSubmit}
                  disabled={isSubmittingApproval}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmittingApproval ? 'Completing...' : 'Approve & Finalize Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {isInvoiceOpen && activeOrder && (
        <OrderInvoiceModal
          order={activeOrder}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

      {/* Comprehensive Order Rating & Review Modal */}
      {isReviewModalOpen && activeOrder && (
        <OrderReviewModal
          order={activeOrder}
          isOpen={isReviewModalOpen}
          existingReview={activeOrder.buyer_review}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

    </div>
  );
};
