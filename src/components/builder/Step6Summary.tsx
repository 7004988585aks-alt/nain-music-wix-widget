import React from 'react';
import { Sparkles, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatGigPrice } from '../../data/servicesData';

export const Step6Summary: React.FC = () => {
  const { currentGig, updateCurrentGig, services, selectedCurrency } = useGig();

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleGenerateSummary = () => {
    const genres = (currentGig.metadata.genres || []).join(', ');
    const pkg = currentGig.packages[0];
    const startingPrice = pkg 
      ? formatGigPrice(pkg.price_inr)
      : '₹1,000';

    const generated = `Professional ${currentService.name} service for ${genres || 'all musical genres'}. Delivering pristine commercial loudness, surgical precision, and fast turnaround starting at ${startingPrice}.`;

    updateCurrentGig({ summary: generated });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Gig Summary (Elevator Pitch)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 6 of 8 (Optional)
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          A short 1-2 sentence hook used in search cards, social shares, and mobile previews.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-semibold text-white">
              Short Pitch Summary
            </label>
            <p className="text-xs text-slate-400">
              Keep it concise, benefit-driven, and focused on your unique sonic signature.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Generate from Gig
          </button>
        </div>

        <div>
          <textarea
            rows={3}
            value={currentGig.summary || ''}
            onChange={(e) => updateCurrentGig({ summary: e.target.value })}
            maxLength={200}
            placeholder="e.g. High-end multi-track mixing & mastering utilizing hybrid analog chains and surgical Melodyne tuning for competitive streaming releases."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Optional field. Helpful for search indexing.</span>
            <span>{(currentGig.summary || '').length} / 200 characters</span>
          </div>
        </div>

        {/* Search Result Card Preview */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Search Card Preview on Nain Music
          </span>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                {currentService.name}
              </span>
              <span className="text-xs text-slate-400">• Verified Studio Pro</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              <span className="text-amber-400">I will </span>
              {currentGig.service_title || 'deliver professional music production for your next release'}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">
              {currentGig.summary || 'Custom summary will display here to attract potential buyers...'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400 font-mono">
              <span>
                Starting at {currentGig.packages[0] 
                  ? formatGigPrice(currentGig.packages[0].price_inr)
                  : '₹1,000'}
              </span>
              <span>⭐ 4.98 (142 reviews)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
