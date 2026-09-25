import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  RotateCcw, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Heart, 
  IndianRupee, 
  Layers, 
  Sparkles, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ExternalLink,
  Edit3,
  Sliders,
  Volume2,
  Briefcase,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { AudioPlayer } from '../common/AudioPlayer';
import { formatCurrency, formatGigPrice } from '../../data/servicesData';
import { PackageType } from '../../types';
import { GigReviewsSection } from '../reviews/GigReviewsSection';

interface BuyerGigPreviewProps {
  onNavigateView: (view: 'dashboard' | 'builder' | 'preview') => void;
  onOpenOrderCheckout: (packageType: PackageType, selectedExtraIds: string[]) => void;
  onOpenCustomOffer?: () => void;
}

export const BuyerGigPreview: React.FC<BuyerGigPreviewProps> = ({
  onNavigateView,
  onOpenOrderCheckout,
}) => {
  const { 
    currentGig: contextGig, 
    currentUser, 
    services, 
    selectedCurrency, 
    openChatWithBuyer, 
    getGigCapacity, 
    gigs, 
    setCurrentGig,
    liveRates,
    reviews
  } = useGig();

  const [selectedPackageType, setSelectedPackageType] = useState<PackageType>('standard');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // If currentGig is null, automatically fall back to the first available gig in the account
  const currentGig = contextGig || (gigs && gigs.length > 0 ? gigs[0] : null);

  React.useEffect(() => {
    if (!contextGig && currentGig) {
      setCurrentGig(currentGig);
    }
  }, [contextGig, currentGig, setCurrentGig]);

  if (!currentGig) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-600 font-medium">No published or draft gigs found in your studio.</p>
        <button
          type="button"
          onClick={() => onNavigateView('dashboard')}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];
  const isMixingAndMastering = currentService.id === 'mixing-mastering';
  const mixingFeatures = isMixingAndMastering ? currentService.features.filter(f => f.portion === 'mixing') : [];
  const masteringFeatures = isMixingAndMastering ? currentService.features.filter(f => f.portion === 'mastering') : [];

  const packagesList = currentGig.has_three_packages
    ? currentGig.packages
    : currentGig.packages.filter(p => p.package_type === 'basic');

  const activePackage = packagesList.find(p => p.package_type === selectedPackageType) || packagesList[0];

  const toggleExtra = (extraId: string) => {
    setSelectedExtraIds(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  // Calculate order total
  const selectedExtrasObj = currentGig.extras.filter(e => selectedExtraIds.includes(e.id));
  const extrasTotalInr = selectedExtrasObj.reduce((sum, e) => sum + e.price_inr, 0);
  const grandTotalInr = activePackage.price_inr + extrasTotalInr;

  // Capacity calculation for this gig
  const capacityInfo = getGigCapacity(currentGig.id);
  const isFullyBooked = capacityInfo ? capacityInfo.isFullyBooked : false;

  const primaryImage = currentGig.media.find(m => m.primary && m.media_type === 'image') || currentGig.media[0];
  const audioShowcase = currentGig.media.find(m => m.media_type === 'audio');

  // Dynamic reviews metrics for this gig
  const gigReviews = reviews.filter(r => !r.gig_id || r.gig_id === currentGig.id);
  const avgRating = gigReviews.length > 0 
    ? (gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length).toFixed(1)
    : (currentUser.rating || 5.0).toFixed(1);
  const reviewsCount = gigReviews.length > 0 ? gigReviews.length : (currentUser.reviews_count || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      
      {/* Top Preview Banner (Seller indicator) */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] shadow-2xs">
              Buyer Preview Mode
            </span>
            <span className="hidden md:inline text-slate-700 font-medium">
              This is how your published Gig appears to prospective artists and buyers.
            </span>

            {/* Gig selector in preview */}
            {gigs.length > 1 && (
              <div className="flex items-center gap-1.5 ml-1 sm:ml-2 bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Gig:</span>
                <select
                  value={currentGig.id}
                  onChange={(e) => {
                    const sel = gigs.find(g => g.id === e.target.value);
                    if (sel) setCurrentGig(sel);
                  }}
                  aria-label="Select Gig to Preview"
                  className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer text-xs max-w-[180px] truncate"
                >
                  {gigs.map(g => {
                    const titleText = g.service_title || 'Music Gig';
                    return (
                      <option key={g.id} value={g.id}>
                        {titleText.length > 30 ? titleText.substring(0, 30) + '...' : titleText}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateView('builder')}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Gig
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <span className="hover:text-slate-800 cursor-pointer">{currentGig.category}</span>
          <span>&gt;</span>
          <span className="hover:text-slate-800 cursor-pointer">{currentService.name}</span>
          <span>&gt;</span>
          <span className="text-amber-600 font-medium">{currentGig.service_type}</span>
        </div>

        {/* Layout: Main content (left) + Packages sticky card (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gig Media, Title, Seller info, Description, FAQs */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                <span className="text-amber-600">I will </span>
                {currentGig.service_title || 'deliver music services for your upcoming release'}
              </h1>
            </div>

            {/* Seller profile strip */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-200 text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium border border-amber-200">
                      PRO
                    </span>
                  </div>
                  <span className="text-slate-500">@{currentUser.username} • {currentUser.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('gig-reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 text-amber-600 font-bold hover:underline transition cursor-pointer"
                  title="Click to view ratings & reviews"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{avgRating}</span>
                  <span className="text-slate-400 font-normal">({reviewsCount})</span>
                </button>

                <div className="hidden sm:block text-slate-500">
                  Response: <strong className="text-slate-800">{currentUser.response_time}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => openChatWithBuyer('Sarah Jenkins', currentGig.id, 'buyer')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-400 transition shadow-2xs"
                  title="Contact seller via private 1-to-1 chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contact Seller</span>
                </button>
              </div>
            </div>

            {/* Media Gallery Showcase */}
            <div className="space-y-4">
              {primaryImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs aspect-video relative">
                  <img
                    src={primaryImage.file_url}
                    alt={primaryImage.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between text-xs text-white">
                    <span className="font-semibold">{primaryImage.title}</span>
                    <span className="text-amber-400 text-[11px] font-medium">Nain Music Studio Verified</span>
                  </div>
                </div>
              )}

              {/* Audio Showcase Player */}
              {audioShowcase && (
                <div className="pt-2">
                  <AudioPlayer
                    title={audioShowcase.title}
                    audioUrl={audioShowcase.file_url}
                    beforeUrl={audioShowcase.audio_before_url}
                    afterUrl={audioShowcase.audio_after_url}
                    hasBeforeAfter={Boolean(audioShowcase.audio_before_url && audioShowcase.audio_after_url)}
                  />
                </div>
              )}
            </div>

            {/* Service Summary Callout */}
            {currentGig.summary && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed italic border-l-4 border-l-amber-500 shadow-xs">
                "{currentGig.summary}"
              </div>
            )}

            {/* About this Gig Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">About This Music Service</h2>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed whitespace-pre-line">
                {currentGig.description || 'No description entered yet.'}
              </div>

              {/* Music Metadata Badges */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  Service Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {currentGig.metadata.genres && currentGig.metadata.genres.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Genres</span>
                      <span className="text-slate-900 font-medium">{currentGig.metadata.genres.join(', ')}</span>
                    </div>
                  )}

                  {currentGig.metadata.target_daw && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">DAW / Host</span>
                      <span className="text-slate-900 font-medium">{currentGig.metadata.target_daw}</span>
                    </div>
                  )}

                  {currentGig.metadata.target_platforms && currentGig.metadata.target_platforms.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Masters</span>
                      <span className="text-slate-900 font-medium">{currentGig.metadata.target_platforms.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mixing & Mastering Dual Package Comparison Matrix */}
            {isMixingAndMastering && currentGig.has_three_packages && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-amber-600" />
                      Package Tier Comparison: Dual Scope
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Clear dual-phase breakdown covering both Multi-Track Mixing and Stereo Mastering.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Includes Both Mix & Master</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-3 font-semibold text-slate-700">Phase & Features</th>
                        {currentGig.packages.map((pkg) => (
                          <th key={pkg.id} className="py-3 px-3 font-bold text-slate-900 text-center min-w-[130px]">
                            <span className="capitalize block">{pkg.package_type}</span>
                            <span className="text-amber-600 text-sm font-mono block">
                              {formatGigPrice(pkg.price_inr, currentGig.pricing_currency, selectedCurrency, liveRates?.rates, pkg.price_usd)}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Mixing Header */}
                      <tr className="bg-blue-50/70">
                        <td colSpan={4} className="py-2 px-3 text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                          1. Mixing Portion (Multi-Track Processing)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Stems / Track Limit</td>
                        {currentGig.packages.map((pkg) => (
                          <td key={pkg.id} className="py-2.5 px-3 text-center text-slate-800 font-mono">
                            {pkg.quantity_scope}
                          </td>
                        ))}
                      </tr>
                      {mixingFeatures.map((feat) => (
                        <tr key={feat.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-700">{feat.name}</td>
                          {currentGig.packages.map((pkg) => {
                            const val = pkg.included_features[feat.id];
                            return (
                              <td key={pkg.id} className="py-2 px-3 text-center">
                                {typeof val === 'boolean' ? (
                                  val ? (
                                    <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )
                                ) : (
                                  <span className="font-mono text-slate-800">{val || '—'}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Mastering Header */}
                      <tr className="bg-amber-50/70">
                        <td colSpan={4} className="py-2 px-3 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          2. Mastering Portion (Final Polish & Loudness)
                        </td>
                      </tr>
                      {masteringFeatures.map((feat) => (
                        <tr key={feat.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-700">{feat.name}</td>
                          {currentGig.packages.map((pkg) => {
                            const val = pkg.included_features[feat.id];
                            return (
                              <td key={pkg.id} className="py-2 px-3 text-center">
                                {typeof val === 'boolean' ? (
                                  val ? (
                                    <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )
                                ) : (
                                  <span className="font-mono text-slate-800">{val || '—'}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Turnaround & Revisions */}
                      <tr className="bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500">Turnaround & Revisions</td>
                        {currentGig.packages.map((pkg) => (
                          <td key={pkg.id} className="py-2.5 px-3 text-center text-slate-700 font-mono text-[11px]">
                            {pkg.delivery_days} days • {pkg.revisions === -1 ? 'Unlimited' : `${pkg.revisions} revs`}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Frequently Asked Questions */}
            {currentGig.faqs.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  Frequently Asked Questions
                </h2>

                <div className="space-y-2.5">
                  {currentGig.faqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-3.5 text-left text-xs font-semibold text-slate-900 flex items-center justify-between hover:bg-slate-100 transition"
                        >
                          <span>{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-amber-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-2 bg-white">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Buyer Requirements Notice */}
            {currentGig.requirements.length > 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs shadow-xs">
                <h3 className="font-bold text-slate-800">What this seller asks after you order:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {currentGig.requirements.map(req => (
                    <li key={req.id}>
                      {req.question} {req.required && <span className="text-amber-600 font-medium">(Required)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* RATINGS & REVIEWS COMPONENT */}
            <GigReviewsSection 
              gigId={currentGig.id} 
              sellerId={currentUser.id} 
            />

          </div>

          {/* Right Column: Sticky Universal Package Selection & Checkout Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                
                {/* Package Tabs: Basic | Standard | Premium */}
                <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50">
                  {packagesList.map((pkg) => {
                    const isSelected = pkg.package_type === selectedPackageType;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageType(pkg.package_type)}
                        className={`py-3 text-xs font-bold capitalize transition border-b-2 ${
                          isSelected
                            ? 'border-amber-500 text-amber-600 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {pkg.package_type}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Package Details */}
                <div className="p-6 space-y-5">
                  
                  {/* Price & Name */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-bold text-slate-900">{activePackage.name}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-600 font-mono">
                          {formatGigPrice(activePackage.price_inr)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activePackage.description}
                    </p>
                  </div>

                  {/* Turnaround & Revisions */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-200 text-xs font-medium">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{activePackage.delivery_days} Days Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>
                        {activePackage.revisions === -1 ? 'Unlimited Revisions' : `${activePackage.revisions} Revisions`}
                      </span>
                    </div>
                  </div>

                  {/* PROJECT CAPACITY STATUS CARD */}
                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isFullyBooked 
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isFullyBooked ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className={isFullyBooked ? 'text-rose-700 font-extrabold' : 'text-slate-900'}>
                          {isFullyBooked ? 'Currently Fully Booked' : 'Project Capacity'}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isFullyBooked
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {isFullyBooked ? '0 Slots Available' : `${capacityInfo?.availableSlots} Slot${capacityInfo && capacityInfo.availableSlots > 1 ? 's' : ''} Available`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Active Studio Workload:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {capacityInfo?.currentActiveProjects} of {capacityInfo?.maxActiveProjects} active projects
                      </span>
                    </div>

                    {isFullyBooked && (
                      <p className="text-[11px] text-rose-700 leading-relaxed pt-1 border-t border-rose-200">
                        This seller is currently handling the maximum number of active projects. Please check again when a project slot becomes available.
                      </p>
                    )}
                  </div>

                  {/* Dual Coverage Guarantee Banner for Mixing & Mastering */}
                  {isMixingAndMastering && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-slate-900 block">Dual Coverage Guarantee</span>
                        <span className="text-slate-600">Covers both <strong>Mixing</strong> & <strong>Mastering</strong> for this song</span>
                      </div>
                    </div>
                  )}

                  {/* Included features matrix for this package */}
                  {isMixingAndMastering ? (
                    <div className="space-y-3 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        What's Included:
                      </span>

                      {/* Mixing Portion */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-blue-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1 uppercase tracking-wider">
                          <Sliders className="w-3 h-3 text-blue-600" />
                          1. Mixing Portion
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-blue-600 stroke-[3] shrink-0" />
                            <span>Scope: <strong>{activePackage.quantity_scope}</strong></span>
                          </li>
                          {mixingFeatures.map(feat => {
                            const val = activePackage.included_features[feat.id];
                            if (!val) return null;
                            return (
                              <li key={feat.id} className="flex items-center gap-2 text-slate-700">
                                <Check className="w-3 h-3 text-blue-600 stroke-[3] shrink-0" />
                                <span>{feat.name}{typeof val !== 'boolean' ? `: ${val} ${feat.unit || ''}` : ''}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Mastering Portion */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-amber-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 uppercase tracking-wider">
                          <Volume2 className="w-3 h-3 text-amber-600" />
                          2. Mastering Portion
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {masteringFeatures.map(feat => {
                            const val = activePackage.included_features[feat.id];
                            if (!val) return null;
                            return (
                              <li key={feat.id} className="flex items-center gap-2 text-slate-700">
                                <Check className="w-3 h-3 text-amber-600 stroke-[3] shrink-0" />
                                <span>{feat.name}{typeof val !== 'boolean' ? `: ${val} ${feat.unit || ''}` : ''}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        What's Included:
                      </span>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-slate-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Scope: <strong>{activePackage.quantity_scope}</strong></span>
                        </li>
                        {currentService.features.map(feat => {
                          const val = activePackage.included_features[feat.id];
                          if (!val) return null;
                          return (
                            <li key={feat.id} className="flex items-center gap-2 text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span>
                                {feat.name} {typeof val !== 'boolean' && `: ${val}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Optional Extras Selector */}
                  {currentGig.extras.filter(e => e.enabled).length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Upgrade with Add-ons:
                      </span>
                      <div className="space-y-2">
                        {currentGig.extras.filter(e => e.enabled).map((extra) => {
                          const isChecked = selectedExtraIds.includes(extra.id);
                          return (
                            <label
                              key={extra.id}
                              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer select-none text-xs transition"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleExtra(extra.id)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 bg-white mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900">{extra.name}</span>
                                  <span className="font-mono text-amber-600 font-bold">
                                    +{formatGigPrice(extra.price_inr, currentGig.pricing_currency, selectedCurrency, liveRates?.rates)}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {extra.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total & Order CTA Button */}
                  <div className="pt-3 space-y-3">
                    {selectedExtraIds.length > 0 && (
                      <div className="flex items-center justify-between text-xs font-mono px-1">
                        <span className="text-slate-500">Total with Extras:</span>
                        <span className="text-base font-bold text-amber-600">
                          {formatGigPrice(grandTotalInr, currentGig.pricing_currency, selectedCurrency, liveRates?.rates)}
                        </span>
                      </div>
                    )}

                    {isFullyBooked ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          Currently Fully Booked
                        </button>

                        <p className="text-[11px] text-center text-rose-700 font-medium">
                          All project slots are taken. Orders will reopen once the seller delivers active work.
                        </p>

                        {/* Available Alternative Music Services */}
                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                            Available Alternative Music Services:
                          </span>
                          <div className="space-y-1.5">
                            {gigs.filter(g => g.id !== currentGig.id && g.status === 'published' && !getGigCapacity(g.id).isFullyBooked).slice(0, 2).map((altGig) => {
                              const altCap = getGigCapacity(altGig.id);
                              return (
                                <button
                                  key={altGig.id}
                                  type="button"
                                  onClick={() => setCurrentGig(altGig)}
                                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-500 text-left transition flex items-center justify-between group shadow-2xs"
                                >
                                  <div className="truncate pr-2">
                                    <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-600 block truncate">
                                      {altGig.service_title}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 block">
                                      ✓ {altCap.availableSlots} slot{altCap.availableSlots > 1 ? 's' : ''} available
                                    </span>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenOrderCheckout(activePackage.package_type, selectedExtraIds)}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Continue ({formatGigPrice(grandTotalInr, currentGig.pricing_currency, selectedCurrency, liveRates?.rates)})
                        </button>

                        <p className="text-[11px] text-center text-slate-500">
                          Order values populate automatically from this package.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Private Contact Seller Chat Link */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => openChatWithBuyer('Sarah Jenkins', currentGig.id, 'buyer')}
                      className="text-xs text-slate-500 hover:text-amber-600 transition flex items-center justify-center gap-1.5 mx-auto py-1"
                      title="Direct private 1-to-1 conversation with the seller"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Contact Seller (Private Chat)
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
