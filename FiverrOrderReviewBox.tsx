import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Clock, 
  Edit3, 
  ThumbsUp, 
  Tag, 
  AlertCircle,
  CornerDownRight,
  UserCheck
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { Order, GigReview, ReviewSubRatings } from '../../types';

interface FiverrOrderReviewBoxProps {
  order: Order;
  viewMode: 'buyer' | 'seller';
  onNavigateToGigPage?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; color: string }> = {
  5: { title: 'Exceptional — Highly Recommended!', color: 'text-amber-500' },
  4: { title: 'Very Good — Satisfied with the service', color: 'text-emerald-500' },
  3: { title: 'Average — Met basic expectations', color: 'text-blue-500' },
  2: { title: 'Poor — Did not meet expectations', color: 'text-orange-500' },
  1: { title: 'Terrible — Very disappointed', color: 'text-rose-500' },
};

const FIVERR_QUICK_TAGS = [
  'Fast Turnaround',
  'Radio-Ready Master',
  'Analog Warmth',
  'Clean Vocals',
  'Punchy Low-End',
  'Great Communication',
  'Went Above & Beyond',
  'Pro Audio Quality',
  'High Fidelity 24-bit'
];

const SELLER_QUICK_RESPONSES = [
  'Thank you so much! It was an absolute pleasure working on your music. Best of luck with the release!',
  'Thanks for the kind feedback! Loved the vibe of your track. Looking forward to our next studio session.',
  'Really appreciate the trust in my studio work! Keep making incredible music.'
];

export const FiverrOrderReviewBox: React.FC<FiverrOrderReviewBoxProps> = ({
  order,
  viewMode,
  onNavigateToGigPage
}) => {
  const { addOrderReview, updateOrderReview, addSellerReviewResponse, reviews } = useGig();

  // Find live review associated with this order (either on order or in global reviews)
  const orderReview: GigReview | undefined = 
    order.buyer_review || reviews.find(r => r.order_id === order.id || r.order_number === order.order_number);

  const hasBuyerReviewed = Boolean(orderReview);

  // Buyer Form State: Star starts at 0 (unfilled) so buyer can choose 1, 2, 3, 4, or 5 stars
  const [isEditingBuyerReview, setIsEditingBuyerReview] = useState(false);
  const [mainRating, setMainRating] = useState<number>(orderReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [commRating, setCommRating] = useState<number>(orderReview?.sub_ratings?.communication || 0);
  const [hoverComm, setHoverComm] = useState<number | null>(null);

  const [serviceRating, setServiceRating] = useState<number>(orderReview?.sub_ratings?.service_as_described || 0);
  const [hoverService, setHoverService] = useState<number | null>(null);

  const [qualityRating, setQualityRating] = useState<number>(orderReview?.sub_ratings?.quality_of_delivery || 0);
  const [hoverQuality, setHoverQuality] = useState<number | null>(null);

  const [reviewText, setReviewText] = useState<string>(
    orderReview?.review_text || ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    orderReview?.tags || []
  );
  const [buyerError, setBuyerError] = useState<string | null>(null);
  const [buyerSuccessNotice, setBuyerSuccessNotice] = useState<string | null>(null);

  // Seller Reply Form State
  const [isReplying, setIsReplying] = useState(false);
  const [isEditingSellerReply, setIsEditingSellerReply] = useState(false);
  const [sellerReplyText, setSellerReplyText] = useState<string>(
    orderReview?.seller_response?.message || ''
  );
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerSuccessNotice, setSellerSuccessNotice] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectMainRating = (star: number) => {
    setMainRating(star);
    // Auto-fill sub-ratings if they were not set yet, buyer can still click & adjust individually
    if (commRating === 0) setCommRating(star);
    if (serviceRating === 0) setServiceRating(star);
    if (qualityRating === 0) setQualityRating(star);
    if (buyerError) setBuyerError(null);
  };

  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mainRating === 0) {
      setBuyerError('Please choose your star rating (e.g. 3, 4, or 5 stars) by clicking on the stars.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setBuyerError('Please write at least 5 characters describing your experience.');
      return;
    }
    setBuyerError(null);

    const subRatings: ReviewSubRatings = {
      communication: commRating > 0 ? commRating : mainRating,
      service_as_described: serviceRating > 0 ? serviceRating : mainRating,
      quality_of_delivery: qualityRating > 0 ? qualityRating : mainRating
    };

    if (orderReview) {
      updateOrderReview(orderReview.id, reviewText.trim(), mainRating, subRatings, selectedTags);
      setBuyerSuccessNotice('Your review has been updated!');
    } else {
      addOrderReview({
        order_id: order.id,
        order_number: order.order_number,
        gig_id: order.gig_id,
        seller_id: order.seller_id,
        buyer_name: order.buyer_name,
        buyer_username: order.buyer_username,
        buyer_avatar: order.buyer_avatar,
        buyer_location: order.buyer_location,
        rating: mainRating,
        sub_ratings: subRatings,
        review_text: reviewText.trim(),
        package_name: order.package_name,
        package_type: order.package_type,
        price_inr: order.total_price_inr,
        tags: selectedTags
      });
      setBuyerSuccessNotice('Thank you! Your public review has been published.');
    }

    setIsEditingBuyerReview(false);
    setTimeout(() => setBuyerSuccessNotice(null), 4000);
  };

  const handleSellerReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerReplyText.trim() || sellerReplyText.trim().length < 5) {
      setSellerError('Please enter at least 5 characters for your reply.');
      return;
    }
    if (!orderReview) {
      setSellerError('Buyer has not reviewed yet. Sellers can only reply after the buyer submits a review.');
      return;
    }
    setSellerError(null);

    addSellerReviewResponse(orderReview.id, sellerReplyText.trim());
    setIsReplying(false);
    setIsEditingSellerReply(false);
    setSellerSuccessNotice('Your seller reply has been posted under the buyer’s review!');
    setTimeout(() => setSellerSuccessNotice(null), 4000);
  };

  // Active displayed star count
  const activeRating = hoverRating !== null ? hoverRating : mainRating;
  const activeComm = hoverComm !== null ? hoverComm : commRating;
  const activeService = hoverService !== null ? hoverService : serviceRating;
  const activeQuality = hoverQuality !== null ? hoverQuality : qualityRating;

  return (
    <div id="fiverr-order-review-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {viewMode === 'buyer' ? 'Public Review & Rating' : 'Buyer Feedback & Seller Response'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Review
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {viewMode === 'buyer' 
                ? 'Rate your studio experience with Nain Music. Select 1 to 5 stars.'
                : 'Buyer rates first. Once submitted, the seller can provide an official text reply.'}
            </p>
          </div>
        </div>

        {hasBuyerReviewed && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{orderReview!.rating}.0 Star Review</span>
            </span>

            {onNavigateToGigPage && (
              <button
                type="button"
                onClick={onNavigateToGigPage}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 ml-1"
              >
                View on Gig Page
              </button>
            )}
          </div>
        )}
      </div>

      {/* SUCCESS NOTICES */}
      {buyerSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{buyerSuccessNotice}</span>
        </div>
      )}
      {sellerSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{sellerSuccessNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCENARIO A: BUYER VIEW - BUYER HAS NOT REVIEWED YET (OR IS EDITING) */}
      {/* ========================================================================= */}
      {viewMode === 'buyer' && (!hasBuyerReviewed || isEditingBuyerReview) && (
        <form onSubmit={handleBuyerSubmit} className="space-y-6">
          
          {/* Main 5-Star Rating block: Clickable 1 to 5 stars, not pre-filled */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  How would you rate your overall experience with Nain Music?
                </label>
                <span className="text-xs text-slate-500">
                  Click on any star to rate: 1, 2, 3, 4, or 5 stars.
                </span>
              </div>

              {mainRating > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMainRating(0);
                    setCommRating(0);
                    setServiceRating(0);
                    setQualityRating(0);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {/* Clickable Stars Row */}
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleSelectMainRating(star)}
                      className="p-1 sm:p-1.5 rounded-xl hover:scale-125 active:scale-90 transition-all cursor-pointer focus:outline-none"
                      title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star 
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                            : 'fill-slate-100 text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Rating Status */}
              <div className="text-center sm:text-left min-w-[200px]">
                {activeRating > 0 ? (
                  <>
                    <span className={`text-base font-extrabold block ${RATING_DESCRIPTIONS[activeRating]?.color || 'text-slate-800'}`}>
                      {activeRating}.0 Star{activeRating > 1 ? 's' : ''} — {RATING_DESCRIPTIONS[activeRating]?.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      Click any star anytime to change rating
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-slate-700 block">
                      ★ Click a star to rate
                    </span>
                    <span className="text-xs text-slate-400">
                      (Not rated yet — select 1 to 5)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Star Selection Buttons (1★, 2★, 3★, 4★, 5★) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectMainRating(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    mainRating === s
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-white hover:bg-amber-50 border border-slate-200 text-slate-700'
                  }`}
                >
                  <Star className={`w-3 h-3 ${mainRating === s ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-500'}`} />
                  <span>{s} Star{s > 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Sub-Ratings: "Detailed Breakdown (3-Criteria Evaluation)" */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Detailed Breakdown (3-Criteria Evaluation)
              </span>
              <span className="text-[11px] text-slate-400">
                Click stars in each box to customize
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Criterion 1: Communication */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Communication</span>
                  <span className="font-mono font-bold text-amber-600">
                    {activeComm > 0 ? `${activeComm}.0 / 5` : '– / 5'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverComm(s)}
                      onMouseLeave={() => setHoverComm(null)}
                      onClick={() => setCommRating(s)}
                      className="p-1 rounded-lg hover:scale-125 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title={`Rate Communication ${s} stars`}
                    >
                      <Star className={`w-5 h-5 transition-colors ${s <= activeComm ? 'fill-amber-400 text-amber-500 drop-shadow-2xs' : 'fill-slate-100 text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {commRating > 0 ? `Selected: ${commRating} Star${commRating > 1 ? 's' : ''}` : 'Click stars to rate communication'}
                </span>
              </div>

              {/* Criterion 2: Service as Described */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Service as Described</span>
                  <span className="font-mono font-bold text-amber-600">
                    {activeService > 0 ? `${activeService}.0 / 5` : '– / 5'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverService(s)}
                      onMouseLeave={() => setHoverService(null)}
                      onClick={() => setServiceRating(s)}
                      className="p-1 rounded-lg hover:scale-125 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title={`Rate Service ${s} stars`}
                    >
                      <Star className={`w-5 h-5 transition-colors ${s <= activeService ? 'fill-amber-400 text-amber-500 drop-shadow-2xs' : 'fill-slate-100 text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {serviceRating > 0 ? `Selected: ${serviceRating} Star${serviceRating > 1 ? 's' : ''}` : 'Click stars to rate service'}
                </span>
              </div>

              {/* Criterion 3: Quality of Delivery */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Quality of Delivery</span>
                  <span className="font-mono font-bold text-amber-600">
                    {activeQuality > 0 ? `${activeQuality}.0 / 5` : '– / 5'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverQuality(s)}
                      onMouseLeave={() => setHoverQuality(null)}
                      onClick={() => setQualityRating(s)}
                      className="p-1 rounded-lg hover:scale-125 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title={`Rate Quality ${s} stars`}
                    >
                      <Star className={`w-5 h-5 transition-colors ${s <= activeQuality ? 'fill-amber-400 text-amber-500 drop-shadow-2xs' : 'fill-slate-100 text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {qualityRating > 0 ? `Selected: ${qualityRating} Star${qualityRating > 1 ? 's' : ''}` : 'Click stars to rate quality'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Highlight Tags (Fiverr Style Chips) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              What went especially well? (Tap tags to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {FIVERR_QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Public Feedback
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {reviewText.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What was it like working with Nain Music? Tell future buyers about audio clarity, responsiveness, turnaround time..."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed shadow-2xs"
              required
            />
            <p className="text-[11px] text-slate-500">
              Your review will appear publicly on the seller’s gig profile with a verified buyer badge.
            </p>
          </div>

          {buyerError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{buyerError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{orderReview ? 'Update Public Review' : 'Submit Review & Rating'}</span>
            </button>

            {isEditingBuyerReview && (
              <button
                type="button"
                onClick={() => setIsEditingBuyerReview(false)}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. SCENARIO B: BUYER VIEW - BUYER HAS ALREADY SUBMITTED THEIR REVIEW */}
      {/* ========================================================================= */}
      {viewMode === 'buyer' && hasBuyerReviewed && !isEditingBuyerReview && (
        <div className="space-y-5">
          {/* Buyer Submitted Review Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-amber-200/80 space-y-4">
            
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src={orderReview!.buyer_avatar || order.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={orderReview!.buyer_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{orderReview!.buyer_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>@{orderReview!.buyer_username}</span>
                    <span>•</span>
                    <span>Order #{order.order_number}</span>
                    <span>•</span>
                    <span>{new Date(orderReview!.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-mono font-bold text-sm text-amber-700">{orderReview!.rating}.0</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingBuyerReview(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Review</span>
                </button>
              </div>
            </div>

            {/* Sub-ratings Breakdown pills */}
            {orderReview!.sub_ratings && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Communication:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span className="font-mono font-bold text-slate-800">{orderReview!.sub_ratings.communication || 5}.0</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Service as Described:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span className="font-mono font-bold text-slate-800">{orderReview!.sub_ratings.service_as_described || 5}.0</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Quality of Delivery:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span className="font-mono font-bold text-slate-800">{orderReview!.sub_ratings.quality_of_delivery || 5}.0</span>
                  </div>
                </div>
              </div>
            )}

            {/* Written text */}
            <p className="text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs italic">
              "{orderReview!.review_text}"
            </p>

            {/* Tags */}
            {orderReview!.tags && orderReview!.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {orderReview!.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SELLER RESPONSE SECTION ON BUYER'S DASHBOARD */}
          <div className="pl-6 border-l-2 border-amber-400 space-y-2">
            <div className="flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Seller Response
              </span>
            </div>

            {orderReview!.seller_response ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Nain Music Studio (Seller)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                      Official Reply
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(orderReview!.seller_response.responded_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed">
                  "{orderReview!.seller_response.message}"
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Waiting for seller reply... Nain Music Studio can post a response to your review.</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700">Pending</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCENARIO C: SELLER VIEW - BUYER HAS NOT REVIEWED YET */}
      {/* (Seller MUST wait for buyer review and CANNOT rate/review first) */}
      {/* ========================================================================= */}
      {viewMode === 'seller' && !hasBuyerReviewed && (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Buyer has not left a review yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Under marketplace rules, the <strong>buyer must rate and review first</strong>. As a seller, you will be able to post an official reply to the buyer’s review as soon as they submit their feedback.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              <span>Waiting for {order.buyer_name} to rate order</span>
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCENARIO D: SELLER VIEW - BUYER HAS REVIEWED, SELLER CAN REPLY */}
      {/* (Seller can ONLY reply with text, nothing else!) */}
      {/* ========================================================================= */}
      {viewMode === 'seller' && hasBuyerReviewed && (
        <div className="space-y-6">
          
          {/* Display Buyer's Review to Seller */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img 
                  src={orderReview!.buyer_avatar || order.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={orderReview!.buyer_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{orderReview!.buyer_name}</span>
                    <span className="text-xs text-slate-400 font-mono">@{orderReview!.buyer_username}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Reviewed on {new Date(orderReview!.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-mono font-bold text-sm text-amber-700">{orderReview!.rating}.0 Stars</span>
              </div>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-200">
              "{orderReview!.review_text}"
            </p>

            {orderReview!.tags && orderReview!.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {orderReview!.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SELLER REPLY FORM OR DISPLAY */}
          <div className="pl-6 border-l-2 border-amber-400 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CornerDownRight className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Your Official Seller Response
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Seller text response only (no star ratings)
              </span>
            </div>

            {/* If seller already replied and not editing */}
            {orderReview!.seller_response && !isEditingSellerReply ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Nain Music Studio (You)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Publicly Visible
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(orderReview!.seller_response.responded_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSellerReplyText(orderReview!.seller_response!.message);
                        setIsEditingSellerReply(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                    >
                      Edit Reply
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed">
                  "{orderReview!.seller_response.message}"
                </p>
              </div>
            ) : (
              /* Seller Reply Form */
              <form onSubmit={handleSellerReplySubmit} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Write your response to {order.buyer_name}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Your response will appear publicly under the buyer's review on your Gig page. Thank the buyer or share your appreciation for the collaboration.
                  </p>
                </div>

                {/* Quick reply templates */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quick Sample Templates:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {SELLER_QUICK_RESPONSES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSellerReplyText(tmpl)}
                        className="text-left text-xs p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-700 transition"
                      >
                        "{tmpl}"
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={sellerReplyText}
                  onChange={(e) => setSellerReplyText(e.target.value)}
                  placeholder="e.g. Thank you so much for the feedback! It was fantastic working on this song with you..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed"
                  required
                />

                {sellerError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{sellerError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{orderReview?.seller_response ? 'Update Reply' : 'Post Reply to Review'}</span>
                  </button>

                  {isEditingSellerReply && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSellerReply(false)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
