import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Eye, 
  FileText, 
  Activity, 
  ListChecks, 
  Send,
  ChevronRight,
  Layers,
  MapPin,
  ExternalLink,
  ChevronDown,
  Star
} from 'lucide-react';
import { Order, OrderStatus, OrderFileAttachment, OrderRequirementsData } from '../../types';
import { useGig } from '../../context/GigContext';
import { OrderDetailsTab } from './OrderDetailsTab';
import { OrderActivityTab } from './OrderActivityTab';
import { OrderRequirementsTab } from './OrderRequirementsTab';
import { OrderDeliveryWorkspace } from './OrderDeliveryWorkspace';
import { OrdersListView } from './OrdersListView';
import { OrderInvoiceModal } from './OrderInvoiceModal';

interface OrderWorkspaceProps {
  onBackToStudio: () => void;
}

export const OrderWorkspace: React.FC<OrderWorkspaceProps> = ({ onBackToStudio }) => {
  const { 
    orders, 
    selectedOrderId, 
    setSelectedOrderId,
    openChatWithBuyer,
    submitOrderDelivery,
    requestOrderRevision,
    acceptOrderDeliveryAndComplete,
    simulateClearingComplete,
    submitOrderRequirements,
    viewMode,
    setViewMode
  } = useGig();

  // Active top tab: Activity | Details | Requirements
  const [activeTab, setActiveTab] = useState<'activity' | 'details' | 'requirements'>('details');

  // Role Perspective View Mode: 'seller' | 'buyer' is now synced with global useGig
  // Section 11: strict separation of seller financials

  // Show all orders list mode
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Tax Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Find active order or fallback to first order
  const currentOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  if (!currentOrder || showAllOrders) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <OrdersListView 
          orders={orders}
          onSelectOrder={(id) => {
            setSelectedOrderId(id);
            setShowAllOrders(false);
          }}
          onBackToStudio={onBackToStudio}
        />
      </div>
    );
  }

  const isCustomOffer = currentOrder.order_type === 'custom_offer' || Boolean(currentOrder.custom_offer_id);

  // Calculate delivery countdown
  const now = new Date().getTime();
  const dueTime = currentOrder.delivery_due_at 
    ? new Date(currentOrder.delivery_due_at).getTime() 
    : (new Date(currentOrder.created_at).getTime() + (currentOrder.delivery_days || 4) * 24 * 3600 * 1000);
  const diffMs = dueTime - now;
  const daysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  // Status badge helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Requirements Needed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/90 border border-amber-800 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Requirements Needed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/90 border border-blue-800 text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/90 border border-purple-800 text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            Delivered — In Review
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-950/90 border border-orange-800 text-orange-300">
            <RotateCcw className="w-3.5 h-3.5" />
            {viewMode === 'seller' ? 'Buyer Requested Adjustments' : 'Revision In Progress'}
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 border border-emerald-800 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/90 border border-rose-800 text-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 animate-fadeIn">
      {/* 1. TOP UTILITY BAR: Navigation, View Toggle, Order Switcher */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStudio}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seller Studio</span>
            </button>

            {/* Breadcrumb divider */}
            <span className="text-slate-300 hidden sm:inline">/</span>

            {/* Quick Order Switcher */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500">Order:</span>
              <select
                value={currentOrder.id}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-500"
              >
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} ({o.order_type === 'custom_offer' ? 'Custom Offer' : 'Gig Order'}) - {o.buyer_name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAllOrders(true)}
                className="text-xs text-amber-600 hover:text-amber-700 ml-1 underline underline-offset-2 font-medium"
              >
                View All ({orders.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Perspective View Switcher (Section 11) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('seller')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'seller'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Seller with 80% earnings and 7-day clearing"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Seller View</span>
              </button>

              <button
                onClick={() => setViewMode('buyer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'buyer'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Strict Buyer View hiding platform fees and provider payouts"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Buyer View</span>
              </button>
            </div>

            {/* Open Chat Button (Section 1 & 8) */}
            <button
              onClick={() => openChatWithBuyer(currentOrder.buyer_name, currentOrder.gig_id, viewMode)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-2xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Open Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ORDER HERO / HEADER (Section 1) */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Order Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl font-bold text-slate-900 tracking-wide">
                  {currentOrder.order_number}
                </span>

                {getStatusBadge(currentOrder.status)}

                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                  isCustomOffer 
                    ? 'bg-purple-100 border border-purple-200 text-purple-700' 
                    : 'bg-blue-100 border border-blue-200 text-blue-700'
                }`}>
                  {isCustomOffer ? 'Custom Offer' : 'Gig Order'}
                </span>

                {currentOrder.buyer_review ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Buyer Rated {currentOrder.buyer_review.rating}.0</span>
                  </span>
                ) : currentOrder.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Awaiting Buyer Review</span>
                  </span>
                ) : null}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {currentOrder.package_name && currentOrder.package_name !== 'Tailored Custom Offer'
                  ? `${currentOrder.package_name} — ${currentOrder.gig_title}`
                  : currentOrder.gig_title}
              </h1>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Buyer: <strong className="text-slate-800">{currentOrder.buyer_name}</strong></span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Ordered: {new Date(currentOrder.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Due: {currentOrder.delivery_due_at ? new Date(currentOrder.delivery_due_at).toLocaleDateString() : `${currentOrder.delivery_days} days`}</span>
                </div>
              </div>
            </div>

            {/* Right Financials Snapshot */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 shrink-0">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
                  Total Order Price
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹{currentOrder.total_price_inr.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Show Seller Net Earnings ONLY if in Seller View (Section 11) */}
              {viewMode === 'seller' && (
                <div className="pl-3 sm:pl-4 border-l border-slate-200">
                  <span className="text-[11px] text-emerald-700 block uppercase tracking-wider font-semibold">
                    Provider Net (80%)
                  </span>
                  <span className="text-xl font-bold text-emerald-700 font-mono">
                    ₹{currentOrder.provider_earnings_inr.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Statutory Tax Invoice CTA */}
              <div className="pl-3 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-amber-500 rounded-lg text-xs font-semibold transition shadow-2xs"
                  title="View & Print Official Statutory Tax Invoice & Receipt"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRIMARY NAVIGATION TABS (Section 1: Activity | Details | Requirements) */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 inline-flex items-center gap-2 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Details</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 inline-flex items-center gap-2 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity</span>
              {currentOrder.activity_timeline && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">
                  {currentOrder.activity_timeline.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`py-4 px-1 inline-flex items-center gap-2 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'requirements'
                  ? 'border-amber-500 text-amber-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Requirements</span>
              {currentOrder.status === 'Requirements Needed' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MAIN CONTENT AREA + RIGHT SIDEBAR */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center 2 Columns: Tabs Content & Delivery Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Tab View */}
            {activeTab === 'details' && (
              <OrderDetailsTab 
                order={currentOrder}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'activity' && (
              <OrderActivityTab 
                order={currentOrder}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'requirements' && (
              <OrderRequirementsTab 
                order={currentOrder}
                viewMode={viewMode}
                onSubmitRequirements={submitOrderRequirements}
              />
            )}

            {/* Delivery Workspace Section (Always accessible below tabs or as a milestone section) */}
            <div className="pt-4">
              <OrderDeliveryWorkspace 
                order={currentOrder}
                viewMode={viewMode}
                onSubmitDelivery={submitOrderDelivery}
                onRequestRevision={requestOrderRevision}
                onAcceptDelivery={acceptOrderDeliveryAndComplete}
                onSimulateClearingComplete={simulateClearingComplete}
              />
            </div>
          </div>

          {/* Right Column: Structured Sidebar (Section 8) */}
          <aside className="space-y-6">
            {/* 1. Client / Buyer Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Client Profile
                </span>
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <img 
                  src={currentOrder.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentOrder.buyer_name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {currentOrder.buyer_name}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    @{currentOrder.buyer_username || 'client'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{currentOrder.buyer_location || 'Mumbai, India'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openChatWithBuyer(currentOrder.buyer_name, currentOrder.gig_id, viewMode)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Open Direct Chat</span>
              </button>
            </div>

            {/* 2. Delivery Countdown Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Production Delivery Clock
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>

              <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                {currentOrder.status === 'Completed' ? (
                  <div className="text-emerald-700 font-bold text-base flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Delivered & Completed
                  </div>
                ) : currentOrder.status === 'Requirements Needed' ? (
                  <div>
                    <div className="text-amber-700 font-bold text-sm">
                      Clock Paused
                    </div>
                    <span className="text-xs text-slate-500">
                      Starts upon requirements submission
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      {daysLeft}d {hoursLeft}h
                    </div>
                    <span className="text-xs text-slate-500">
                      Remaining until delivery deadline
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Turnaround Time:</span>
                  <span className="font-semibold text-slate-800">{currentOrder.delivery_days} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Revisions Used:</span>
                  <span className="font-semibold text-slate-800">
                    {currentOrder.revisions_used || 0} of {currentOrder.revisions_allowed}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Order Summary Specifications */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order Summary
                </span>
                <span className="font-mono text-xs text-slate-500">
                  #{currentOrder.order_number}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-medium text-slate-900">{currentOrder.service_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Source Type:</span>
                  <span className="font-semibold text-amber-700 uppercase">
                    {isCustomOffer ? 'Custom Offer' : 'Gig Order'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Package / Scope:</span>
                  <span className="font-medium text-slate-900 line-clamp-1">{currentOrder.package_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-medium text-slate-900">{currentOrder.quantity || 1}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gig Base Price:</span>
                  <span className="font-mono text-slate-900">₹{(currentOrder.price_inr || currentOrder.total_price_inr).toLocaleString('en-IN')}</span>
                </div>

                {currentOrder.tax_details && currentOrder.tax_details.tax_amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tax ({currentOrder.tax_details.tax_type} {currentOrder.tax_details.tax_rate_percentage}):</span>
                    <span className="font-mono text-amber-700 font-semibold">+₹{currentOrder.tax_details.tax_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Total Price:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    ₹{currentOrder.total_price_inr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. FINANCIAL BREAKDOWN CARD (STRICTLY SELLER-ONLY per Section 8 & 11) */}
            {viewMode === 'seller' ? (
              <div className="bg-white border border-amber-300 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    Provider Financial Ledger
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Seller Only
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Eligible Gig Base Price:</span>
                    <span className="font-mono font-medium">₹{(currentOrder.price_inr || currentOrder.total_price_inr).toLocaleString('en-IN')}</span>
                  </div>

                  {currentOrder.tax_details && currentOrder.tax_details.tax_amount > 0 && (
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Tax Collected ({currentOrder.tax_details.tax_type}):</span>
                      <span className="font-mono text-slate-600">₹{currentOrder.tax_details.tax_amount.toLocaleString('en-IN')} (Govt Remittance)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Nain Platform Fee (20% of base):</span>
                    <span className="font-mono text-rose-600">-₹{currentOrder.nain_fee_inr.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Provider Net Earnings (80%):</span>
                    <span className="text-lg font-bold text-emerald-700 font-mono">
                      ₹{currentOrder.provider_earnings_inr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 mt-2">
                    {currentOrder.status === 'Completed' ? (
                      currentOrder.clearing_status === 'cleared' ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ ₹{currentOrder.provider_earnings_inr.toLocaleString('en-IN')} cleared and available for payout.
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          ⏳ In 7-day clearing period. Funds release to your available balance upon period expiry.
                        </span>
                      )
                    ) : (
                      <span>Funds secured under Payment Protection. Released to you upon order completion subject to standard 7-day clearing.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Buyer view explicitly hides provider share & platform fee per Section 11 */
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-600 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-slate-800 font-medium block">Payment Protection Active</span>
                <span>Your payment of ₹{currentOrder.total_price_inr.toLocaleString('en-IN')} is held securely until you approve the finished delivery.</span>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Statutory Tax Invoice / Receipt Modal */}
      {isInvoiceOpen && currentOrder && (
        <OrderInvoiceModal
          order={currentOrder}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
};
