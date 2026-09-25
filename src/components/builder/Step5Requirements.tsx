import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ListChecks, 
  Sparkles, 
  UploadCloud, 
  Type, 
  CheckSquare,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { GigRequirement, RequirementType } from '../../types';

export const Step5Requirements: React.FC = () => {
  const { currentGig, updateCurrentGig, services } = useGig();

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<RequirementType>('text');
  const [isRequired, setIsRequired] = useState(true);
  const [optionsText, setOptionsText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleAddRequirement = () => {
    if (!questionText.trim()) return;

    const options = questionType === 'multiple_choice' 
      ? optionsText.split(',').map(o => o.trim()).filter(Boolean)
      : undefined;

    const newReq: GigRequirement = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      gig_id: currentGig.id,
      question: questionText.trim(),
      type: questionType,
      options,
      required: isRequired,
      order: currentGig.requirements.length + 1,
    };

    updateCurrentGig(prev => ({
      ...prev,
      requirements: [...prev.requirements, newReq],
    }));

    setQuestionText('');
    setOptionsText('');
    setShowAddForm(false);
  };

  const handleDeleteRequirement = (reqId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r.id !== reqId),
    }));
  };

  const handleToggleRequired = (reqId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      requirements: prev.requirements.map(r => r.id === reqId ? { ...r, required: !r.required } : r),
    }));
  };

  const handleAddSuggested = (sug: { question: string; type: RequirementType; options?: string[]; required: boolean }) => {
    if (currentGig.requirements.some(r => r.question.toLowerCase() === sug.question.toLowerCase())) {
      return;
    }

    const newReq: GigRequirement = {
      id: `req_${Date.now()}_sug`,
      gig_id: currentGig.id,
      question: sug.question,
      type: sug.type,
      options: sug.options,
      required: sug.required,
      order: currentGig.requirements.length + 1,
    };

    updateCurrentGig(prev => ({
      ...prev,
      requirements: [...prev.requirements, newReq],
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Buyer Order Requirements</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 5 of 8
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Specify what audio files, references, or musical details the buyer must submit before you start working.
        </p>
      </div>

      {/* Lifecycle Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Nain Music Order Lifecycle Workflow</h4>
            <p className="text-xs text-slate-400">
              When a buyer places an order, the status is initially set to <span className="text-amber-400 font-semibold">Requirements Needed</span>. Once they complete your questions below, the order automatically transitions to <span className="text-emerald-400 font-semibold">In Progress</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono shrink-0">
          <span className="px-2 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md">
            Requirements Needed
          </span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md">
            In Progress
          </span>
        </div>
      </div>

      {/* Suggested Requirements for this service */}
      {currentService.suggestedRequirements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Standard Intake Questions for {currentService.name}
            </h3>
            <span className="text-xs text-slate-400">One-click add</span>
          </div>

          <div className="space-y-2">
            {currentService.suggestedRequirements.map((sug, idx) => {
              const isAdded = currentGig.requirements.some(r => r.question.toLowerCase() === sug.question.toLowerCase());
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    isAdded
                      ? 'bg-slate-950/40 border-slate-800 opacity-50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {sug.type === 'file_upload' && <UploadCloud className="w-4 h-4 text-sky-400" />}
                    {sug.type === 'text' && <Type className="w-4 h-4 text-amber-400" />}
                    {sug.type === 'multiple_choice' && <CheckSquare className="w-4 h-4 text-emerald-400" />}
                    <div>
                      <span className="text-slate-200 font-medium">{sug.question}</span>
                      <span className="ml-2 text-[10px] uppercase font-bold text-slate-500">
                        ({sug.type.replace('_', ' ')})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddSuggested(sug)}
                    className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition ${
                      isAdded
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isAdded ? 'Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Requirements List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Configured Order Intake Questions</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              At least 1 question is required before publishing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3">
            <span className="text-xs font-bold text-amber-400">New Intake Requirement</span>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Requirement Question</label>
              <textarea
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Please provide a link to download your raw stems..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Answer Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as RequirementType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="text">Free Text Input</option>
                  <option value="file_upload">File Upload (Stems, Audio, Documents)</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none pb-2">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-amber-500 bg-slate-900 cursor-pointer"
                  />
                  <span>Mandatory (Buyer must answer to start order)</span>
                </label>
              </div>
            </div>

            {questionType === 'multiple_choice' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Options (Comma separated)
                </label>
                <input
                  type="text"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder="e.g. Option A, Option B, Option C"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition"
              >
                Save Question
              </button>
            </div>
          </div>
        )}

        {/* Existing Requirements */}
        <div className="space-y-2.5">
          {currentGig.requirements.map((req, index) => (
            <div
              key={req.id}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-white">{req.question}</span>
                  {req.required ? (
                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                      Optional
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pl-7 flex items-center gap-3">
                  <span>Type: <strong className="text-slate-300 capitalize">{req.type.replace('_', ' ')}</strong></span>
                  {req.options && (
                    <span>Options: {req.options.join(', ')}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleRequired(req.id)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
                >
                  {req.required ? 'Make Optional' : 'Make Required'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRequirement(req.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {currentGig.requirements.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-red-900/40">
              <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-amber-300 font-semibold">At least 1 requirement is required.</p>
              <p className="text-[11px] text-slate-400 mt-1">Add a stem upload question or reference brief above.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
