import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  Link2, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Camera, 
  Music, 
  Headphones, 
  Check, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { BuyerProfile, BuyerLanguageItem, BuyerLanguageProficiency, BuyerLinkedAccountItem } from '../../types';

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBillingModal?: () => void;
}

const PROFICIENCY_LEVELS: BuyerLanguageProficiency[] = [
  'Basic',
  'Conversational',
  'Fluent',
  'Native / Bilingual'
];

const AVAILABLE_PROVIDERS: Array<{
  provider: BuyerLinkedAccountItem['provider'];
  label: string;
  iconName: string;
  color: string;
  defaultUrl: string;
  urlPlaceholder: string;
}> = [
  { 
    provider: 'Spotify', 
    label: 'Spotify Artist / User', 
    iconName: 'S', 
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
    defaultUrl: 'https://open.spotify.com/artist/anilkumarsaurav',
    urlPlaceholder: 'https://open.spotify.com/artist/your-id'
  },
  { 
    provider: 'YouTube', 
    label: 'YouTube Channel', 
    iconName: 'Y', 
    color: 'text-rose-600 bg-rose-50 border-rose-200', 
    defaultUrl: 'https://www.youtube.com/@AnilKumarSaurav',
    urlPlaceholder: 'https://www.youtube.com/@ChannelName'
  },
  { 
    provider: 'Instagram', 
    label: 'Instagram Profile', 
    iconName: 'IG', 
    color: 'text-pink-600 bg-pink-50 border-pink-200', 
    defaultUrl: 'https://www.instagram.com/anilkumarsaurav',
    urlPlaceholder: 'https://www.instagram.com/yourusername'
  },
  { 
    provider: 'SoundCloud', 
    label: 'SoundCloud Profile', 
    iconName: 'SC', 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    defaultUrl: 'https://soundcloud.com/anilkumarsaurav',
    urlPlaceholder: 'https://soundcloud.com/yourusername'
  }
];

export const BuyerProfileModal: React.FC<BuyerProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    buyerProfile, 
    updateBuyerProfile, 
    orders 
  } = useGig();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BuyerProfile>(buyerProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New language form state
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState<BuyerLanguageProficiency>('Fluent');
  const [showAddLanguage, setShowAddLanguage] = useState(false);

  // New interest tag form state
  const [newInterest, setNewInterest] = useState('');
  const [showAddInterest, setShowAddInterest] = useState(false);

  // Linked account edit state (URL based)
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tempAccountUrl, setTempAccountUrl] = useState('');

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(buyerProfile);
      setIsEditing(false);
      setSaveSuccess(false);
      setEditingProvider(null);
    }
  }, [isOpen, buyerProfile]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBuyerProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;
    const newItem: BuyerLanguageItem = {
      id: `lang_${Date.now()}`,
      language: newLanguage.trim(),
      proficiency: newProficiency
    };
    const updatedLanguages = [...(formData.languages || []), newItem];
    const updated = { ...formData, languages: updatedLanguages };
    setFormData(updated);
    updateBuyerProfile(updated);
    setNewLanguage('');
    setShowAddLanguage(false);
  };

  const handleRemoveLanguage = (id: string) => {
    const updatedLanguages = (formData.languages || []).filter(l => l.id !== id);
    const updated = { ...formData, languages: updatedLanguages };
    setFormData(updated);
    updateBuyerProfile(updated);
  };

  // Helper to ensure URL has http:// or https://
  const formatUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleToggleLinkedAccount = (provider: BuyerLinkedAccountItem['provider']) => {
    const existing = (formData.linked_accounts || []).find(a => a.provider === provider);
    let updatedAccounts: BuyerLinkedAccountItem[];

    if (existing) {
      updatedAccounts = formData.linked_accounts.map(a => 
        a.provider === provider 
          ? { ...a, is_connected: !a.is_connected, connected_at: !a.is_connected ? new Date().toISOString().split('T')[0] : undefined } 
          : a
      );
    } else {
      const defaultItem = AVAILABLE_PROVIDERS.find(p => p.provider === provider);
      updatedAccounts = [
        ...(formData.linked_accounts || []),
        {
          id: `acc_${Date.now()}`,
          provider,
          identifier: defaultItem?.defaultUrl || '',
          is_connected: true,
          connected_at: new Date().toISOString().split('T')[0]
        }
      ];
    }

    const updated = { ...formData, linked_accounts: updatedAccounts };
    setFormData(updated);
    updateBuyerProfile(updated);
  };

  const handleSaveLinkedAccountUrl = (provider: BuyerLinkedAccountItem['provider']) => {
    const formatted = formatUrl(tempAccountUrl);
    const updatedAccounts = (formData.linked_accounts || []).map(a => 
      a.provider === provider ? { ...a, identifier: formatted || a.identifier } : a
    );
    const updated = { ...formData, linked_accounts: updatedAccounts };
    setFormData(updated);
    updateBuyerProfile(updated);
    setEditingProvider(null);
    setTempAccountUrl('');
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const tag = newInterest.trim();
    if (!formData.interests.includes(tag)) {
      const updatedInterests = [...formData.interests, tag];
      const updated = { ...formData, interests: updatedInterests };
      setFormData(updated);
      updateBuyerProfile(updated);
    }
    setNewInterest('');
    setShowAddInterest(false);
  };

  const handleRemoveInterest = (tag: string) => {
    const updatedInterests = formData.interests.filter(t => t !== tag);
    const updated = { ...formData, interests: updatedInterests };
    setFormData(updated);
    updateBuyerProfile(updated);
  };

  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Profile Modal Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-sm">
              <UserIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Buyer Profile
                </h2>
                {formData.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Client
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Manage your public client identity, languages, connected profile URLs & music production needs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Identity, Bio, Member Since, Location (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Profile Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4 shadow-xs">
                
                {/* Avatar with Status Ring */}
                <div className="relative inline-block mx-auto">
                  <img
                    src={formData.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        const newUrl = prompt('Enter image URL for Avatar:', formData.avatar_url);
                        if (newUrl) setFormData({ ...formData, avatar_url: newUrl });
                      }}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 transition shadow cursor-pointer"
                      title="Change photo URL"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Client" />
                </div>

                {/* Name & Headline */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2 text-left">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username Handle</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Headline / Role</label>
                        <input
                          type="text"
                          value={formData.headline || ''}
                          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                          placeholder="e.g. Music Creator & Audio Project Director"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {formData.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        @{formData.username}
                      </p>
                      {formData.headline && (
                        <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 mt-2 inline-block">
                          {formData.headline}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-left text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed Orders</span>
                    <span className="text-base font-black text-slate-900">{completedOrdersCount || 8}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Projects</span>
                    <span className="text-base font-black text-amber-600">{activeOrdersCount || 1}</span>
                  </div>
                </div>

                {/* Profile Details Rows */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200 text-left text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-36 px-2 py-1 text-xs text-right font-bold rounded border border-slate-300 bg-white"
                      />
                    ) : (
                      <span className="font-bold text-slate-900">{formData.location || 'Mumbai, India'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Member Since
                    </span>
                    <span className="font-bold text-slate-900">{formData.member_since || 'March 2024'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email
                    </span>
                    <span className="font-bold text-slate-900 truncate max-w-[170px]" title={formData.email}>
                      {formData.email}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Bio, Languages, Linked Accounts, Music Taste (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* SECTION 1: Bio / Description */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      About & Project Background
                    </h3>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Share your musical background, project requirements, and production vision..."
                      className="w-full p-3 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50 leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-400">
                      Audio producers and engineers read this to customize deliverables for your tracks.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {formData.bio || 'Independent music producer, creator and audio project director.'}
                  </p>
                )}
              </div>

              {/* SECTION 2: Languages */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Languages
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddLanguage(!showAddLanguage)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Language
                  </button>
                </div>

                {/* Language list */}
                <div className="space-y-2">
                  {(formData.languages && formData.languages.length > 0) ? (
                    formData.languages.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{item.language}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px]">
                            {item.proficiency}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(item.id)}
                          className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                          title="Remove language"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No languages added yet.</p>
                  )}
                </div>

                {/* Add language inline form */}
                {showAddLanguage && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Add Language</span>
                      <button 
                        type="button" 
                        onClick={() => setShowAddLanguage(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="e.g. Hindi, English, Punjabi, Bengali"
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={newProficiency}
                        onChange={(e) => setNewProficiency(e.target.value as BuyerLanguageProficiency)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLanguage(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        disabled={!newLanguage.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Linked Accounts (URL based) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Connected Profiles (Direct URLs)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Connect profile links with full Web URLs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_PROVIDERS.map((item) => {
                    const linkedItem = (formData.linked_accounts || []).find(a => a.provider === item.provider);
                    const isConnected = linkedItem?.is_connected || false;
                    const currentUrl = linkedItem?.identifier || item.defaultUrl;

                    return (
                      <div
                        key={item.provider}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                          isConnected 
                            ? 'bg-white border-slate-300 shadow-2xs' 
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg font-black text-[11px] flex items-center justify-center border ${item.color}`}>
                              {item.iconName}
                            </span>
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {isConnected ? 'Connected Web URL' : 'Not linked'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleLinkedAccount(item.provider)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              isConnected
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                            }`}
                          >
                            {isConnected ? '✓ Linked' : '+ Link URL'}
                          </button>
                        </div>

                        {/* URL Display & Editor */}
                        {isConnected && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                            {editingProvider === item.provider ? (
                              <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
                                  Profile Web URL
                                </label>
                                <input
                                  type="url"
                                  value={tempAccountUrl}
                                  onChange={(e) => setTempAccountUrl(e.target.value)}
                                  placeholder={item.urlPlaceholder}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProvider(null);
                                      setTempAccountUrl('');
                                    }}
                                    className="px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLinkedAccountUrl(item.provider)}
                                    className="px-3 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded cursor-pointer"
                                  >
                                    Save URL
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <a
                                  href={currentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-amber-600 truncate font-mono text-[10px] flex items-center gap-1 group/link flex-1"
                                  title={currentUrl}
                                >
                                  <span className="truncate">{currentUrl}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover/link:opacity-100" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProvider(item.provider);
                                    setTempAccountUrl(currentUrl);
                                  }}
                                  className="text-amber-600 hover:text-amber-700 font-bold text-[10px] shrink-0 hover:underline cursor-pointer pl-1"
                                >
                                  Edit URL
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Music Interests & Production Needs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Music Interests & Audio Needs
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddInterest(!showAddInterest)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Interest
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(formData.interests && formData.interests.length > 0) ? (
                    formData.interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                      >
                        <Headphones className="w-3 h-3 text-amber-600" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(tag)}
                          className="hover:text-red-500 ml-0.5 text-slate-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-1">No music interests listed.</p>
                  )}
                </div>

                {showAddInterest && (
                  <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddInterest(); }}
                      placeholder="e.g. Vocal Tuning, Dolby Atmos, Film Score"
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                      className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nain Music • Verified Client Profile</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition cursor-pointer"
            >
              Close
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleSave()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 transition cursor-pointer shadow-xs"
              >
                Save All Profile Changes
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
