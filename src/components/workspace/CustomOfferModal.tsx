import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Clock, 
  RotateCcw, 
  IndianRupee, 
  DollarSign,
  CheckCircle2, 
  Sliders,
  Plus,
  Trash2,
  Lock,
  FileCheck,
  ShieldCheck,
  Music,
  AlertTriangle,
  Eye,
  Edit3,
  Calendar,
  Layers,
  HelpCircle,
  Check,
  FileText
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatCustomOfferAmount, USD_TO_INR_RATE } from '../../data/servicesData';
import { Gig, CustomOffer, Conversation } from '../../types';

interface CustomOfferModalProps {
  gig?: Gig | null;
  conversation?: Conversation | null;
  onClose: () => void;
  onOfferSent?: (offer: CustomOffer) => void;
}

interface ExtraItem {
  id: string;
  name: string;
  price_inr: number;
}

export const CustomOfferModal: React.FC<CustomOfferModalProps> = ({
  gig,
  conversation,
  onClose,
  onOfferSent,
}) => {
  const { 
    services, 
    gigs, 
    selectedCurrency, 
    currentUser, 
    sendCustomOfferInChat,
    createCustomOffer 
  } = useGig();

  // Mode: edit or preview summary
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Selected Service
  const initialServiceId = gig?.service_id || 
    (conversation?.service_name ? services.find(s => s.name.toLowerCase() === conversation.service_name?.toLowerCase())?.id : null) || 
    'mixing-mastering';
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const currentService = services.find(s => s.id === selectedServiceId) || services[0];

  // 1. Buyer Name (editable / prefilled)
  const [buyerName, setBuyerName] = useState(conversation?.buyer_name || '@artist_client');

  // 2. Service / Project Title
  const [customScope, setCustomScope] = useState(
    '5-track EP Multi-Track Mixing & Analog Summing with Vocal Pitch Correction'
  );

  // 3. Detailed Project Description
  const [description, setDescription] = useState(
    `Custom studio package for ${currentService.name} tailored to your upcoming release. Includes multi-track balancing, analog summing, detailed vocal pitch/timing refinement, and delivery of 24-bit WAV master files + clean performance stems.`
  );

  // 4. Custom Price Currency & Value
  const [offerCurrency, setOfferCurrency] = useState<'INR' | 'USD'>('INR');
  const [priceInr, setPriceInr] = useState<number>(5500);
  const [priceUsd, setPriceUsd] = useState<number>(55);

  // 5. Delivery Time / Days
  const [deliveryDays, setDeliveryDays] = useState<number>(5);

  // 6. Number of Revisions
  const [revisions, setRevisions] = useState<number>(3);

  // 7. Included Deliverables (dynamic list)
  const [deliverables, setDeliverables] = useState<string[]>([
    'High-Resolution 24-bit / 48kHz WAV Master',
    'Instrumental & Acapella Performance Stems',
    'Detailed Mix Notes / Documentation & Track EQ Log',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // 8. Optional Extras (dynamic add-ons)
  const [extras, setExtras] = useState<ExtraItem[]>([
    { id: 'ext-1', name: 'Express 48-Hour Priority Delivery', price_inr: 1500 },
    { id: 'ext-2', name: 'Raw DAW Multitrack Session Files (Logic / Pro Tools)', price_inr: 1000 },
  ]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState<number>(1000);

  // 9. Seller Notes / Client Requirements
  const [requirements, setRequirements] = useState<string[]>([
    'Individual dry 24-bit WAV stems exported from bar 1 (zero start time)',
    'Tempo / BPM and musical root key information',
    'Dry vocal audio tracks without baked-in reverb or delay',
    '1-2 commercial streaming reference track links',
  ]);
  const [newRequirementInput, setNewRequirementInput] = useState('');

  // 10. Cancellation / Refund Terms
  const [cancellationTerms, setCancellationTerms] = useState(
    'Full refund if cancelled before studio production begins. 100% satisfaction commitment with included revisions before final milestone completion.'
  );

  // 11. Final Offer Expiry Date
  const [expiryDays, setExpiryDays] = useState<number>(7);

  const [isSuccess, setIsSuccess] = useState(false);

  // Minimum price floor validation (₹1,000 / $10 USD)
  const isBelowFloor = offerCurrency === 'USD' ? Number(priceUsd) < 10 : Number(priceInr) < 1000;

  // Seller Internal Financial Calculations (20% platform fee, 80% provider earnings)
  const effectiveInr = offerCurrency === 'USD' ? Math.round(Number(priceUsd) * USD_TO_INR_RATE) : Number(priceInr);
  const platformFee = Math.round(effectiveInr * 0.20);
  const providerEarnings = effectiveInr - platformFee;

  // Estimated Delivery Date
  const estimatedDeliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Offer Expiry Date
  const calculatedExpiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Deliverable Handlers
  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim()) return;
    setDeliverables(prev => [...prev, newDeliverableInput.trim()]);
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  // Extras Handlers
  const handleAddExtra = () => {
    if (!newExtraName.trim() || Number(newExtraPrice) < 0) return;
    setExtras(prev => [
      ...prev,
      {
        id: `ext_${Date.now()}`,
        name: newExtraName.trim(),
        price_inr: Number(newExtraPrice)
      }
    ]);
    setNewExtraName('');
    setNewExtraPrice(1000);
  };

  const handleRemoveExtra = (id: string) => {
    setExtras(prev => prev.filter(e => e.id !== id));
  };

  // Requirements Handlers
  const handleAddRequirement = () => {
    if (!newRequirementInput.trim()) return;
    setRequirements(prev => [...prev, newRequirementInput.trim()]);
    setNewRequirementInput('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendOffer = () => {
    if (isBelowFloor || !customScope.trim() || !description.trim()) return;
    const associatedGig = gig || gigs.find(g => g.service_id === selectedServiceId) || gigs[0];

    const isUsd = offerCurrency === 'USD';
    const offerAmount = isUsd ? Number(priceUsd) : Number(priceInr);
    const baseInr = isUsd ? Math.round(Number(priceUsd) * USD_TO_INR_RATE) : Math.max(1000, Number(priceInr));
    const calculatedUsd = isUsd ? Number(priceUsd) : Number((baseInr / USD_TO_INR_RATE).toFixed(2));

    const offerPayload: Omit<CustomOffer, 'id' | 'created_at' | 'status'> = {
      seller_id: currentUser.id,
      buyer_name: buyerName.trim() || '@artist_client',
      gig_id: associatedGig.id,
      service_name: currentService.name,
      title: customScope.trim(),
      description: description.trim(),
      currency: offerCurrency,
      pricing_currency: offerCurrency,
      offer_amount: offerAmount,
      price_inr: baseInr,
      price_usd: calculatedUsd,
      delivery_days: Number(deliveryDays),
      revisions: Number(revisions),
      requirements: requirements.filter(r => r.trim().length > 0),
      deliverables: deliverables.filter(d => d.trim().length > 0),
      extras: extras.map(e => ({
        name: e.name,
        price_inr: e.price_inr,
        price_usd: Number((e.price_inr / USD_TO_INR_RATE).toFixed(2)),
        currency: offerCurrency,
        pricing_currency: offerCurrency,
        offer_amount: offerCurrency === 'USD' ? Number((e.price_inr / USD_TO_INR_RATE).toFixed(2)) : e.price_inr
      })),
      seller_notes: requirements.join(' • '),
      cancellation_terms: cancellationTerms.trim(),
      expiry_days: expiryDays,
      expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
    };

    let createdOffer: CustomOffer;

    if (conversation) {
      createdOffer = sendCustomOfferInChat(conversation.id, offerPayload);
    } else {
      createdOffer = createCustomOffer(offerPayload);
    }

    setIsSuccess(true);
    if (onOfferSent) onOfferSent(createdOffer);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Create a Custom Offer</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  Private Studio Offer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tailored direct proposal for <strong className="text-slate-800">{buyerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Edit vs Preview */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Summary Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isSuccess ? (
          activeTab === 'edit' ? (
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
              
              {/* Privacy Guarantee Callout */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  This custom offer will be sent privately in your 1-to-1 chat with <strong>{buyerName}</strong>. It will never appear publicly on marketplace search.
                </span>
              </div>

              {/* 1. Buyer Name & Music Service Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Buyer / Client Name
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. @artist_client"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Music Service Category
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Service / Project Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Service / Project Title (Scope)
                </label>
                <input
                  type="text"
                  value={customScope}
                  onChange={(e) => setCustomScope(e.target.value)}
                  placeholder="e.g. 5-track EP Multi-Track Mixing & Analog Summing with Pitch Correction"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  A concise, clear summary of what will be produced for the client.
                </span>
              </div>

              {/* 3. Detailed Project Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Detailed Project Description & Production Workflow
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the detailed engineering or production workflow..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* 4. Custom Price Currency Selection & Base Inputs */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {offerCurrency === 'USD' ? (
                        <DollarSign className="w-4 h-4 text-amber-600" />
                      ) : (
                        <IndianRupee className="w-4 h-4 text-amber-600" />
                      )}
                      <span>5. Custom Project Price ({offerCurrency === 'USD' ? '$ USD Base' : '₹ INR Base'})</span>
                    </label>
                    <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                      Minimum price floor is ₹1,000 / $10 USD.
                    </span>
                  </div>

                  {/* Currency Toggle Buttons: Rupee (₹) vs Dollar ($) */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setOfferCurrency('INR');
                        if (priceInr < 1000) setPriceInr(5000);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        offerCurrency === 'INR'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <IndianRupee className="w-3 h-3" />
                      <span>Rupee (₹)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfferCurrency('USD');
                        if (priceUsd < 10) setPriceUsd(50);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        offerCurrency === 'USD'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Dollar ($)</span>
                    </button>
                  </div>
                </div>

                {offerCurrency === 'USD' ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min={10}
                        step={1}
                        value={priceUsd}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setPriceUsd(val);
                          setPriceInr(Math.round(val * USD_TO_INR_RATE));
                        }}
                        className={`w-full bg-white border rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none ${
                          isBelowFloor 
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-300' 
                            : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                        }`}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Internal Base: ₹{priceInr.toLocaleString('en-IN')} INR</span>
                      <span className="font-mono font-semibold text-amber-700">${priceUsd.toFixed(2)} USD</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min={1000}
                        step={100}
                        value={priceInr}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setPriceInr(val);
                          setPriceUsd(Number((val / USD_TO_INR_RATE).toFixed(2)));
                        }}
                        className={`w-full bg-white border rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none ${
                          isBelowFloor 
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-300' 
                            : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                        }`}
                        placeholder="e.g. 5000"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Reference: ${(priceInr / USD_TO_INR_RATE).toFixed(2)} USD</span>
                      <span className="font-mono font-semibold text-amber-700">₹{priceInr.toLocaleString('en-IN')} INR</span>
                    </div>
                  </div>
                )}

                {isBelowFloor && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {offerCurrency === 'USD' 
                        ? 'Minimum price floor is $10 USD (₹1,000 INR). Custom offers cannot be submitted below $10.'
                        : 'Minimum price floor is ₹1,000 / $10 USD. Custom offers cannot be submitted below ₹1,000.'}
                    </span>
                  </div>
                )}

                {/* Seller Internal Financial Breakdown: 20% platform fee, 80% provider earnings */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Seller Studio Financials (Private to You):</span>
                    <span className="text-slate-900 font-mono">
                      {offerCurrency === 'USD' 
                        ? `$${priceUsd.toFixed(2)} USD (Base ₹${priceInr.toLocaleString('en-IN')})`
                        : `₹${priceInr.toLocaleString('en-IN')} INR ($${(priceInr / USD_TO_INR_RATE).toFixed(2)} USD)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Nain Music Platform Fee (20%):</span>
                    <span className="font-mono text-slate-700">
                      {offerCurrency === 'USD'
                        ? `-$${(priceUsd * 0.2).toFixed(2)} USD (-₹${Math.round(priceInr * 0.2).toLocaleString('en-IN')})`
                        : `-₹${Math.round(priceInr * 0.2).toLocaleString('en-IN')} (-$${((priceInr * 0.2) / USD_TO_INR_RATE).toFixed(2)})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-700 pt-1 border-t border-slate-100">
                    <span>Your Net Provider Earnings (80%):</span>
                    <span className="font-mono text-emerald-700">
                      {offerCurrency === 'USD'
                        ? `+$${(priceUsd * 0.8).toFixed(2)} USD (+₹${Math.round(priceInr * 0.8).toLocaleString('en-IN')})`
                        : `+₹${Math.round(priceInr * 0.8).toLocaleString('en-IN')} (+$${((priceInr * 0.8) / USD_TO_INR_RATE).toFixed(2)})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 & 6. Delivery Time, Estimated Date, and Revisions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6. Delivery Time & Completion Date
                  </label>
                  <select
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map(d => (
                      <option key={d} value={d}>{d} Days</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    Estimated delivery by {estimatedDeliveryDate}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    7. Number of Revisions Included
                  </label>
                  <select
                    value={revisions}
                    onChange={(e) => setRevisions(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={1}>1 Revision</option>
                    <option value={2}>2 Revisions</option>
                    <option value={3}>3 Revisions</option>
                    <option value={5}>5 Revisions</option>
                    <option value={-1}>Unlimited Revisions</option>
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Post-delivery adjustment rounds included in package.
                  </span>
                </div>
              </div>

              {/* 7. Included Deliverables (dynamic list) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    8. Included Deliverables Checklist
                  </label>
                  <span className="text-[11px] text-slate-500">
                    What client will receive upon completion
                  </span>
                </div>

                <div className="space-y-1.5">
                  {deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove deliverable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add deliverable */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newDeliverableInput}
                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Add deliverable (e.g. Mastered 24-bit WAV, Instrumental WAV, Vocal Stems)..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition border border-slate-200 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    Add
                  </button>
                </div>
              </div>

              {/* 8. Optional Extras (add-ons) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    9. Optional Extras & Studio Add-Ons
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Additional optional deliverables
                  </span>
                </div>

                <div className="space-y-1.5">
                  {extras.map((ext) => (
                    <div key={ext.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-semibold">{ext.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          +{formatCurrency(ext.price_inr, 'INR')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtra(ext.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Remove extra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Extra Input */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                  <input
                    type="text"
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    placeholder="Extra title (e.g. Commercial broadcast rights)..."
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step={100}
                      value={newExtraPrice}
                      onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                      placeholder="Extra Price"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-6 pr-2 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtra}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    Add Extra
                  </button>
                </div>
              </div>

              {/* 9. Seller Notes / Requirements for Client */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    10. Client Requirements Needed Upon Ordering
                  </label>
                  <span className="text-[11px] text-slate-500">
                    What buyer must submit to start
                  </span>
                </div>

                <div className="space-y-1.5">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add requirement input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newRequirementInput}
                    onChange={(e) => setNewRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    placeholder="Add buyer requirement (e.g. Dry vocal audio track, reference tracks)..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition border border-slate-200 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    Add
                  </button>
                </div>
              </div>

              {/* 10. Cancellation & Refund Terms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  11. Cancellation & Refund Terms
                </label>
                <textarea
                  rows={2}
                  value={cancellationTerms}
                  onChange={(e) => setCancellationTerms(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* 11. Final Offer Expiry Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    12. Offer Expiry Period
                  </label>
                  <span className="text-[11px] text-slate-500 block">
                    Offer will automatically close after this timeframe
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value={3}>Expires in 3 Days</option>
                    <option value={5}>Expires in 5 Days</option>
                    <option value={7}>Expires in 7 Days (Recommended)</option>
                    <option value={14}>Expires in 14 Days</option>
                    <option value={30}>Expires in 30 Days</option>
                  </select>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                    Until {calculatedExpiryDate}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* PREVIEW SUMMARY TAB (Exact representation of Offer Card for seller review) */
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Summary Preview Mode:</strong> This is the exact Custom Offer Card that {buyerName} will receive in chat.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="px-2.5 py-1 text-xs font-bold bg-white text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                >
                  Back to Edit
                </button>
              </div>

              {/* Rendered Custom Offer Card Simulation */}
              <div className="bg-white border-2 border-amber-400/80 rounded-2xl shadow-xl overflow-hidden text-slate-800">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 block">
                        Direct Studio Custom Offer
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{currentService.name}</h4>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Valid for {expiryDays} Days
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Scope & Project Specifications
                    </span>
                    <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {customScope}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Offer Description & Terms
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-line">
                      {description}
                    </p>
                  </div>

                  {/* Included Deliverables */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Included Deliverables ({deliverables.length})
                    </span>
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {deliverables.map((del, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included Extras (if any) */}
                  {extras.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Optional Add-Ons Available
                      </span>
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {extras.map((ext) => (
                          <div key={ext.id} className="flex items-center justify-between text-xs text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              {ext.name}
                            </span>
                            <span className="font-mono font-bold text-amber-700">
                              +{offerCurrency === 'USD' ? `$${(ext.price_inr / USD_TO_INR_RATE).toFixed(2)} USD` : `₹${ext.price_inr.toLocaleString('en-IN')} INR`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specs Grid: Price, Delivery Time, Revisions */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase text-slate-500 block font-bold">Custom Price</span>
                      <span className="text-base font-extrabold text-amber-700 font-mono block">
                        {formatCustomOfferAmount(offerCurrency === 'USD' ? priceUsd : priceInr, offerCurrency)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {offerCurrency === 'USD' ? `(Internal Base: ₹${priceInr.toLocaleString('en-IN')})` : `(Ref: $${(priceInr / USD_TO_INR_RATE).toFixed(2)} USD)`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase text-slate-500 block font-bold">Delivery Time</span>
                      <span className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {deliveryDays} Days
                      </span>
                      <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
                        Due: {estimatedDeliveryDate}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase text-slate-500 block font-bold">Revisions</span>
                      <span className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 mt-1">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        {revisions === -1 ? 'Unlimited' : `${revisions} Revisions`}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        Included free
                      </span>
                    </div>
                  </div>

                  {/* Cancellation terms summary */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">Terms & Guarantee:</span>
                      <span>{cancellationTerms}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Custom Offer Sent to {buyerName}!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your tailored proposal of <strong>{formatCustomOfferAmount(offerCurrency === 'USD' ? priceUsd : priceInr, offerCurrency)}</strong> has been submitted into the private 1-to-1 chat. {buyerName} can immediately review, accept & pay, request adjustments, or decline.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition shadow"
            >
              Return to Chat
            </button>
          </div>
        )}

        {/* Modal Footer Actions */}
        {!isSuccess && (
          <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Total Client Price:</span>
              <span className="font-mono font-bold text-amber-700">
                {formatCustomOfferAmount(offerCurrency === 'USD' ? priceUsd : priceInr, offerCurrency)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {offerCurrency === 'USD' ? `(Internal base: ₹${priceInr.toLocaleString('en-IN')} INR)` : `(Ref: $${(priceInr / USD_TO_INR_RATE).toFixed(2)} USD)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isBelowFloor || !customScope.trim() || !description.trim()}
                onClick={handleSendOffer}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl transition shadow flex items-center gap-2 ${
                  isBelowFloor || !customScope.trim() || !description.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Custom Offer to {buyerName}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
