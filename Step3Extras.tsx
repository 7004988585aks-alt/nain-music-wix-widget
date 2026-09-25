import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  IndianRupee, 
  DollarSign,
  Check, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatGigPrice } from '../../data/servicesData';
import { GigExtra } from '../../types';

export const Step3Extras: React.FC = () => {
  const { 
    currentGig, 
    updateCurrentGig, 
    services, 
    selectedCurrency 
  } = useGig();

  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState(1000);
  const [newExtraDays, setNewExtraDays] = useState(1);
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!currentGig) return null;

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];

  const handleToggleExtra = (extraId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      extras: prev.extras.map(e => e.id === extraId ? { ...e, enabled: !e.enabled } : e),
    }));
  };

  const handleDeleteExtra = (extraId: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      extras: prev.extras.filter(e => e.id !== extraId),
    }));
  };

  const handleUpdateExtra = (extraId: string, field: keyof GigExtra, value: any) => {
    updateCurrentGig(prev => ({
      ...prev,
      extras: prev.extras.map(e => e.id === extraId ? { ...e, [field]: value } : e),
    }));
  };

  const handleAddSuggestedExtra = (suggested: { name: string; description: string; defaultPriceInr: number; additionalDays: number }) => {
    // Prevent duplicate
    if (currentGig.extras.some(e => e.name.toLowerCase() === suggested.name.toLowerCase())) {
      return;
    }

    const newExtra: GigExtra = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      gig_id: currentGig.id,
      name: suggested.name,
      description: suggested.description,
      price_inr: suggested.defaultPriceInr,
      delivery_days: suggested.additionalDays,
      enabled: true,
    };

    updateCurrentGig(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra],
    }));
  };

  const handleAddCustomExtra = () => {
    if (!newExtraName.trim()) return;

    const newExtra: GigExtra = {
      id: `ext_${Date.now()}_custom`,
      gig_id: currentGig.id,
      name: newExtraName.trim(),
      description: newExtraDesc.trim(),
      price_inr: Number(newExtraPrice) || 500,
      delivery_days: Number(newExtraDays) || 0,
      enabled: true,
    };

    updateCurrentGig(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra],
    }));

    setNewExtraName('');
    setNewExtraDesc('');
    setNewExtraPrice(1000);
    setNewExtraDays(1);
    setShowCustomForm(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Gig Extras (Add-ons)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Step 3 of 8 (Optional)
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Increase average order value by offering optional fast delivery, project sessions, and specialized deliverables.
        </p>
      </div>

      {/* Suggested Extras for this service */}
      {currentService.suggestedExtras.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommended Add-ons for {currentService.name}
            </h3>
            <span className="text-xs text-slate-400">Click to add to your gig</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentService.suggestedExtras.map((sug, idx) => {
              const isAlreadyAdded = currentGig.extras.some(e => e.name.toLowerCase() === sug.name.toLowerCase());
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition ${
                    isAlreadyAdded
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{sug.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{sug.description}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-amber-400 pt-1">
                      <span>{formatGigPrice(sug.defaultPriceInr, currentGig.pricing_currency, selectedCurrency)}</span>
                      <span className="text-slate-500">
                        {sug.additionalDays === 0
                          ? 'No extra time'
                          : sug.additionalDays > 0
                          ? `+${sug.additionalDays} day${sug.additionalDays > 1 ? 's' : ''}`
                          : `${sug.additionalDays} day priority`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => handleAddSuggestedExtra(sug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                      isAlreadyAdded
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isAlreadyAdded ? 'Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Gig Extras List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Extras on This Gig</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Buyers can select any of these enabled add-ons during checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Extra
          </button>
        </div>

        {/* Custom Form Modal/Section */}
        {showCustomForm && (
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">New Custom Music Extra</span>
              <button 
                type="button"
                onClick={() => setShowCustomForm(false)} 
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Extra Title</label>
                <input
                  type="text"
                  value={newExtraName}
                  onChange={(e) => setNewExtraName(e.target.value)}
                  placeholder="e.g. Dedicated Video Consultation"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Extra Days</label>
                  <select
                    value={newExtraDays}
                    onChange={(e) => setNewExtraDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>+0 Days (Same)</option>
                    <option value={1}>+1 Day</option>
                    <option value={2}>+2 Days</option>
                    <option value={3}>+3 Days</option>
                    <option value={-1}>-1 Day (Express)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={newExtraDesc}
                onChange={(e) => setNewExtraDesc(e.target.value)}
                placeholder="Explain what the buyer receives with this add-on..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddCustomExtra}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition"
              >
                Save Extra
              </button>
            </div>
          </div>
        )}

        {/* Extras Table / Cards */}
        <div className="space-y-2.5">
          {currentGig.extras.map((extra) => (
            <div
              key={extra.id}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                extra.enabled
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{extra.name}</span>
                  {!extra.enabled && (
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{extra.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {/* Price editor */}
                <div className="flex items-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono font-bold text-amber-400">
                  <span className="text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={extra.price_inr}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      handleUpdateExtra(extra.id, 'price_inr', val);
                    }}
                    className="w-16 bg-transparent text-right text-amber-400 focus:outline-none"
                  />
                </div>

                {/* Days impact */}
                <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  {extra.delivery_days === 0
                    ? '+0d'
                    : extra.delivery_days > 0
                    ? `+${extra.delivery_days}d`
                    : `${extra.delivery_days}d priority`}
                </span>

                {/* Enable toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleExtra(extra.id)}
                  title={extra.enabled ? 'Disable Extra' : 'Enable Extra'}
                  className="text-slate-400 hover:text-white"
                >
                  {extra.enabled ? (
                    <ToggleRight className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-600" />
                  )}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteExtra(extra.id)}
                  title="Delete Extra"
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {currentGig.extras.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No extras added to this gig yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">Select from recommendations above or create a custom add-on.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
