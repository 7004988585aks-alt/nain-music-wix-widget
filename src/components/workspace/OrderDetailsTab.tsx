import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Package, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  Calendar, 
  User, 
  ShieldCheck, 
  Hash, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Order } from '../../types';
import { FiverrOrderReviewBox } from '../reviews/FiverrOrderReviewBox';

interface OrderDetailsTabProps {
  order: Order;
  viewMode: 'seller' | 'buyer';
}

export const OrderDetailsTab: React.FC<OrderDetailsTabProps> = ({ order, viewMode }) => {
  const isCustomOffer = order.order_type === 'custom_offer' || Boolean(order.custom_offer_id) || Boolean(order.custom_offer_details);
  const custom = order.custom_offer_details;

  return (
    <div className="space-y-6">
      {/* 1. Order Identity Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Hash className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Order Identity & Record
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Order Number</span>
            <span className="font-mono font-bold text-white text-base">{order.order_number}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Order Type</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
              isCustomOffer 
                ? 'bg-purple-950/70 border border-purple-800 text-purple-300' 
                : 'bg-blue-950/70 border border-blue-800 text-blue-300'
            }`}>
              {isCustomOffer ? <Sparkles className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              {isCustomOffer ? 'Custom Offer' : 'Gig Order'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Ordered By</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{order.buyer_name}</span>
              {order.buyer_username && (
                <span className="text-xs text-slate-400 font-mono">@{order.buyer_username}</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Payment Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/70 border border-emerald-800 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Paid / Escrow Secured
            </span>
          </div>
        </div>
      </div>

      {/* 2. SPECIFICATION SECTION: DYNAMIC SOURCE DETERMINATION */}
      {isCustomOffer ? (
        /* CUSTOM OFFER VIEW (Section 2.B) */
        <div className="bg-slate-900 border border-purple-900/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />

          {/* Banner Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-purple-400">
                  Custom Negotiated Offer
                </span>
                <h2 className="text-lg font-bold text-white">
                  {custom?.title || order.package_name || order.gig_title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-950/80 border border-purple-700/60 rounded-full text-xs font-semibold text-purple-200">
                Private Agreement
              </span>
            </div>
          </div>

          {/* Scope & Specifications */}
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Scope & Specifications
              </h4>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {custom?.scope || custom?.title || order.package_scope || 'Tailored music production services customized per buyer specifications.'}
              </p>
            </div>

            {/* Offer Description & Terms */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Offer Description & Agreed Terms
              </h4>
              <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {custom?.description || 'Commercial-grade music production and engineering deliverables provided with full commercial rights.'}
              </p>
            </div>

            {/* Deliverables */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Included Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(custom?.deliverables && custom.deliverables.length > 0 
                  ? custom.deliverables 
                  : ['Stereo 24-bit WAV Master File', 'Commercial Streaming Master (WAV)', 'Instrumental Stems (WAV)', 'Commercial Distribution Rights']
                ).map((deliv, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Quantity
                </span>
                <span className="text-base font-bold text-white">{custom?.quantity || order.quantity || 1}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Delivery Time
                </span>
                <span className="text-base font-bold text-white">{custom?.delivery_days || order.delivery_days} Days</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  Revisions
                </span>
                <span className="text-base font-bold text-white">{custom?.revisions ?? order.revisions_allowed}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Total Price
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {custom?.currency === 'USD' || order.pricing_currency === 'USD'
                    ? `$${(custom?.offer_amount || custom?.price_usd || order.price_usd || ((custom?.price_inr || order.total_price_inr) / 100)).toFixed(2)} USD`
                    : `₹${(custom?.price_inr || order.total_price_inr).toLocaleString('en-IN')} INR`}
                </span>
                {(custom?.currency === 'USD' || order.pricing_currency === 'USD') && (
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    Internal Base: ₹{(custom?.price_inr || order.total_price_inr).toLocaleString('en-IN')} INR
                  </span>
                )}
              </div>
            </div>

            {/* Note confirming separation from public gig */}
            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg flex items-center gap-2 text-xs text-purple-300">
              <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
              <span>
                <strong>Dynamic Source Verified:</strong> This order originated from a Custom Offer accepted in chat. It retains its custom title, custom scope, agreed deliverables, and pricing independent of public gig catalog modifications.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* GIG ORDER VIEW (Section 2.A) */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                  Gig Catalog Order
                </span>
                <h2 className="text-lg font-bold text-white">
                  {order.gig_title}
                </h2>
              </div>
            </div>

            <span className="px-3 py-1 bg-blue-950/80 border border-blue-700/60 rounded-full text-xs font-semibold text-blue-200 uppercase">
              {order.package_type} Tier
            </span>
          </div>

          <div className="space-y-5">
            {/* Service & Package Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Service Category</span>
                <span className="text-sm font-semibold text-white">{order.service_name}</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Selected Package</span>
                <span className="text-sm font-semibold text-amber-400">{order.package_name}</span>
              </div>
            </div>

            {/* Package Scope & Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Package Scope & Inclusions
              </h4>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {order.package_scope}
              </p>
            </div>

            {/* Selected Extras */}
            {order.selected_extras && order.selected_extras.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Purchased Studio Extras
                </h4>
                <div className="space-y-2">
                  {order.selected_extras.map((extra, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-200">{extra.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        {extra.days !== 0 && (
                          <span className="text-xs text-slate-400">
                            {extra.days > 0 ? `+${extra.days} days` : `${extra.days} days faster`}
                          </span>
                        )}
                        <span className="text-amber-400 font-semibold">+₹{extra.price_inr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Quantity
                </span>
                <span className="text-base font-bold text-white">{order.quantity || 1}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Delivery Time
                </span>
                <span className="text-base font-bold text-white">{order.delivery_days} Days</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  Revisions Included
                </span>
                <span className="text-base font-bold text-white">{order.revisions_allowed}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Total Order Value
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  ₹{order.total_price_inr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fiverr-Style Public Review & Seller Response */}
      {order.status === 'Completed' && (
        <FiverrOrderReviewBox 
          order={order}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};
