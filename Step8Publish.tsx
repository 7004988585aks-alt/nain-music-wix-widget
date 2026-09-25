import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  LayoutDashboard, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { STEPS } from './StepNavigation';

interface Step8PublishProps {
  onNavigateView: (view: 'dashboard' | 'builder' | 'preview') => void;
  onGoToStep: (step: number) => void;
}

export const Step8Publish: React.FC<Step8PublishProps> = ({
  onNavigateView,
  onGoToStep,
}) => {
  const { 
    currentGig, 
    publishCurrentGig, 
    validateGig, 
    unpublishGig, 
    services 
  } = useGig();

  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];
  const validation = validateGig(currentGig);

  const handlePublish = () => {
    const res = publishCurrentGig();
    if (res.success) {
      setPublishedSuccess(true);
      setPublishErrors([]);
    } else {
      setPublishErrors(res.errors);
      setPublishedSuccess(false);
    }
  };

  const handleUnpublish = () => {
    unpublishGig(currentGig.id);
    setPublishedSuccess(false);
  };

  const isPublished = currentGig.status === 'published';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Review & Publish</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 8 of 8
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Perform a comprehensive readiness audit before making your Gig visible to Nain Music buyers.
        </p>
      </div>

      {/* Success banner if published */}
      {(publishedSuccess || isPublished) && (
        <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Your Gig is Live on Nain Music!</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  Published
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your packages are now buyer-facing on the marketplace. Orders received will prompt buyers with your custom intake questions before transitioning to <strong>In Progress</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateView('preview')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition shadow"
            >
              <Eye className="w-3.5 h-3.5" />
              View Live Marketplace Page
            </button>

            <button
              type="button"
              onClick={() => onNavigateView('dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Return to Seller Dashboard
            </button>

            <button
              type="button"
              onClick={handleUnpublish}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-medium hover:bg-slate-800 transition border border-slate-800 ml-auto"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Unpublish / Pause Gig
            </button>
          </div>
        </div>
      )}

      {/* Readiness Audit Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Pre-Publishing Readiness Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All essential requirements must pass before you can publish.
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
            validation.isValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {validation.isValid ? 'Audit Passed' : `${validation.errors.length} Issues Pending`}
          </span>
        </div>

        {/* Audit item rows */}
        <div className="space-y-3">
          
          {/* Step 1: Overview */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {validation.stepStatuses.overview ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white">Overview & Title</span>
                <p className="text-[11px] text-slate-400">
                  {currentGig.service_title 
                    ? `I will ${currentGig.service_title}` 
                    : 'Gig title is missing'}
                </p>
              </div>
            </div>
            {!validation.stepStatuses.overview && (
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Fix in Step 1
              </button>
            )}
          </div>

          {/* Step 2: Pricing */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {validation.stepStatuses.pricing ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white">Universal Packages & Pricing</span>
                <p className="text-[11px] text-slate-400">
                  {currentGig.has_three_packages ? '3 Active Packages' : '1 Active Package'} • Base starting price in INR
                </p>
              </div>
            </div>
            {!validation.stepStatuses.pricing && (
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Fix in Step 2
              </button>
            )}
          </div>

          {/* Step 4: Description */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {validation.stepStatuses.description ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white">Description & Process</span>
                <p className="text-[11px] text-slate-400">
                  {currentGig.description.length} characters (Min 40 required)
                </p>
              </div>
            </div>
            {!validation.stepStatuses.description && (
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Fix in Step 4
              </button>
            )}
          </div>

          {/* Step 5: Requirements */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {validation.stepStatuses.requirements ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white">Order Intake Requirements</span>
                <p className="text-[11px] text-slate-400">
                  {currentGig.requirements.length} questions configured for buyer submission
                </p>
              </div>
            </div>
            {!validation.stepStatuses.requirements && (
              <button
                type="button"
                onClick={() => onGoToStep(5)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Fix in Step 5
              </button>
            )}
          </div>

          {/* Step 7: Gallery & Copyright */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {validation.stepStatuses.gallery ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white">Gallery & Ownership Declaration</span>
                <p className="text-[11px] text-slate-400">
                  {currentGig.media.length} media items • Copyright certified: {currentGig.seller_rights_confirmed ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
            {!validation.stepStatuses.gallery && (
              <button
                type="button"
                onClick={() => onGoToStep(7)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Fix in Step 7
              </button>
            )}
          </div>

        </div>

        {/* Display errors if publish was attempted */}
        {publishErrors.length > 0 && (
          <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl space-y-1 text-xs text-red-300">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Cannot Publish — Resolve the following:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
              {publishErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Publish Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Status: <strong className="text-white capitalize">{currentGig.status}</strong> • Base currency INR (₹)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigateView('preview')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              Preview as Buyer
            </button>

            {!isPublished ? (
              <button
                type="button"
                disabled={!validation.isValid}
                onClick={handlePublish}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Rocket className="w-4 h-4" />
                Publish Gig
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUnpublish}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 text-amber-400 text-xs font-semibold hover:bg-slate-700 transition border border-slate-700"
              >
                <PauseCircle className="w-4 h-4" />
                Unpublish
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
