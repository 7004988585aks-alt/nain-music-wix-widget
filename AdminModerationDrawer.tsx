import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ShieldAlert, Check, Ban, Clock, Filter, AlertTriangle, HardDrive } from 'lucide-react';
import { ModerationRecord } from '../../types';
import { getModerationRecords, updateModerationRecordStatus } from '../../utils/chatModeration';
import { GoogleDriveManagerModal } from '../drive/GoogleDriveManagerModal';

interface AdminModerationDrawerProps {
  onClose: () => void;
}

export const AdminModerationDrawer: React.FC<AdminModerationDrawerProps> = ({ onClose }) => {
  const [records, setRecords] = useState<ModerationRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'actioned' | 'dismissed'>('all');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  useEffect(() => {
    setRecords(getModerationRecords());
  }, []);

  const handleUpdateStatus = (id: string, status: 'pending_review' | 'actioned' | 'dismissed') => {
    updateModerationRecordStatus(id, status);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filteredRecords = records.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Nain Safety & Moderation Center</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/30">
                  ADMIN REVIEW
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Authorized platform moderation logs & safety queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Open Private Google Drive Vault"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Owner Drive Vault</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'pending_review', 'actioned', 'dismissed'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition shrink-0 ${
                  filter === tab
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">
            {filteredRecords.length} records
          </span>
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No moderation records found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active flags or reports match this filter. Nain Music chat safety system automatically prevents harmful content.
              </p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-md"
              >
                {/* Status & Outcome Banner */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                        record.outcome === 'blocked'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : record.outcome === 'flagged'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {record.outcome}
                    </span>
                    <span className="font-semibold text-slate-200">{record.reason}</span>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Content snippet */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>
                      Sender: <strong className="text-slate-200">{record.reported_user_name}</strong>
                    </span>
                    <span>
                      Reported by: <strong className="text-slate-300">{record.reporter_name} ({record.reporter_role})</strong>
                    </span>
                  </div>
                  <p className="text-slate-300 italic font-mono text-[11px] break-words">
                    "{record.message_snippet}"
                  </p>
                </div>

                {/* Additional description */}
                {record.description && (
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    Note: {record.description}
                  </p>
                )}

                {/* Admin Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    Status:{' '}
                    <strong className="text-slate-200 capitalize">
                      {record.status.replace('_', ' ')}
                    </strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {record.status !== 'actioned' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(record.id, 'actioned')}
                        className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        Action User
                      </button>
                    )}
                    {record.status !== 'dismissed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(record.id, 'dismissed')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>Protected under Nain Music Escrow & Safety Policy</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
          >
            Close Center
          </button>
        </div>

      </div>

      {/* Private Google Drive Manager for Master Owner */}
      <GoogleDriveManagerModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </div>
  );
};
