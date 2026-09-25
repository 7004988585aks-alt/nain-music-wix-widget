import React from 'react';
import { 
  Check, 
  FileText, 
  Tag, 
  Sliders, 
  HelpCircle, 
  ListChecks, 
  FileSpreadsheet, 
  Image, 
  Rocket 
} from 'lucide-react';
import { useGig } from '../../context/GigContext';

interface StepNavigationProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const STEPS = [
  { id: 1, name: 'Overview', icon: Tag, desc: 'Title, Service & Metadata' },
  { id: 2, name: 'Pricing', icon: Sliders, desc: 'Basic, Standard & Premium' },
  { id: 3, name: 'Gig Extras', icon: FileSpreadsheet, desc: 'Optional High-Value Addons' },
  { id: 4, name: 'Description & FAQ', icon: FileText, desc: 'Scope, Workflow & FAQs' },
  { id: 5, name: 'Requirements', icon: ListChecks, desc: 'Buyer Intake Questions' },
  { id: 6, name: 'Gig Summary', icon: HelpCircle, desc: 'Punchy 2-Sentence Pitch' },
  { id: 7, name: 'Gallery & Media', icon: Image, desc: 'Audio Showcase & Art' },
  { id: 8, name: 'Publish', icon: Rocket, desc: 'Validation Audit & Go Live' },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const { currentGig, validateGig } = useGig();

  const validation = currentGig ? validateGig(currentGig) : null;

  // Compute step completeness
  const isStepComplete = (stepId: number): boolean => {
    if (!currentGig || !validation) return false;
    switch (stepId) {
      case 1:
        return validation.stepStatuses.overview;
      case 2:
        return validation.stepStatuses.pricing;
      case 3:
        return true; // Extras are optional
      case 4:
        return validation.stepStatuses.description;
      case 5:
        return validation.stepStatuses.requirements;
      case 6:
        return true; // Summary is optional
      case 7:
        return validation.stepStatuses.gallery;
      case 8:
        return validation.isValid;
      default:
        return false;
    }
  };

  const progressPercentage = Math.round(
    (STEPS.filter(s => isStepComplete(s.id)).length / STEPS.length) * 100
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
            Gig Builder Progress
          </span>
          <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
            {progressPercentage}% Complete
          </span>
        </div>
        <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps grid / horizontal scrollable */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.id;
          const complete = isStepComplete(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl text-left transition-all relative border group ${
                isCurrent
                  ? 'bg-amber-50 border-amber-500 shadow-xs ring-1 ring-amber-400'
                  : complete
                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950'
                      : complete
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {complete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                </div>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </div>

              <span className={`text-xs font-semibold leading-tight line-clamp-1 ${
                isCurrent ? 'text-slate-900' : complete ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {step.name}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight line-clamp-1 hidden md:block mt-0.5">
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
