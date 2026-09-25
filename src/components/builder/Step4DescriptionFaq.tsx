import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  HelpCircle, 
  Sparkles, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { FAQItem } from '../../types';

export const Step4DescriptionFaq: React.FC = () => {
  const { currentGig, updateCurrentGig, services } = useGig();

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showAddFaq, setShowAddFaq] = useState(false);

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCurrentGig({ description: e.target.value });
  };

  const insertTemplateBlock = (title: string, content: string) => {
    const formatted = `\n\n#### ${title}\n${content}`;
    updateCurrentGig(prev => ({
      ...prev,
      description: prev.description + formatted,
    }));
  };

  // FAQ methods
  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const item: FAQItem = {
      id: `faq_${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    updateCurrentGig(prev => ({
      ...prev,
      faqs: [...prev.faqs, item],
    }));
    setNewQuestion('');
    setNewAnswer('');
    setShowAddFaq(false);
  };

  const handleDeleteFaq = (faqId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== faqId),
    }));
  };

  const handleUpdateFaq = (faqId: string, field: 'question' | 'answer', value: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => f.id === faqId ? { ...f, [field]: value } : f),
    }));
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentGig.faqs.length) return;

    const list = [...currentGig.faqs];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    updateCurrentGig({ faqs: list });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Description & FAQ</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 4 of 8
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Provide clear expectations, outline your music workflow, and answer recurring artist questions.
        </p>
      </div>

      {/* Description Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <label className="block text-sm font-semibold text-white">
              Gig Description <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Explain your process, what equipment/software you use, deliverables, and conditions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${
              currentGig.description.length < 40 ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}>
              {currentGig.description.length} / 2500 chars
            </span>
            {currentGig.description.length >= 40 && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Quick Insert Snippet Helper Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium px-2">Quick Sections:</span>
          <button
            type="button"
            onClick={() => insertTemplateBlock('What is Included:', '- Item 1\n- Item 2\n- Item 3')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            + What is Included
          </button>
          <button
            type="button"
            onClick={() => insertTemplateBlock('What is NOT Included:', '- What to exclude')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            + What is Not Included
          </button>
          <button
            type="button"
            onClick={() => insertTemplateBlock('Our Workflow & Process:', '1. Initial review of tracks\n2. First draft delivery\n3. Revision adjustments\n4. Final master approval')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            + Workflow Steps
          </button>
          <button
            type="button"
            onClick={() => insertTemplateBlock('Deliverables:', '- 24-bit 48kHz WAV uncompressed master\n- 320kbps MP3 reference')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            + Deliverables Format
          </button>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={10}
            value={currentGig.description}
            onChange={handleDescriptionChange}
            placeholder={`Describe what you offer for ${currentService.name.toLowerCase()}...\n\n- Detail your studio gear, analog consoles, or plugins\n- Outline your turnaround milestones\n- Specify file export instructions for the buyer`}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
          />
        </div>
        {currentGig.description.length < 40 && (
          <p className="text-[11px] text-amber-400">
            * Minimum 40 characters required for publishing.
          </p>
        )}
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Optional answers to common questions about stems, revisions, audio formats, and licenses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddFaq(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add FAQ
          </button>
        </div>

        {/* Add FAQ Form */}
        {showAddFaq && (
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3">
            <span className="text-xs font-bold text-amber-400">Add New FAQ</span>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. In what format should I export my audio files?"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Answer</label>
              <textarea
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Provide a concise, helpful explanation..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFaq(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition"
              >
                Save FAQ
              </button>
            </div>
          </div>
        )}

        {/* Existing FAQs */}
        <div className="space-y-3">
          {currentGig.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                  className="font-semibold text-xs text-white bg-transparent w-full focus:outline-none focus:border-b border-amber-500"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveFaq(index, 'up')}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === currentGig.faqs.length - 1}
                    onClick={() => handleMoveFaq(index, 'down')}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                className="w-full text-xs text-slate-300 bg-transparent resize-none focus:outline-none focus:border-b border-amber-500"
              />
            </div>
          ))}

          {currentGig.faqs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4 italic">
              No FAQs added yet. You can add answers to save time answering messages.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
