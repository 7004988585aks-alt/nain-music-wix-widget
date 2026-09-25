import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { 
  SUPPORTED_COUNTRIES, 
  COUNTRIES_BY_CODE, 
  validateBillingProfile 
} from '../../utils/taxService';
import { BuyerBillingProfile, BuyerType } from '../../types';

interface BuyerBillingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasonPrompt?: string; // Optional message explaining why it was opened (e.g., "Complete required details before checkout")
  onSaved?: (profile: BuyerBillingProfile) => void;
}

export const BuyerBillingProfileModal: React.FC<BuyerBillingProfileModalProps> = ({
  isOpen,
  onClose,
  reasonPrompt,
  onSaved,
}) => {
  const { buyerBillingProfile, updateBuyerBillingProfile } = useGig();

  // Local draft state initialized with the current saved billing profile
  const [formData, setFormData] = useState<BuyerBillingProfile>(buyerBillingProfile);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if context updates
  React.useEffect(() => {
    setFormData(buyerBillingProfile);
  }, [buyerBillingProfile, isOpen]);

  if (!isOpen) return null;

  const currentCountryItem = COUNTRIES_BY_CODE[formData.country_code] || COUNTRIES_BY_CODE.OTHER;

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES_BY_CODE[countryCode] || COUNTRIES_BY_CODE.OTHER;
    setFormData(prev => ({
      ...prev,
      country_code: countryCode,
      country: country.name,
      state: country.states && country.states.length > 0 ? country.states[0].name : '',
      state_code: country.states && country.states.length > 0 ? country.states[0].code : '',
    }));
    setErrors([]);
  };

  const handleStateChange = (stateValue: string) => {
    const matched = currentCountryItem.states?.find(
      s => s.code === stateValue || s.name === stateValue
    );
    setFormData(prev => ({
      ...prev,
      state: matched ? matched.name : stateValue,
      state_code: matched ? matched.code : '',
    }));
  };

  const handleBuyerTypeChange = (type: BuyerType) => {
    setFormData(prev => ({
      ...prev,
      buyer_type: type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBillingProfile(formData);
    
    if (!validation.isValid) {
      const errs: string[] = [];
      if (validation.missingFields.length > 0) {
        errs.push(`Please provide required billing fields: ${validation.missingFields.join(', ')}.`);
      }
      if (validation.errors.length > 0) {
        errs.push(...validation.errors);
      }
      setErrors(errs);
      return;
    }

    setErrors([]);
    updateBuyerBillingProfile(formData);
    setSaveSuccess(true);

    if (onSaved) {
      onSaved(formData);
    }

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-profile-title"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="billing-profile-title" className="text-base font-bold text-white flex items-center gap-2">
                Buyer Account Billing Profile
              </h2>
              <p className="text-xs text-slate-400">
                Statutory indirect tax assessment & legal tax invoicing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Prompt if prompted by checkout */}
        {reasonPrompt && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-300">Action Required: </span>
              {reasonPrompt}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Account Profile Storage Explainer */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              This billing information is saved once to your account profile. It is automatically loaded on all orders so you never have to re-enter it at checkout. Nain’s engine computes applicable indirect taxes (GST, VAT, or Sales Tax) based strictly on these factual details.
            </span>
          </div>

          {/* Errors list if validation fails */}
          {errors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1">
              <div className="font-semibold text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Please correct the following:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-red-300">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Buyer Type Toggle (Individual vs Business) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Buyer Classification
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleBuyerTypeChange('individual')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  formData.buyer_type === 'individual'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Individual / Personal
              </button>
              <button
                type="button"
                onClick={() => handleBuyerTypeChange('business')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  formData.buyer_type === 'business'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Registered Business
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {formData.buyer_type === 'business' 
                ? 'Eligible for business tax credit / reverse charge invoicing if valid Tax ID is provided.'
                : 'Standard personal consumption. Applicable indirect tax will be itemized on your receipt.'}
            </p>
          </div>

          {/* Business Entity Name & Tax ID (if business) */}
          {formData.buyer_type === 'business' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Legal Business / Company Name <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] text-slate-500">Printed on Tax Invoice</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SoundWave Studios LLC / Apex Music Pvt Ltd"
                  value={formData.business_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>{currentCountryItem.taxIdLabel || 'Tax ID / Registration Number'}</span>
                  <span className="text-[10px] text-slate-500">For ITC / Reverse Charge</span>
                </label>
                <input
                  type="text"
                  placeholder={currentCountryItem.taxIdPlaceholder || 'e.g. Tax Registration Number'}
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value.toUpperCase() }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono uppercase"
                />
              </div>
            </div>
          )}

          {/* Geographic Details: Country, State, Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Country Selector (Clean Country Names only, no tax rates) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Billing Country <span className="text-amber-400">*</span></span>
                <span className="text-[10px] text-slate-500">Clean Geographic Jurisdiction</span>
              </label>
              <select
                value={formData.country_code}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State / Province / Region (Clean names only, no tax rates) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>
                  State / Province {currentCountryItem.requiresState && <span className="text-amber-400">*</span>}
                </span>
              </label>
              {currentCountryItem.states && currentCountryItem.states.length > 0 ? (
                <select
                  value={formData.state_code || formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Select State / Region...</option>
                  {currentCountryItem.states.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Greater London / Dublin"
                  value={formData.state || ''}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            {/* Postal / ZIP Code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>
                  Postal / ZIP Code {currentCountryItem.requiresPostalCode && <span className="text-amber-400">*</span>}
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. 800001 or 90210"
                value={formData.postal_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Street / Address Line 1 */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Billing Address Line 1
              </label>
              <input
                type="text"
                placeholder="Street address, building, suite/flat number"
                value={formData.address_line1 || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* Statutory Guarantee note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tax calculations are derived automatically from legal statutory rules.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveSuccess}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-md disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  Saved Successfully!
                </>
              ) : (
                'Save Billing Profile'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
