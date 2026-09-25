import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  RotateCcw, 
  DollarSign, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Ban,
  UserCheck
} from 'lucide-react';
import { Order, OrderActivityEvent } from '../../types';

interface OrderActivityTabProps {
  order: Order;
  viewMode: 'seller' | 'buyer';
}

export const OrderActivityTab: React.FC<OrderActivityTabProps> = ({ order, viewMode }) => {
  // Sort timeline chronologically (latest first or earliest first, standard timeline is earliest first top to bottom)
  const timeline: OrderActivityEvent[] = (order.activity_timeline || []).slice().sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getEventIcon = (type: OrderActivityEvent['type']) => {
    switch (type) {
      case 'order_placed':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'payment_confirmed':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'requirements_submitted':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'order_started':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'delivery_submitted':
      case 'revised_delivery_submitted':
        return <Send className="w-4 h-4 text-purple-400" />;
      case 'revision_requested':
        return <RotateCcw className="w-4 h-4 text-orange-400" />;
      case 'delivery_accepted':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'order_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'clearing_started':
      case 'clearing_completed':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'order_cancelled':
        return <Ban className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeStyle = (type: OrderActivityEvent['type']) => {
    switch (type) {
      case 'order_placed':
        return 'bg-blue-950/60 border-blue-800 text-blue-300';
      case 'payment_confirmed':
        return 'bg-emerald-950/60 border-emerald-800 text-emerald-300';
      case 'requirements_submitted':
        return 'bg-indigo-950/60 border-indigo-800 text-indigo-300';
      case 'order_started':
        return 'bg-amber-950/60 border-amber-800 text-amber-300';
      case 'delivery_submitted':
      case 'revised_delivery_submitted':
        return 'bg-purple-950/60 border-purple-800 text-purple-300';
      case 'revision_requested':
        return 'bg-orange-950/60 border-orange-800 text-orange-300';
      case 'delivery_accepted':
      case 'order_completed':
        return 'bg-emerald-950/60 border-emerald-800 text-emerald-300';
      case 'clearing_started':
      case 'clearing_completed':
        return 'bg-amber-950/60 border-amber-800 text-amber-300';
      case 'order_cancelled':
        return 'bg-rose-950/60 border-rose-800 text-rose-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  // Filter out clearing events if in buyer view mode per Section 11 (strict separation of seller finances)
  const visibleTimeline = timeline.filter(event => {
    if (viewMode === 'buyer') {
      if (event.type === 'clearing_started' || event.type === 'clearing_completed') {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">Order Activity & Audit Trail</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time chronological events, milestone completions, and escrow checkpoints.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
          {visibleTimeline.length} events logged
        </span>
      </div>

      {visibleTimeline.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          No activity logged yet for this order.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {visibleTimeline.map((event, index) => {
            const dateObj = new Date(event.timestamp);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const isLatest = index === visibleTimeline.length - 1;

            return (
              <div key={event.id || index} className="relative group">
                {/* Milestone Node */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-900 transition-colors ${
                  isLatest ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-700 group-hover:border-slate-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-amber-400' : 'bg-slate-400'}`} />
                </div>

                {/* Event Card */}
                <div className="bg-slate-950/60 border border-slate-800/90 hover:border-slate-700/80 transition-all rounded-xl p-4 ml-2 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(event.type)}`}>
                        {getEventIcon(event.type)}
                        {event.title}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Recorded by:</span>
                      <span className="text-slate-300 font-medium">{event.user_name}</span>
                      <span className="text-slate-400">({event.user_role})</span>
                    </div>
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
