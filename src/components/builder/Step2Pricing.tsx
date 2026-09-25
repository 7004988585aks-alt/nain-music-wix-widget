import React, { useState } from 'react';
import { 
  Check, 
  IndianRupee, 
  Clock, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  HelpCircle,
  ShieldAlert,
  Sliders,
  Volume2,
  Disc,
  Headphones,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency } from '../../data/servicesData';
import { GigPackage, PackageType, ServiceFeatureDefinition } from '../../types';

export const Step2Pricing: React.FC = () => {
  const { 
    currentGig, 
    updateCurrentGig, 
    services, 
    selectedCurrency,
    getGigCapacity
  } = useGig();

  if (!currentGig) return null;

  const handleUpdatePackagePrice = (packageType: PackageType, val: number) => {
    updateCurrentGig(prev => ({
      ...prev,
      pricing_currency: 'INR',
      packages: prev.packages.map(pkg => {
        if (pkg.package_type === packageType) {
          return {
            ...pkg,
            price_inr: val,
            price_usd: undefined,
            pricing_currency: 'INR'
          };
        }
        return pkg;
      })
    }));
  };

  const currentService = services.find(s => s.id === currentGig.service_id) || services[0];
  const isMixingAndMastering = currentService.id === 'mixing-mastering';

  // Capacity details for this specific gig
  const capacityInfo = getGigCapacity(currentGig.id);
  const currentMaxCapacity = currentGig.max_active_projects || 1;
  const currentActive = capacityInfo.currentActiveProjects;
  const availableSlots = Math.max(0, currentMaxCapacity - currentActive);
  const isCurrentlyFull = availableSlots === 0;

  const handleSetMaxCapacity = (limit: number) => {
    const safeLimit = Math.max(1, Math.floor(limit));
    updateCurrentGig(prev => ({
      ...prev,
      max_active_projects: safeLimit,
    }));
  };

  const mixingFeatures = isMixingAndMastering
    ? currentService.features.filter(f => f.portion === 'mixing')
    : [];
  const masteringFeatures = isMixingAndMastering
    ? currentService.features.filter(f => f.portion === 'mastering')
    : [];
  const standardFeatures = isMixingAndMastering
    ? currentService.features.filter(f => f.portion !== 'mixing' && f.portion !== 'mastering')
    : currentService.features;

  const handlePackageChange = (packageType: PackageType, field: keyof GigPackage, value: any) => {
    updateCurrentGig(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => {
        if (pkg.package_type === packageType) {
          return { ...pkg, [field]: value };
        }
        return pkg;
      }),
    }));
  };

  const handleFeatureToggle = (packageType: PackageType, featureId: string, value: any) => {
    updateCurrentGig(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => {
        if (pkg.package_type === packageType) {
          return {
            ...pkg,
            included_features: {
              ...pkg.included_features,
              [featureId]: value,
            },
          };
        }
        return pkg;
      }),
    }));
  };

  const toggleDeliverable = (packageType: PackageType, deliverable: string) => {
    updateCurrentGig(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => {
        if (pkg.package_type === packageType) {
          const exists = pkg.deliverables.includes(deliverable);
          const nextDeliverables = exists
            ? pkg.deliverables.filter(d => d !== deliverable)
            : [...pkg.deliverables, deliverable];
          return { ...pkg, deliverables: nextDeliverables };
        }
        return pkg;
      }),
    }));
  };

  const toggleThreePackages = (enabled: boolean) => {
    updateCurrentGig({ has_three_packages: enabled });
  };

  // Standard common deliverable options for music
  const standardDeliverables = isMixingAndMastering
    ? [
        'High-Res 24-bit WAV Master',
        '320kbps MP3 Master',
        'Separated Mix Stems Archive',
        'Instrumental & TV Master',
        'Acapella Master',
        'DAW Project Session Zip',
        'Streaming True-Peak Report',
        'Commercial License Agreement',
      ]
    : [
        'High-Res 24-bit WAV',
        '320kbps MP3',
        'Separated Stems Archive',
        'DAW Project Zip File',
        'Instrumental Version',
        'Acapella Version',
        'Commercial License Agreement',
      ];

  const packagesToDisplay = currentGig.has_three_packages 
    ? currentGig.packages 
    : currentGig.packages.filter(p => p.package_type === 'basic');

  const renderFeatureRow = (feature: ServiceFeatureDefinition, pkg: GigPackage, accentColor: 'blue' | 'amber' | 'default' = 'default') => {
    const currentValue = pkg.included_features[feature.id];

    if (feature.type === 'boolean') {
      return (
        <label
          key={feature.id}
          className={`flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer select-none p-1.5 rounded transition ${
            accentColor === 'blue'
              ? 'hover:bg-blue-950/40'
              : accentColor === 'amber'
              ? 'hover:bg-amber-950/40'
              : 'hover:bg-slate-800/40'
          }`}
        >
          <span className="truncate pr-2">{feature.name}</span>
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => handleFeatureToggle(pkg.package_type, feature.id, e.target.checked)}
            className={`w-4 h-4 rounded border-slate-700 bg-slate-950 cursor-pointer ${
              accentColor === 'blue'
                ? 'text-blue-500 focus:ring-blue-500'
                : 'text-amber-500 focus:ring-amber-500'
            }`}
          />
        </label>
      );
    }

    if (feature.type === 'number') {
      return (
        <div key={feature.id} className="flex items-center justify-between text-xs p-1.5">
          <span className="text-slate-300 truncate pr-2">{feature.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min={1}
              value={Number(currentValue) || 1}
              onChange={(e) => handleFeatureToggle(pkg.package_type, feature.id, Number(e.target.value))}
              className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-right font-mono text-white focus:outline-none focus:border-amber-500"
            />
            {feature.unit && <span className="text-[10px] text-slate-400">{feature.unit}</span>}
          </div>
        </div>
      );
    }

    return (
      <div key={feature.id} className="text-xs p-1.5 space-y-1">
        <span className="text-slate-300">{feature.name}</span>
        <input
          type="text"
          value={String(currentValue || '')}
          onChange={(e) => handleFeatureToggle(pkg.package_type, feature.id, e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Pricing & Universal Packages</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Step 2 of 8
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure your Basic, Standard, and Premium tiers adapted to {currentService.name}.
          </p>
        </div>

        {/* 3 Packages vs 1 Package Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start">
          <button
            type="button"
            onClick={() => toggleThreePackages(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !currentGig.has_three_packages
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Tier
          </button>
          <button
            type="button"
            onClick={() => toggleThreePackages(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentGig.has_three_packages
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Tiers (Basic / Standard / Premium)
          </button>
        </div>
      </div>

      {/* Package Visibility Compliance Alert */}
      <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-300">
            Nain Music Package Visibility Rule
          </p>
          <p className="text-slate-300">
            Packages in draft mode are strictly hidden from buyers. When you publish this Gig, active packages become live buyer offers. Base prices are permanently stored in INR (₹) and converted automatically for international buyers.
          </p>
        </div>
      </div>

      {/* NEW FEATURE: PROJECT CAPACITY / MAXIMUM ACTIVE PROJECTS */}
      <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Briefcase className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Project Capacity / Maximum Active Projects
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentService.name}
              </span>
            </div>
            <p className="text-xs text-amber-300 font-medium">
              How many projects can you handle at the same time?
            </p>
            <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
              Set your concurrent project limit for this specific service. When your active orders reach this number, Nain Music automatically marks this Gig as <strong>Currently Fully Booked</strong> so you never get overloaded, ensuring premium audio quality and on-time deliveries.
            </p>
          </div>

          {/* Current Live Status Pill */}
          <div className="shrink-0">
            {isCurrentlyFull ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Currently Fully Booked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {availableSlots} Slot{availableSlots > 1 ? 's' : ''} Available
              </span>
            )}
          </div>
        </div>

        {/* Limit Selection Controls */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Select Maximum Active Projects Limit:
          </label>
          
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 5, 10].map((num) => {
              const isSelected = currentMaxCapacity === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSetMaxCapacity(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{num}</span>
                  {num === 1 && <span className="text-[10px] font-normal opacity-80">(Default)</span>}
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}

            {/* Custom Limit Input */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400">Custom Limit:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={currentMaxCapacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    handleSetMaxCapacity(val);
                  }
                }}
                className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-center font-mono font-bold text-amber-400 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Automatic Capacity Calculation Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Maximum Active Projects
            </span>
            <span className="text-xl font-black font-mono text-white">
              {currentMaxCapacity}
            </span>
            <p className="text-[10px] text-slate-500">
              Seller configured capacity ceiling
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Active Projects
            </span>
            <span className="text-xl font-black font-mono text-amber-400">
              {currentActive}
            </span>
            <p className="text-[10px] text-slate-500">
              Orders currently in progress / intake
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Available Project Slots
            </span>
            <span className={`text-xl font-black font-mono ${availableSlots > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {availableSlots}
            </span>
            <p className="text-[10px] text-slate-500">
              Open slots ready for instant buyer booking
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-1">
          💡 Capacity is tracked independently for each service (Lyrics, Songwriting, Production, Mixing & Mastering, etc.). Completing or delivering an active project automatically reopens a slot.
        </p>
      </div>

      {/* Dynamic Mixing & Mastering Service Banner */}
      {isMixingAndMastering && (
        <div className="p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/40 border border-blue-500/30 rounded-2xl flex items-start gap-3 shadow-md">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-white flex items-center gap-2">
              <span>Mixing & Mastering Dual-Phase Package Scope</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                Combined Service Mode
              </span>
            </p>
            <p className="text-slate-300 leading-relaxed">
              Configure what is included in the <strong>Mixing portion</strong> (multi-track balance, stems count, vocal tuning, analog summing) and what is included in the <strong>Mastering portion</strong> (commercial loudness target, stereo imaging, streaming compliance, high-res files). Buyers will see clear breakdowns confirming their song receives both complete mixing and mastering.
            </p>
          </div>
        </div>
      )}

      {/* Gig Base Pricing Currency */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Gig Pricing Currency: Indian Rupee (₹)
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Minimum Floor: ₹1,000 INR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            All gig tiers and studio packages are priced strictly in <strong>Indian Rupees (₹)</strong>.
          </p>
        </div>

        <div className="flex items-center px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>₹ INR Standard</span>
          </span>
        </div>
      </div>

      {/* Universal Packages Grid / Matrix */}
      <div className={`grid gap-4 ${currentGig.has_three_packages ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 max-w-xl mx-auto'}`}>
        {packagesToDisplay.map((pkg) => {
          const typeColors = {
            basic: 'border-slate-800 bg-slate-900/90',
            standard: 'border-amber-500/50 bg-slate-900/95 ring-1 ring-amber-500/20',
            premium: 'border-slate-700 bg-slate-900/90',
          }[pkg.package_type];

          const badgeText = {
            basic: 'Basic Package',
            standard: 'Standard (Most Popular)',
            premium: 'Premium Platinum',
          }[pkg.package_type];

          return (
            <div
              key={pkg.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg relative ${typeColors}`}
            >
              {/* Package Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                    {badgeText}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {pkg.package_type.toUpperCase()}
                  </span>
                </div>

                {/* Package Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => handlePackageChange(pkg.package_type, 'name', e.target.value)}
                    placeholder="e.g. Silver Single Mix"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={pkg.description}
                    onChange={(e) => handlePackageChange(pkg.package_type, 'description', e.target.value)}
                    placeholder="Briefly describe what is delivered in this tier"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Price in INR */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                      <span>Package Price (₹ INR)</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Min: ₹1,000</span>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={1000}
                        step={50}
                        value={pkg.price_inr}
                        onChange={(e) => handleUpdatePackagePrice(pkg.package_type, Number(e.target.value))}
                        className={`w-full bg-slate-900 border rounded-lg pl-7 pr-3 py-1.5 text-sm font-bold text-white focus:outline-none font-mono ${
                          pkg.price_inr < 1000 ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-amber-500'
                        }`}
                        placeholder="e.g. 1000"
                      />
                    </div>
                    {pkg.price_inr < 1000 && (
                      <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                        Minimum price floor is ₹1,000 INR.
                      </p>
                    )}
                  </div>
                </div>

                {/* Scope & Delivery Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Delivery Days
                    </label>
                    <select
                      value={pkg.delivery_days}
                      onChange={(e) => handlePackageChange(pkg.package_type, 'delivery_days', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map(days => (
                        <option key={days} value={days}>{days} Day{days > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      Revisions
                    </label>
                    <select
                      value={pkg.revisions}
                      onChange={(e) => handlePackageChange(pkg.package_type, 'revisions', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value={1}>1 Revision</option>
                      <option value={2}>2 Revisions</option>
                      <option value={3}>3 Revisions</option>
                      <option value={4}>4 Revisions</option>
                      <option value={5}>5 Revisions</option>
                      <option value={-1}>Unlimited</option>
                    </select>
                  </div>
                </div>

                {/* Quantity / Scope */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantity / Scope Limit
                  </label>
                  <input
                    type="text"
                    value={pkg.quantity_scope}
                    onChange={(e) => handlePackageChange(pkg.package_type, 'quantity_scope', e.target.value)}
                    placeholder="e.g. Up to 16 stems / 1 song"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Service-Specific Included Features */}
                {isMixingAndMastering ? (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        Mixing & Mastering Features
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                        Dual Scope
                      </span>
                    </div>

                    {/* Section 1: Mixing Portion */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5">
                        <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                          <Sliders className="w-3 h-3 text-blue-400" />
                          1. Mixing Portion Included
                        </span>
                        <span className="text-[10px] font-medium text-blue-400/80 uppercase tracking-wide">
                          Multi-track
                        </span>
                      </div>
                      <div className="space-y-1">
                        {mixingFeatures.map((feature) => renderFeatureRow(feature, pkg, 'blue'))}
                      </div>
                    </div>

                    {/* Section 2: Mastering Portion */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          2. Mastering Portion Included
                        </span>
                        <span className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wide">
                          Loudness & Polish
                        </span>
                      </div>
                      <div className="space-y-1">
                        {masteringFeatures.map((feature) => renderFeatureRow(feature, pkg, 'amber'))}
                      </div>
                    </div>

                    {/* Dual Song Coverage Affirmation */}
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        <strong>Song Guarantee:</strong> This tier explicitly covers both <strong>Multi-track Mixing</strong> and <strong>Final Commercial Mastering</strong> for the buyer.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-800 space-y-2.5">
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      {currentService.name} Features
                    </span>

                    <div className="space-y-2">
                      {standardFeatures.map((feature) => renderFeatureRow(feature, pkg, 'default'))}
                    </div>
                  </div>
                )}

                {/* Deliverables Checklist */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Deliverables Included
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {standardDeliverables.map((deliv) => {
                      const isChecked = pkg.deliverables.includes(deliv);
                      return (
                        <label
                          key={deliv}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDeliverable(pkg.package_type, deliv)}
                            className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 bg-slate-950 cursor-pointer"
                          />
                          <span className={isChecked ? 'text-amber-300 font-medium' : 'text-slate-400'}>
                            {deliv}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
