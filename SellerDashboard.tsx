import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Eye, 
  Copy, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles, 
  MessageSquare,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatGigPrice } from '../../data/servicesData';
import { Gig, GigStatus, AppView } from '../../types';

interface SellerDashboardProps {
  onNavigateView: (view: AppView) => void;
  onSelectGigForEdit: (gig: Gig) => void;
  onSelectGigForPreview: (gig: Gig) => void;
  onCreateNewGig: (serviceId?: string) => void;
  onOpenCustomOfferModal: (gig: Gig) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onNavigateView,
  onSelectGigForEdit,
  onSelectGigForPreview,
  onCreateNewGig,
  onOpenCustomOfferModal,
}) => {
  const { 
    gigs, 
    orders, 
    services, 
    currentUser, 
    selectedCurrency, 
    duplicateGig, 
    deleteGig, 
    unpublishGig, 
    publishCurrentGig,
    setCurrentGig,
    updateOrderStatus,
    setSelectedOrderId,
    selectedOrderId,
    clearAllOrders,
    loadSampleOrder
  } = useGig();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'paused'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'gigs' | 'orders'>('gigs');
  const [openMenuGigId, setOpenMenuGigId] = useState<string | null>(null);

  // Filter gigs
  const filteredGigs = gigs.filter(gig => {
    const matchesStatus = statusFilter === 'all' || gig.status === statusFilter;
    const matchesService = serviceFilter === 'all' || gig.service_id === serviceFilter;
    const matchesSearch = !searchQuery.trim() || 
      gig.service_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.service_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesService && matchesSearch;
  });

  // Calculate seller financial stats (80% net earnings)
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const inProgressOrders = orders.filter(o => o.status === 'In Progress' || o.status === 'Requirements Needed');
  const totalEarnedInr = completedOrders.reduce((sum, o) => sum + o.provider_earnings_inr, 0);
  const pendingEarningsInr = inProgressOrders.reduce((sum, o) => sum + o.provider_earnings_inr, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      
      {/* Seller Header & Overview Cards */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    STUDIO PRO
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  @{currentUser.username} • {currentUser.location} • Verified Audio Seller
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Seller Net (80%)
              </span>
              <p className="text-xl font-black text-emerald-600 font-mono">
                {formatCurrency(totalEarnedInr, selectedCurrency)}
              </p>
              <span className="text-[10px] text-slate-400 block">Based on completed work</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                In-Progress Volume
              </span>
              <p className="text-xl font-black text-amber-600 font-mono">
                {formatCurrency(pendingEarningsInr, selectedCurrency)}
              </p>
              <span className="text-[10px] text-slate-400 block">{inProgressOrders.length} active orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Published Gigs
              </span>
              <p className="text-xl font-black text-slate-900 font-mono">
                {gigs.filter(g => g.status === 'published').length} / {gigs.length}
              </p>
              <span className="text-[10px] text-slate-400 block">Across 9 music services</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Nain Platform Share
              </span>
              <p className="text-xl font-black text-slate-700 font-mono">
                20% Flat
              </p>
              <span className="text-[10px] text-slate-400 block">No hidden fees / no escrow</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Workspace Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation Tabs (Gigs vs Order Workspace) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('gigs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'gigs'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Manage Music Gigs ({gigs.length})
            </button>

            <button
              type="button"
              onClick={() => {
                if (orders.length > 0) {
                  setSelectedOrderId(orders[0].id);
                }
                onNavigateView('order_workspace');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Order Workspace ({orders.length})
            </button>
          </div>

          <div className="hidden sm:block text-xs text-slate-500">
            Current Currency: <strong className="text-slate-900 font-mono">{selectedCurrency}</strong> (Base INR)
          </div>
        </div>

        {/* 1. GIGS TAB */}
        {activeTab === 'gigs' && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'published', 'draft', 'paused'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      statusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Gigs' : st}
                  </button>
                ))}
              </div>

              {/* Service filter & Search input */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Services</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gigs..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

            </div>

            {/* Gigs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGigs.map((gig) => {
                const serviceDef = services.find(s => s.id === gig.service_id) || services[0];
                const primaryMedia = gig.media.find(m => m.primary && m.media_type === 'image') || gig.media[0];
                const lowestPkg = gig.packages.reduce((min, p) => (p.price_inr < min.price_inr ? p : min), gig.packages[0]);
                const lowestPrice = lowestPkg ? lowestPkg.price_inr : 0;

                const statusStyles = {
                  published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  draft: 'bg-amber-100 text-amber-800 border-amber-300',
                  paused: 'bg-slate-100 text-slate-700 border-slate-300',
                }[gig.status];

                return (
                  <div
                    key={gig.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Media Image */}
                      <div className="h-44 bg-slate-100 relative overflow-hidden">
                        {primaryMedia ? (
                          <img
                            src={primaryMedia.file_url}
                            alt={gig.service_title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Layers className="w-8 h-8" />
                          </div>
                        )}

                        {/* Top overlays */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-amber-700 border border-slate-200 shadow-xs">
                            {serviceDef.name}
                          </span>

                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md ${statusStyles}`}>
                            {gig.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          <span className="text-amber-600">I will </span>
                          {gig.service_title || 'deliver music services'}
                        </h3>

                        {gig.summary && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {gig.summary}
                          </p>
                        )}

                        {/* Metadata tags */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                            {gig.packages.length} Packages
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                            {gig.extras.length} Extras
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                            {gig.requirements.length} Questions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Starting at</span>
                        <span className="text-sm font-black text-amber-600 font-mono">
                          {formatGigPrice(lowestPrice)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGigForEdit(gig);
                            onNavigateView('builder');
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Edit in Gig Builder"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectGigForPreview(gig);
                            onNavigateView('preview');
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Preview as Buyer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCustomOfferModal(gig)}
                          className="p-1.5 rounded-lg bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Send Custom Offer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateGig(gig.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Duplicate Gig"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteGig(gig.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-red-500 text-slate-500 hover:text-white border border-slate-200 transition shadow-2xs"
                          title="Delete Gig"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {filteredGigs.length === 0 && (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No Gigs Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query or create a brand new music gig using the Universal Gig Builder.
                </p>
                <button
                  type="button"
                  onClick={() => onCreateNewGig()}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Create New Gig
                </button>
              </div>
            )}

          </div>
        )}

        {/* 2. ORDER WORKSPACE TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  Nain Music Order Lifecycle & Earnings
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Orders originate directly from your published packages. Nain Music retains 20% platform fee; sellers receive 80% upon completion.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                  {orders.length} Total Orders
                </span>
                {orders.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearAllOrders}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 transition"
                    title="Clear all orders to test the empty zero-order state"
                  >
                    Clear Orders (Test Zero State)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={loadSampleOrder}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition"
                    title="Load a sample order to test active lifecycle"
                  >
                    + Load Demo Order
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table or Real Fiverr Empty State */}
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No Orders Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    When buyers purchase your music production, mixing, or mastering packages, their active orders, uploaded stems, delivery countdowns, and 80% net payouts will show up here.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('gigs')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-2xs"
                  >
                    View My Published Gigs
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleOrder}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition border border-slate-200"
                  >
                    Load Sample Order (Test Mode)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order ID & Buyer</th>
                        <th className="py-3 px-4">Service & Package</th>
                        <th className="py-3 px-4">Delivery Due</th>
                        <th className="py-3 px-4">Order Total (INR)</th>
                        <th className="py-3 px-4">Your Net 80%</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => {
                        const statusBadge: Record<string, string> = {
                          'Requirements Needed': 'bg-amber-100 text-amber-900 border-amber-300',
                          'Awaiting Requirements': 'bg-amber-100 text-amber-900 border-amber-300',
                          'In Progress': 'bg-sky-100 text-sky-900 border-sky-300',
                          'Delivered': 'bg-purple-100 text-purple-900 border-purple-300',
                          'Revision Requested': 'bg-orange-100 text-orange-900 border-orange-300',
                          'Completed': 'bg-emerald-100 text-emerald-900 border-emerald-300',
                          'Cancelled': 'bg-rose-100 text-rose-900 border-rose-300',
                        };
                        const badgeClass = statusBadge[order.status] || 'bg-slate-100 text-slate-700';

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4">
                              <span className="font-mono text-slate-900 font-bold block">{order.id}</span>
                              <span className="text-[11px] text-slate-500">{order.buyer_name}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="text-slate-900 font-medium block">{order.service_name}</span>
                              <span className="text-[11px] text-amber-700 capitalize">{order.package_name}</span>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {order.delivery_days} Days ({new Date(order.created_at).toLocaleDateString()})
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              {formatCurrency(order.total_price_inr, selectedCurrency)}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                              {formatCurrency(order.provider_earnings_inr, selectedCurrency)}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                                {order.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    onNavigateView('order_workspace');
                                  }}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition shadow-xs"
                                >
                                  Open Workspace
                                </button>
                                {order.status === 'Completed' && (
                                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};
