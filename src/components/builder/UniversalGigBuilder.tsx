import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye, 
  Clock, 
  Check, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { StepNavigation } from './StepNavigation';
import { Step1Overview } from './Step1Overview';
import { Step2Pricing } from './Step2Pricing';
import { Step3Extras } from './Step3Extras';
import { Step4DescriptionFaq } from './Step4DescriptionFaq';
import { Step5Requirements } from './Step5Requirements';
import { Step6Summary } from './Step6Summary';
import { Step7Gallery } from './Step7Gallery';
import { Step8Publish } from './Step8Publish';

interface UniversalGigBuilderProps {
  onNavigateView: (view: 'dashboard' | 'builder' | 'preview') => void;
}

export const UniversalGigBuilder: React.FC<UniversalGigBuilderProps> = ({
  onNavigateView,
}) => {
  const { 
    currentGig, 
    currentStep, 
    setCurrentStep, 
    saveCurrentGigDraft, 
    lastSavedAt, 
    isAutoSaving,
    services 
  } = useGig();

  if (!currentGig) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-400">No active Gig selected for editing.</p>
        <button
          type="button"
          onClick={() => onNavigateView('dashboard')}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleNext = () => {
    saveCurrentGigDraft();
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      
      {/* Top sticky action sub-bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateView('dashboard')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Return to Seller Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Editing:</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-amber-600" />
                {currentService.name} Service
              </span>
              <span className="text-xs text-slate-600 hidden md:inline truncate max-w-xs font-medium">
                {currentGig.service_title ? `I will ${currentGig.service_title}` : 'Untitled Gig'}
              </span>
            </div>
          </div>

          {/* Action buttons & autosave status */}
          <div className="flex items-center gap-2.5">
            {/* Last saved timestamp indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pr-2 border-r border-slate-200">
              <Clock className="w-3 h-3 text-slate-400" />
              {isAutoSaving ? (
                <span className="text-amber-600 animate-pulse font-semibold">Saving draft...</span>
              ) : lastSavedAt ? (
                <span>Saved at {lastSavedAt}</span>
              ) : (
                <span>Draft uncommitted</span>
              )}
            </div>

            {/* Save Draft */}
            <button
              type="button"
              onClick={() => saveCurrentGigDraft()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {/* Preview button */}
            <button
              type="button"
              onClick={() => onNavigateView('preview')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main content container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Step Progress bar */}
        <StepNavigation
          currentStep={currentStep}
          onSelectStep={(step) => {
            saveCurrentGigDraft();
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Render active step */}
        <div className="transition-all duration-200">
          {currentStep === 1 && <Step1Overview />}
          {currentStep === 2 && <Step2Pricing />}
          {currentStep === 3 && <Step3Extras />}
          {currentStep === 4 && <Step4DescriptionFaq />}
          {currentStep === 5 && <Step5Requirements />}
          {currentStep === 6 && <Step6Summary />}
          {currentStep === 7 && <Step7Gallery />}
          {currentStep === 8 && (
            <Step8Publish
              onNavigateView={onNavigateView}
              onGoToStep={(s) => {
                setCurrentStep(s);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>

        {/* Bottom step navigation footer */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between max-w-4xl mx-auto">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => saveCurrentGigDraft()}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 transition shadow-2xs"
            >
              Save Draft
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-md"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateView('preview')}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-md"
              >
                <Eye className="w-4 h-4" />
                View as Buyer
              </button>
            )}
          </div>
        </div>

      </main>

    </div>
  );
};
