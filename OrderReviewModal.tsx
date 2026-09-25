import React, { useState } from 'react';
import { 
  Star, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  MessageSquare, 
  Tag, 
  Package, 
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { Order, GigReview, ReviewSubRatings } from '../../types';

interface OrderReviewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  existingReview?: GigReview;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; color: string }> = {
  5: { title: 'Exceptional (5.0)', subtitle: 'Pristine commercial audio quality, exceeded expectations!', color: 'text-amber-500' },
  4: { title: 'Very Good (4.0)', subtitle: 'High quality work with prompt delivery and good balance.', color: 'text-emerald-500' },
  3: { title: 'Average (3.0)', subtitle: 'Met basic requirements but required extra iterations.', color: 'text-blue-500' },
  2: { title: 'Below Expectations (2.0)', subtitle: 'Issues with sound translation or delayed turnaround.', color: 'text-orange-500' },
  1: { title: 'Poor (1.0)', subtitle: 'Severe audio defects or unfulfilled deliverables.', color: 'text-rose-500' },
};

const SUGGESTED_TAGS = [
  'Pristine 24-bit Audio',
  'Analog Warmth',
  'Radio Ready',
  'Fast Turnaround',
  'Great Communication',
  'Punchy Drums & 808s',
  'Clean Vocal Tuning',
  'Dolby Atmos Ready',
  'Apple Digital Masters'
];

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  existingReview,
}) => {
  const { addOrderReview, updateOrderReview } = useGig();

  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [commRating, setCommRating] = useState<number>(existingReview?.sub_ratings?.communication || 0);
  const [serviceRating, setServiceRating] = useState<number>(existingReview?.sub_ratings?.service_as_described || 0);
  const [qualityRating, setQualityRating] = useState<number>(existingReview?.sub_ratings?.quality_of_delivery || 0);

  const [reviewText, setReviewText] = useState<string>(
    existingReview?.review_text || ''
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags || []
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectStar = (s: number) => {
    setRating(s);
    if (commRating === 0) setCommRating(s);
    if (serviceRating === 0) setServiceRating(s);
    if (qualityRating === 0) setQualityRating(s);
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setValidationError('Please select a star rating (1 to 5 stars) before submitting.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setValidationError('Please provide at least 5 characters of feedback for the seller.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const subRatings: ReviewSubRatings = {
      communication: commRating > 0 ? commRating : rating,
      service_as_described: serviceRating > 0 ? serviceRating : rating,
      quality_of_delivery: qualityRating > 0 ? qualityRating : rating,
    };

    try {
      if (existingReview) {
        updateOrderReview(existingReview.id, reviewText.trim(), rating, subRatings, selectedTags);
      } else {
        addOrderReview({
          order_id: order.id,
          order_number: order.order_number,
          gig_id: order.gig_id,
          seller_id: order.seller_id,
          buyer_name: order.buyer_name,
          buyer_username: order.buyer_username,
          buyer_avatar: order.buyer_avatar,
          buyer_location: order.buyer_location || 'India',
          rating,
          sub_ratings: subRatings,
          review_text: reviewText.trim(),
          package_name: order.package_name,
          package_type: order.package_type,
          price_inr: order.total_price_inr,
          tags: selectedTags,
        });
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Failed to submit review', err);
      setIsSubmitting(false);
      setValidationError('An error occurred while publishing your review. Please try again.');
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = activeRating > 0 
    ? (RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5])
    : { title: '★ Select Your Rating', subtitle: 'Click 1, 2, 3, 4, or 5 stars to rate your experience', color: 'text-slate-600' };

  return (
    <div 
      id="order-review-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="order-review-modal-card"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {existingReview ? 'Edit Your Review' : 'Rate & Review Seller'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  Verified Order
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Feedback for <span className="text-amber-300 font-semibold">{order.seller_name || 'Nain Music'}</span> • Order #{order.order_number}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {existingReview ? 'Review Updated Successfully!' : 'Thank You for Your Feedback!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your verified rating and review have been published to the seller profile and the public gig preview page.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live on Gig Page
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Order Brief Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">{order.package_name}</span>
                  <span className="text-slate-500 text-[11px]">{order.service_name} • Delivered Master</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">₹{order.total_price_inr.toLocaleString('en-IN')}</span>
                <span className="block text-[10px] text-emerald-600 font-medium">Completed</span>
              </div>
            </div>

            {/* Primary Star Rating Selector */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-center space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-600 block">
                Overall Experience Rating
              </span>

              {/* Stars Interactive Row */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating !== null ? hoverRating : rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleSelectStar(star)}
                      className="p-1 text-amber-400 hover:scale-120 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Descriptive Rating Label */}
              <div className="min-h-10 flex flex-col items-center justify-center">
                <span className={`text-sm font-extrabold ${ratingInfo.color}`}>
                  {ratingInfo.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {ratingInfo.subtitle}
                </span>
              </div>
            </div>

            {/* Sub-Criteria Breakdown Ratings (3 categories) */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Detailed Category Ratings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Communication */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Communication</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCommRating(s)}
                        className="text-amber-400 p-0.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${s <= commRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {commRating > 0 ? `${commRating}.0 / 5.0` : '– / 5.0'}
                  </span>
                </div>

                {/* Service as Described */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">As Described</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServiceRating(s)}
                        className="text-amber-400 p-0.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${s <= serviceRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {serviceRating > 0 ? `${serviceRating}.0 / 5.0` : '– / 5.0'}
                  </span>
                </div>

                {/* Audio Sound Quality */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Sound Quality</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQualityRating(s)}
                        className="text-amber-400 p-0.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${s <= qualityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {qualityRating > 0 ? `${qualityRating}.0 / 5.0` : '– / 5.0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Written Review Feedback */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Written Review / Feedback
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {reviewText.length} characters (min 15)
                </span>
              </label>

              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your experience with the sound quality, turnaround time, stem processing, loudness, and communication..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition leading-relaxed resize-none"
              />
            </div>

            {/* Highlight Badges / Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Select Highlights (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-xl transition ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{existingReview ? 'Update Review' : 'Submit Verified Review'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
