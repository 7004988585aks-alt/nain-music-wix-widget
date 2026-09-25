import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Sparkles, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Plus,
  Layers
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useGig } from '../../context/GigContext';

interface OrdersListViewProps {
  orders: Order[];
  onSelectOrder: (orderId: string) => void;
  onBackToStudio: () => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  onSelectOrder,
  onBackToStudio
}) => {
  const { loadSampleOrder } = useGig();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.gig_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Requirements Needed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-800 text-amber-300">
            <Clock className="w-3 h-3" />
            Requirements Needed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-800 text-blue-300">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-800 text-purple-300">
            <Sparkles className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-950/80 border border-orange-800 text-orange-300">
            <RotateCcw className="w-3 h-3" />
            Revision Requested
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 border border-emerald-600/70 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-800 text-rose-300">
            <AlertCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            Orders Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track active production milestones, client requirements, revisions, and deliveries.
          </p>
        </div>

        <button
          onClick={onBackToStudio}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300 shadow-2xs"
        >
          Back to Seller Studio
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, buyer name, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="In Progress">In Progress</option>
            <option value="Requirements Needed">Requirements Needed</option>
            <option value="Delivered">Delivered</option>
            <option value="Revision Requested">Revision Requested</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center text-slate-500 shadow-xs max-w-xl mx-auto my-4 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-slate-900">No Orders in Your Queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When clients purchase your music gigs from the marketplace, their multitrack stems, deadlines, and delivery milestones will appear here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToStudio}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Manage Music Gigs</span>
            </button>
            <button
              type="button"
              onClick={loadSampleOrder}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Load Sample Order (Test Mode)</span>
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-slate-400" />
          <p className="text-base font-semibold text-slate-800 mb-1">No orders found</p>
          <p className="text-xs text-slate-500">
            No orders match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map(order => {
            const isCustom = order.order_type === 'custom_offer' || Boolean(order.custom_offer_id);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-5 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {order.order_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isCustom 
                          ? 'bg-purple-100 border border-purple-200 text-purple-700' 
                          : 'bg-blue-100 border border-blue-200 text-blue-700'
                      }`}>
                        {isCustom ? 'Custom Offer' : 'Gig Order'}
                      </span>
                    </div>

                    {getStatusBadge(order.status)}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                    {order.package_name && order.package_name !== 'Tailored Custom Offer' 
                      ? `${order.package_name} — ${order.gig_title}`
                      : order.gig_title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span>Buyer: <strong className="text-slate-800">{order.buyer_name}</strong></span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Order Value</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{order.total_price_inr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
