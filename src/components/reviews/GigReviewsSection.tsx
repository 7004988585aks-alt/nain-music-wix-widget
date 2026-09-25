import React, { useState, useMemo } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  SlidersHorizontal, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  CornerDownRight, 
  Reply, 
  Check, 
  Send,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { GigReview, Order } from '../../types';
import { OrderReviewModal } from './OrderReviewModal';

interface GigReviewsSectionProps {
  gigId: string;
  sellerId?: string;
}

export const GigReviewsSection: React.FC<GigReviewsSectionProps> = ({
  gigId,
  sellerId,
}) => {
  const { 
    reviews, 
    orders, 
    toggleReviewHelpful, 
    addSellerReviewResponse,
    viewMode
  } = useGig();

  // Filters & Search
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');

  // Review modal trigger state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<Order | null>(null);

  // Seller Inline Reply State
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Filter reviews for this gig (or all reviews if gigId matches or fallback)
  const gigReviews = useMemo(() => {
    return reviews.filter(r => !r.gig_id || r.gig_id === gigId || r.seller_id === sellerId);
  }, [reviews, gigId, sellerId]);

  // Find completed orders for this buyer to review
  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Completed');
  }, [orders]);

  const unreviewedCompletedOrders = useMemo(() => {
    return completedOrders.filter(o => !o.buyer_review);
  }, [completedOrders]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = gigReviews.length;
    if (total === 0) {
      return {
        avgRating: 5.0,
        totalCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
        subRatings: { comm: 5.0, service: 5.0, quality: 5.0 },
      };
    }

    const sum = gigReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / total).toFixed(2));

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let commSum = 0;
    let serviceSum = 0;
    let qualitySum = 0;

    gigReviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      dist[star] = (dist[star] || 0) + 1;

      if (r.sub_ratings) {
        commSum += r.sub_ratings.communication || r.rating;
        serviceSum += r.sub_ratings.service_as_described || r.rating;
        qualitySum += r.sub_ratings.quality_of_delivery || r.rating;
      } else {
        commSum += r.rating;
        serviceSum += r.rating;
        qualitySum += r.rating;
      }
    });

    const percentages: Record<number, number> = {
      5: Math.round((dist[5] / total) * 100),
      4: Math.round((dist[4] / total) * 100),
      3: Math.round((dist[3] / total) * 100),
      2: Math.round((dist[2] / total) * 100),
      1: Math.round((dist[1] / total) * 100),
    };

    return {
      avgRating: avg,
      totalCount: total,
      distribution: dist,
      percentages,
      subRatings: {
        comm: Number((commSum / total).toFixed(1)),
        service: Number((serviceSum / total).toFixed(1)),
        quality: Number((qualitySum / total).toFixed(1)),
      }
    };
  }, [gigReviews]);

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    return gigReviews
      .filter(r => {
        if (selectedStarFilter !== 'all' && Math.round(r.rating) !== selectedStarFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = r.review_text.toLowerCase().includes(q);
          const matchName = r.buyer_name.toLowerCase().includes(q);
          const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
          const matchPkg = (r.package_name || '').toLowerCase().includes(q);
          if (!matchText && !matchName && !matchTags && !matchPkg) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'highest') {
          return b.rating - a.rating;
        }
        if (sortBy === 'helpful') {
          return b.helpful_count - a.helpful_count;
        }
        return 0;
      });
  }, [gigReviews, selectedStarFilter, searchQuery, sortBy]);

  const handleOpenReviewForOrder = (orderToUse?: Order) => {
    if (orderToUse) {
      setSelectedOrderToReview(orderToUse);
      setIsReviewModalOpen(true);
      return;
    }

    if (unreviewedCompletedOrders.length > 0) {
      setSelectedOrderToReview(unreviewedCompletedOrders[0]);
      setIsReviewModalOpen(true);
    } else if (completedOrders.length > 0) {
      setSelectedOrderToReview(completedOrders[0]);
      setIsReviewModalOpen(true);
    } else {
      // If no completed order exists, pick any order or alert user
      if (orders.length > 0) {
        setSelectedOrderToReview(orders[0]);
        setIsReviewModalOpen(true);
      }
    }
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addSellerReviewResponse(reviewId, replyText.trim());
    setReplyText('');
    setReplyingToReviewId(null);
  };

  const formatReviewDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id="gig-reviews-section" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Ratings & Reviews
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Verified Purchases
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Genuine feedback left by verified artists and labels upon approving delivered masters.
          </p>
        </div>

        {/* Leave Review CTA Button */}
        <div>
          {completedOrders.length > 0 ? (
            <button
              type="button"
              onClick={() => handleOpenReviewForOrder(unreviewedCompletedOrders[0] || completedOrders[0])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs hover:shadow-sm"
              title="Leave or edit a review for your completed order"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>
                {unreviewedCompletedOrders.length > 0 
                  ? 'Review Completed Order' 
                  : 'Review Studio Order'}
              </span>
            </button>
          ) : (
            <div className="text-right">
              <button
                type="button"
                onClick={() => handleOpenReviewForOrder()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                title="Test review workflow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
              <span className="block text-[10px] text-slate-400 mt-1">Available for completed orders</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Scorecards & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Big Overall Score */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
          <div className="text-5xl font-black text-slate-900 tracking-tight font-mono">
            {stats.avgRating.toFixed(1)}
          </div>

          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-5 h-5 ${
                  s <= Math.round(stats.avgRating) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-300'
                }`} 
              />
            ))}
          </div>

          <div className="text-xs font-bold text-slate-700">
            Based on {stats.totalCount} studio reviews
          </div>

          <div className="text-[11px] text-slate-500">
            All reviews from verified orders
          </div>
        </div>

        {/* Center Column: 5-to-1 Star Distribution Progress Bars */}
        <div className="md:col-span-5 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const percentage = stats.percentages[star] || 0;
            const isSelected = selectedStarFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(isSelected ? 'all' : star)}
                className={`w-full flex items-center gap-3 text-xs group text-left p-1 rounded-lg transition ${
                  isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 w-12 font-medium text-slate-600 shrink-0">
                  <span className="font-bold">{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500 group-hover:bg-amber-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-14 text-right text-[11px] text-slate-500 font-mono shrink-0">
                  {count} ({percentage}%)
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Criteria Mini-Meters */}
        <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 text-xs">
          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
            Quality Breakdown
          </span>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Sound Quality</span>
              <span className="font-bold font-mono text-slate-800">{stats.subRatings.quality.toFixed(1)} / 5</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${(stats.subRatings.quality / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Communication</span>
              <span className="font-bold font-mono text-slate-800">{stats.subRatings.comm.toFixed(1)} / 5</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${(stats.subRatings.comm / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>As Described</span>
              <span className="font-bold font-mono text-slate-800">{stats.subRatings.service.toFixed(1)} / 5</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${(stats.subRatings.service / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unreviewed Orders Callout Banner (if buyer has orders waiting for feedback) */}
      {unreviewedCompletedOrders.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950 block">
                You have {unreviewedCompletedOrders.length} completed order{unreviewedCompletedOrders.length > 1 ? 's' : ''} ready to review!
              </span>
              <span className="text-amber-800 text-[11px]">
                Order #{unreviewedCompletedOrders[0].order_number} ({unreviewedCompletedOrders[0].package_name}) was finalized. Help the audio community with your feedback.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenReviewForOrder(unreviewedCompletedOrders[0])}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shrink-0 shadow-2xs"
          >
            Leave Review Now
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by keyword, artist, or tags..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedStarFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                selectedStarFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({gigReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStarFilter(5)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                selectedStarFilter === 5
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>5★</span>
              <span className="text-[10px] text-slate-400 font-mono">({stats.distribution[5] || 0})</span>
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-amber-500"
            aria-label="Sort reviews"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Active Filter Clear indicator */}
      {(selectedStarFilter !== 'all' || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span>
            Showing {displayedReviews.length} of {gigReviews.length} reviews
            {selectedStarFilter !== 'all' && ` (${selectedStarFilter} Stars only)`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedStarFilter('all');
              setSearchQuery('');
            }}
            className="text-amber-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No reviews found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or star rating filter.
            </p>
          </div>
        ) : (
          displayedReviews.map((review) => (
            <div 
              key={review.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-slate-300 transition"
            >
              {/* Review Card Top Meta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={review.buyer_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{review.buyer_name}</h4>
                      <span className="text-[10px] text-slate-400">@{review.buyer_username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{review.buyer_location || 'India'}</span>
                      <span>•</span>
                      <span className="font-mono">{formatReviewDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-200'
                        }`} 
                      />
                    ))}
                    <span className="text-xs font-mono font-bold text-slate-700 ml-1">
                      {review.rating}.0
                    </span>
                  </div>

                  {/* Verified Studio Order Tag */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified: {review.package_name || 'Studio Order'}</span>
                  </span>
                </div>
              </div>

              {/* Review Text Body */}
              <p className="text-xs text-slate-700 leading-relaxed">
                {review.review_text}
              </p>

              {/* Highlight Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Seller Official Response (if present) */}
              {review.seller_response && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                      <span>Response from Seller ({review.seller_id === 'usr_nain_9281' ? 'Devon SoundLab' : 'Nain Music'})</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-mono">
                      {formatReviewDate(review.seller_response.responded_at)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 pl-5 leading-relaxed">
                    {review.seller_response.message}
                  </p>
                </div>
              )}

              {/* Inline Seller Reply Editor (when in seller view and review has no response) */}
              {viewMode === 'seller' && !review.seller_response && (
                <div className="pt-2 border-t border-slate-100">
                  {replyingToReviewId === review.id ? (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Write Response as Seller:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToReviewId(null);
                            setReplyText('');
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank the buyer and mention specifics about their mix or song..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendReply(review.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs transition shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish Response</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToReviewId(review.id);
                        setReplyText('');
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-medium transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply to this review</span>
                    </button>
                  )}
                </div>
              )}

              {/* Review Card Footer: Helpful Reaction */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Helpful?</span>
                <button
                  type="button"
                  onClick={() => toggleReviewHelpful(review.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium transition"
                  title="Mark this review as helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500" />
                  <span>Yes ({review.helpful_count})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedOrderToReview && (
        <OrderReviewModal
          order={selectedOrderToReview}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedOrderToReview(null);
          }}
          existingReview={selectedOrderToReview.buyer_review}
        />
      )}
    </div>
  );
};
