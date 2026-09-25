import React, { useState } from 'react';
import { 
  Check, 
  HelpCircle, 
  Tag as TagIcon, 
  X, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';
import { useGig } from '../../context/GigContext';

export const Step1Overview: React.FC = () => {
  const { 
    currentGig, 
    updateCurrentGig, 
    services, 
    changeServiceForCurrentGig 
  } = useGig();

  const [tagInput, setTagInput] = useState('');
  const [showNegativeTags, setShowNegativeTags] = useState(false);
  const [negativeTagInput, setNegativeTagInput] = useState('');

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strip "I will " if user typed it accidentally
    const cleaned = val.replace(/^i\s+will\s+/i, '');
    updateCurrentGig({ service_title: cleaned });
  };

  const handleServiceChange = (serviceId: string) => {
    if (serviceId === currentGig.service_id) return;
    if (window.confirm('Switching service will adapt pricing features and requirements to the new service. Do you want to proceed?')) {
      changeServiceForCurrentGig(serviceId);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !currentGig.search_tags.includes(trimmed) && currentGig.search_tags.length < 10) {
      updateCurrentGig(prev => ({
        ...prev,
        search_tags: [...prev.search_tags, trimmed],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      search_tags: prev.search_tags.filter(t => t !== tagToRemove),
    }));
  };

  const addNegativeTag = () => {
    const trimmed = negativeTagInput.trim().toLowerCase();
    const existing = currentGig.negative_tags || [];
    if (trimmed && !existing.includes(trimmed)) {
      updateCurrentGig(prev => ({
        ...prev,
        negative_tags: [...existing, trimmed],
      }));
      setNegativeTagInput('');
    }
  };

  const removeNegativeTag = (tagToRemove: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      negative_tags: (prev.negative_tags || []).filter(t => t !== tagToRemove),
    }));
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = currentGig.metadata.genres || [];
    const updated = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    
    updateCurrentGig(prev => ({
      ...prev,
      metadata: { ...prev.metadata, genres: updated },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Overview</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 1 of 8
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Define your music service, craft your locked title, and categorize with dynamic metadata.
        </p>
      </div>

      {/* 1. Gig Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <label className="block text-sm font-semibold text-white">
              Gig Title <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              As your Gig storefront headline, this states clearly what musical outcome you deliver.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currentGig.service_title.length} / 80 characters
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-slate-700 bg-slate-950 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition shadow-inner">
          <div className="bg-slate-800/80 px-4 py-3 border-b sm:border-b-0 sm:border-r border-slate-700 flex items-center select-none shrink-0">
            <span className="text-sm font-extrabold text-amber-400 tracking-wide font-mono">
              I will
            </span>
          </div>
          <input
            type="text"
            value={currentGig.service_title}
            onChange={handleTitleChange}
            placeholder="e.g. mix and master your song to competitive commercial streaming standards"
            maxLength={80}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Live Title Preview */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400">Buyer preview:</span>
          <span className="text-xs font-semibold text-slate-200">
            <span className="text-amber-400 font-bold">I will </span>
            {currentGig.service_title || <span className="italic text-slate-500">[your service title will appear here]</span>}
          </span>
        </div>
      </div>

      {/* 2. Category & Service Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div>
          <label className="block text-sm font-semibold text-white">
            Music Service Selection <span className="text-amber-400">*</span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Nain Music is dedicated 100% to music. Selecting your service dynamically tunes the package builder.
          </p>
        </div>

        {/* Category: Music & Audio (Locked) */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">Category:</span>
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              Music & Audio
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Nain Marketplace Root</span>
        </div>

        {/* Reusable Universal Service Selector */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5">
            Choose Nain Music Service:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {services.map((svc) => {
              const isSelected = svc.id === currentGig.service_id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => handleServiceChange(svc.id)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold">{svc.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                    {svc.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Type (Dynamic according to selected service) */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-sm font-semibold text-white mb-1.5">
            Service Type for <span className="text-amber-400 font-bold">{currentService.name}</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Choose the specific specialty within {currentService.name.toLowerCase()}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentService.serviceTypes.map((type) => {
              const isSelected = currentGig.service_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateCurrentGig({ service_type: type })}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/80 text-amber-300 font-semibold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{type}</span>
                  {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Service-Specific Dynamic Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Service-Specific Metadata</span>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Only Relevant Fields
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Attributes shown below adapt automatically to {currentService.name} so you never enter irrelevant information.
          </p>
        </div>

        {/* Genres (if supported by service) */}
        {currentService.metadataFields.genres && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Genres (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentService.metadataFields.genres.map((genre) => {
                const isSelected = (currentGig.metadata.genres || []).includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Target DAW / Host (if applicable) */}
        {currentService.metadataFields.targetDaws && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Primary DAW / Audio Host
            </label>
            <select
              value={currentGig.metadata.target_daw || ''}
              onChange={(e) => updateCurrentGig(prev => ({
                ...prev,
                metadata: { ...prev.metadata, target_daw: e.target.value },
              }))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 w-full max-w-md focus:outline-none focus:border-amber-500"
            >
              <option value="">Select DAW (Optional)</option>
              {currentService.metadataFields.targetDaws.map((daw) => (
                <option key={daw} value={daw}>{daw}</option>
              ))}
            </select>
          </div>
        )}

        {/* Languages (for lyrics / classes / songwriting) */}
        {currentService.metadataFields.languages && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Language / Regional Dialect
            </label>
            <div className="flex flex-wrap gap-2">
              {currentService.metadataFields.languages.map((lang) => {
                const isSelected = (currentGig.metadata.languages || []).includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      const cur = currentGig.metadata.languages || [];
                      const updated = cur.includes(lang) ? cur.filter(l => l !== lang) : [...cur, lang];
                      updateCurrentGig(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, languages: updated },
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Skill Levels (for Music Classes) */}
        {currentService.metadataFields.skillLevels && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Target Student Skill Level
            </label>
            <div className="flex flex-wrap gap-2">
              {currentService.metadataFields.skillLevels.map((lvl) => {
                const isSelected = currentGig.metadata.skill_level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateCurrentGig(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, skill_level: lvl },
                    }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 4. Search Tags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <label className="block text-sm font-semibold text-white">
              Search Tags <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter positive keywords that buyers use when searching for music talent on Nain Music.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentGig.search_tags.length} / 10 tags
          </span>
        </div>

        {/* Tag Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TagIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. music mixing, audio mastering, pro tools, stems"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Add Tag
          </button>
        </div>

        {/* Active Positive Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {currentGig.search_tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-amber-400/70 hover:text-amber-300 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {currentGig.search_tags.length === 0 && (
            <span className="text-xs text-slate-500 italic">No search tags added yet. Add at least 1.</span>
          )}
        </div>

        {/* Optional Negative Keywords toggle */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowNegativeTags(!showNegativeTags)}
            className="text-xs font-medium text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
          >
            <span>{showNegativeTags ? '− Hide' : '+ Show'} Optional Negative Keywords</span>
            <span className="text-[10px] text-slate-500">(Exclude searches that do not fit your service)</span>
          </button>

          {showNegativeTags && (
            <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">
                Buyers searching for these terms won't see your Gig (e.g. "free", "podcast", "dj mix").
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={negativeTagInput}
                  onChange={(e) => setNegativeTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNegativeTag();
                    }
                  }}
                  placeholder="e.g. amateur, free, cheap"
                  className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={addNegativeTag}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-red-300 text-xs font-medium border border-slate-700"
                >
                  Add Negative
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(currentGig.negative_tags || []).map((neg) => (
                  <span
                    key={neg}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-red-950/40 border border-red-800/40 text-red-300"
                  >
                    -{neg}
                    <button type="button" onClick={() => removeNegativeTag(neg)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
