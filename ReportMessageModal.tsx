import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle, Flag } from 'lucide-react';
import { ChatMessage } from '../../types';
import { saveModerationRecord } from '../../utils/chatModeration';

interface ReportMessageModalProps {
  message: ChatMessage;
  conversationId: string;
  reporterRole: 'buyer' | 'seller';
  reporterName: string;
  onClose: () => void;
  onReportSubmitted: () => void;
}

const REPORT_REASONS = [
  'Spam',
  'Outside payment / transaction bypass',
  'Scam or fraud',
  'Harassment / abuse',
  'Sexual/obscene content',
  'Illegal activity',
  'Dangerous content',
  'Suspicious link',
  'Other'
];

export const ReportMessageModal: React.FC<ReportMessageModalProps> = ({
  message,
  conversationId,
  reporterRole,
  reporterName,
  onClose,
  onReportSubmitted,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save moderation record securely
    saveModerationRecord({
      conversation_id: conversationId,
      message_id: message.id,
      reporter_role: reporterRole,
      reporter_name: reporterName,
      reported_user_name: message.sender_name,
      reason: selectedReason,
      description: description.trim() || undefined,
      message_snippet: message.text || (message.attachment ? `[Attachment: ${message.attachment.name}]` : '[Custom Offer]'),
      outcome: 'reported',
      automated_classification: selectedReason,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onReportSubmitted();
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Message</h3>
              <p className="text-[11px] text-slate-500">Flagged content is reviewed by Nain Safety Team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Report Submitted</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you for keeping Nain Music safe. Our moderation team will review this message shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white">
            
            {/* Message Snippet */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">
                Reported message from <strong className="text-slate-800">{message.sender_name}</strong>:
              </span>
              <p className="text-slate-700 line-clamp-3 italic">
                "{message.text || (message.attachment ? `[Attached file: ${message.attachment.name}]` : '[Custom offer content]')}"
              </p>
            </div>

            {/* Select Reason */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Select Reason for Report <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition border ${
                      selectedReason === reason
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-amber-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Description */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Additional Details <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any relevant context about this violation..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white resize-none shadow-2xs"
              />
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-slate-600">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Moderation records are strictly confidential and visible only to authorized Nain Music administrators.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Submit Report
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
