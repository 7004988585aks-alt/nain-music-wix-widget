import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Globe, 
  Link2, 
  ShieldCheck, 
  Star, 
  Clock, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Sliders, 
  Headphones, 
  Award, 
  Check, 
  Music,
  ExternalLink,
  Layers,
  Camera,
  Package,
  Wrench,
  CheckCircle2,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { User, BuyerLanguageItem, BuyerLanguageProficiency, BuyerLinkedAccountItem, Gig } from '../../types';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBuilder?: (gigId?: string) => void;
}

const PROFICIENCY_LEVELS: BuyerLanguageProficiency[] = [
  'Basic',
  'Conversational',
  'Fluent',
  'Native / Bilingual'
];

const SELLER_LINKED_PROVIDERS: Array<{
  provider: BuyerLinkedAccountItem['provider'];
  label: string;
  iconName: string;
  color: string;
  defaultUrl: string;
  urlPlaceholder: string;
}> = [
  { 
    provider: 'Spotify', 
    label: 'Spotify Artist / Studio', 
    iconName: 'S', 
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
    defaultUrl: 'https://open.spotify.com/artist/devon_soundlab',
    urlPlaceholder: 'https://open.spotify.com/artist/...' 
  },
  { 
    provider: 'YouTube', 
    label: 'YouTube Studio Channel', 
    iconName: 'Y', 
    color: 'text-rose-600 bg-rose-50 border-rose-200', 
    defaultUrl: 'https://www.youtube.com/@DevonSoundLab',
    urlPlaceholder: 'https://www.youtube.com/@Channel' 
  },
  { 
    provider: 'SoundCloud', 
    label: 'SoundCloud Portfolio', 
    iconName: 'SC', 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    defaultUrl: 'https://soundcloud.com/devon-soundlab-official',
    urlPlaceholder: 'https://soundcloud.com/username' 
  },
  { 
    provider: 'Instagram', 
    label: 'Instagram Studio Page', 
    iconName: 'IG', 
    color: 'text-pink-600 bg-pink-50 border-pink-200', 
    defaultUrl: 'https://www.instagram.com/devonsoundlab',
    urlPlaceholder: 'https://www.instagram.com/username' 
  }
];

const CLIENT_REVIEWS_SAMPLE = [
  {
    id: 'rev_1',
    buyer_name: 'Anil Kumar Saurav',
    buyer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    country: 'India 🇮🇳',
    rating: 5,
    date: '3 days ago',
    gig_title: 'Professional Mixing & Mastering (Analog Console)',
    comment: 'Devon delivers world-class quality! The vocal sitting in the mix has unmatched warmth and clarity. Delivered way before deadline with pristine 24-bit 96kHz lossless masters.'
  },
  {
    id: 'rev_2',
    buyer_name: 'Raghav Sharma',
    buyer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    country: 'India 🇮🇳',
    rating: 5,
    date: '1 week ago',
    gig_title: 'Vocal Tuning & Pitch Correction with Melodyne',
    comment: 'Flawless natural tuning without any robotic phase artifacts. Will definitely order again for our upcoming Bollywood single!'
  },
  {
    id: 'rev_3',
    buyer_name: 'Marcus Vance',
    buyer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    country: 'United Kingdom 🇬🇧',
    rating: 5,
    date: '2 weeks ago',
    gig_title: 'Dolby Atmos Spatial Audio Mix & Master',
    comment: 'Astonishing 3D depth and binaural balance. Sounded magnificent on Apple Music and AirPod Max.'
  }
];

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBuilder
}) => {
  const { currentUser, updateCurrentUser, gigs, selectedCurrency } = useGig();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(currentUser);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New items input states
  const [newGear, setNewGear] = useState('');
  const [showAddGear, setShowAddGear] = useState(false);

  const [newDaw, setNewDaw] = useState('');
  const [showAddDaw, setShowAddDaw] = useState(false);

  const [newSkill, setNewSkill] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const [newCert, setNewCert] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState<BuyerLanguageProficiency>('Fluent');
  const [showAddLanguage, setShowAddLanguage] = useState(false);

  // Linked accounts URL edit
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tempAccountUrl, setTempAccountUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(currentUser);
      setIsEditing(false);
      setSaveSuccess(false);
      setEditingProvider(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateCurrentUser(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddGear = () => {
    if (!newGear.trim()) return;
    const updated = [...(formData.studio_gear || []), newGear.trim()];
    const userUpdate = { ...formData, studio_gear: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setNewGear('');
    setShowAddGear(false);
  };

  const handleRemoveGear = (index: number) => {
    const updated = (formData.studio_gear || []).filter((_, i) => i !== index);
    const userUpdate = { ...formData, studio_gear: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const handleAddDaw = () => {
    if (!newDaw.trim()) return;
    const updated = [...(formData.daws || []), newDaw.trim()];
    const userUpdate = { ...formData, daws: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setNewDaw('');
    setShowAddDaw(false);
  };

  const handleRemoveDaw = (index: number) => {
    const updated = (formData.daws || []).filter((_, i) => i !== index);
    const userUpdate = { ...formData, daws: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...(formData.skills || []), newSkill.trim()];
    const userUpdate = { ...formData, skills: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setNewSkill('');
    setShowAddSkill(false);
  };

  const handleRemoveSkill = (index: number) => {
    const updated = (formData.skills || []).filter((_, i) => i !== index);
    const userUpdate = { ...formData, skills: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    const updated = [...(formData.certifications || []), newCert.trim()];
    const userUpdate = { ...formData, certifications: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setNewCert('');
    setShowAddCert(false);
  };

  const handleRemoveCert = (index: number) => {
    const updated = (formData.certifications || []).filter((_, i) => i !== index);
    const userUpdate = { ...formData, certifications: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;
    const newItem: BuyerLanguageItem = {
      id: `slang_${Date.now()}`,
      language: newLanguage.trim(),
      proficiency: newProficiency
    };
    const updated = [...(formData.languages || []), newItem];
    const userUpdate = { ...formData, languages: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setNewLanguage('');
    setShowAddLanguage(false);
  };

  const handleRemoveLanguage = (id: string) => {
    const updated = (formData.languages || []).filter(l => l.id !== id);
    const userUpdate = { ...formData, languages: updated };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const formatUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleToggleLinkedAccount = (provider: BuyerLinkedAccountItem['provider']) => {
    const existing = (formData.linked_accounts || []).find(a => a.provider === provider);
    let updatedAccounts: BuyerLinkedAccountItem[];

    const defaultItem = SELLER_LINKED_PROVIDERS.find(p => p.provider === provider);

    if (existing) {
      updatedAccounts = (formData.linked_accounts || []).map(a => 
        a.provider === provider ? { ...a, is_connected: !a.is_connected } : a
      );
    } else {
      updatedAccounts = [
        ...(formData.linked_accounts || []),
        {
          id: `sacc_${Date.now()}`,
          provider,
          identifier: defaultItem?.defaultUrl || `https://${provider.toLowerCase()}.com/profile`,
          is_connected: true
        }
      ];
    }

    const userUpdate = { ...formData, linked_accounts: updatedAccounts };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
  };

  const handleSaveLinkedAccountUrl = (provider: BuyerLinkedAccountItem['provider']) => {
    const formatted = formatUrl(tempAccountUrl);
    const updatedAccounts = (formData.linked_accounts || []).map(a => 
      a.provider === provider ? { ...a, identifier: formatted || a.identifier } : a
    );
    const userUpdate = { ...formData, linked_accounts: updatedAccounts };
    setFormData(userUpdate);
    updateCurrentUser(userUpdate);
    setEditingProvider(null);
    setTempAccountUrl('');
  };

  const formatPriceDisplay = (priceInr: number) => {
    if (selectedCurrency === 'INR') {
      return `₹${priceInr.toLocaleString('en-IN')}`;
    }
    const approxUsd = Math.round(priceInr / 83);
    return `$${approxUsd}`;
  };

  const sellerGigs = gigs.filter(g => g.status === 'published' || g.status === 'draft');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-sm">
              <Headphones className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Seller Studio Profile
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Studio Verified Pro
                </span>
                {formData.level && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Award className="w-3 h-3 text-amber-400" />
                    {formData.level}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Public studio identity showcasing analog gear, primary DAWs, credentials, client ratings & active gigs.
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
            
            {/* LEFT COLUMN: Seller Identity, Studio Stats, Bio, Languages, Links, Certifications (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Primary Identity Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4 shadow-xs">
                
                {/* Avatar */}
                <div className="relative inline-block mx-auto">
                  <img
                    src={formData.avatar_url}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        const newUrl = prompt('Enter image URL for Avatar:', formData.avatar_url);
                        if (newUrl) {
                          const updated = { ...formData, avatar_url: newUrl };
                          setFormData(updated);
                          updateCurrentUser(updated);
                        }
                      }}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 transition shadow cursor-pointer"
                      title="Change avatar photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Online in Studio" />
                </div>

                {/* Name & Headline */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2 text-left">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Studio / Artist Name</label>
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Headline / Specialization</label>
                        <input
                          type="text"
                          value={formData.headline || ''}
                          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                          placeholder="e.g. Commercial Audio Mixing & Mastering Engineer"
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
                        <p className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 mt-2 inline-block">
                          {formData.headline}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Seller Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-left text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Client Rating</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-black text-slate-900">{formData.rating}</span>
                      <span className="text-[10px] text-slate-500 font-bold">({formData.reviews_count})</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Response Time</span>
                    <div className="flex items-center gap-1 mt-0.5 text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-black">{formData.response_time || '1 Hour'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Orders Delivered</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">{formData.orders_completed || 184}+</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Delivery</span>
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{formData.last_delivery || '2 hours ago'}</span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-left text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      From
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-32 px-2 py-0.5 text-xs text-right font-bold rounded border border-slate-300 bg-white"
                      />
                    ) : (
                      <span className="font-bold text-slate-900">{formData.location}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Member Since
                    </span>
                    <span className="font-bold text-slate-900">{formData.joined_date || 'March 2022'}</span>
                  </div>
                </div>

              </div>

              {/* Bio / Description */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      About This Seller
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
                      placeholder="Share your musical background, mixing credentials, analog gear setup and workflow..."
                      className="w-full p-3 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50 leading-relaxed"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {formData.bio}
                  </p>
                )}
              </div>

              {/* Languages */}
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

                <div className="space-y-2">
                  {(formData.languages || []).map((item) => (
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
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddLanguage && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Language"
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <select
                        value={newProficiency}
                        onChange={(e) => setNewProficiency(e.target.value as BuyerLanguageProficiency)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLanguage(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        disabled={!newLanguage.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Accounts (Full Web URLs) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Connected Profiles (Direct URLs)
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {SELLER_LINKED_PROVIDERS.map((item) => {
                    const linked = (formData.linked_accounts || []).find(a => a.provider === item.provider);
                    const isConnected = linked?.is_connected ?? false;
                    const currentUrl = linked?.identifier || item.defaultUrl;

                    return (
                      <div
                        key={item.provider}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
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
                            <span className="font-extrabold text-xs text-slate-900">
                              {item.label}
                            </span>
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

                        {isConnected && (
                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                            {editingProvider === item.provider ? (
                              <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <input
                                  type="url"
                                  value={tempAccountUrl}
                                  onChange={(e) => setTempAccountUrl(e.target.value)}
                                  placeholder={item.urlPlaceholder}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingProvider(null); setTempAccountUrl(''); }}
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
                                  className="text-amber-600 font-bold text-[10px] hover:underline cursor-pointer pl-1"
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

              {/* Certifications & Badges */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Certifications & Badges
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCert(!showAddCert)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.certifications || []).map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-900">{cert}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddCert && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="e.g. Waves Certified Audio Specialist"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCert(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCert}
                        disabled={!newCert.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Active Gigs, Studio Gear, DAWs, Skills, Client Reviews (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* SECTION 1: Published Gigs Showcase */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Active Gigs & Packages ({sellerGigs.length})
                    </h3>
                  </div>
                  {onNavigateToBuilder && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToBuilder();
                      }}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Gig
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellerGigs.map((gig) => {
                    const basicPkg = gig.packages?.find(p => p.package_type === 'basic') || gig.packages?.[0];
                    const price = basicPkg?.price_inr || 1500;
                    const fullTitle = `${gig.title_prefix || 'I will'} ${gig.service_title}`;
                    const coverImg = gig.media?.find(m => m.primary)?.file_url || gig.media?.[0]?.file_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={gig.id}
                        className="group border border-slate-200 hover:border-amber-400 rounded-2xl p-3 bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900">
                            <img
                              src={coverImg}
                              alt={fullTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/80 text-amber-300 backdrop-blur-xs">
                              {gig.service_type || gig.service_id?.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition">
                            {fullTitle}
                          </h4>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-black text-slate-900">4.9</span>
                            <span className="text-[10px] text-slate-400 font-bold">(142)</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block leading-tight">STARTING AT</span>
                            <span className="font-black text-amber-600 text-sm">
                              {formatPriceDisplay(price)}
                            </span>
                          </div>
                        </div>

                        {onNavigateToBuilder && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToBuilder(gig.id);
                            }}
                            className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-[11px] transition shadow-2xs cursor-pointer"
                          >
                            Edit Gig in Builder
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Studio Hardware Gear & Analog Outboard Rack */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Studio Hardware Gear & Analog Rack
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddGear(!showAddGear)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Gear
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(formData.studio_gear || []).map((gear, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">{gear}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGear(idx)}
                        className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddGear && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newGear}
                      onChange={(e) => setNewGear(e.target.value)}
                      placeholder="e.g. Tube-Tech CL 1B, Neumann U87, SSL Fusion"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddGear(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddGear}
                        disabled={!newGear.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add Hardware
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Primary DAWs & Production Software */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Primary DAWs & Software Platforms
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddDaw(!showAddDaw)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add DAW
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(formData.daws || []).map((daw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-amber-400 border border-slate-800 shadow-2xs"
                    >
                      <Headphones className="w-3 h-3 text-amber-400" />
                      <span>{daw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDaw(idx)}
                        className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {showAddDaw && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newDaw}
                      onChange={(e) => setNewDaw(e.target.value)}
                      placeholder="e.g. Pro Tools HD, Logic Pro, Ableton Live"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddDaw(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddDaw}
                        disabled={!newDaw.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add DAW
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Specialized Skills */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Skills & Studio Specialties
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(!showAddSkill)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(formData.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                    >
                      <Music className="w-3 h-3 text-amber-600" />
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-red-500 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {showAddSkill && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Vocal Tuning, Dolby Atmos, Analog Mastering"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSkill(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-4 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Client Reviews & Ratings Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Client Reviews ({formData.reviews_count || 142})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{formData.rating} Average Rating</span>
                  </div>
                </div>

                {/* Rating category breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Seller Communication</span>
                    <span className="font-extrabold text-slate-900">5.0 ★</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Service As Described</span>
                    <span className="font-extrabold text-slate-900">4.9 ★</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Audio Quality</span>
                    <span className="font-extrabold text-slate-900">5.0 ★</span>
                  </div>
                </div>

                {/* Review cards */}
                <div className="space-y-3 pt-2">
                  {CLIENT_REVIEWS_SAMPLE.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.buyer_avatar}
                            alt={rev.buyer_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300"
                          />
                          <div>
                            <span className="font-black text-xs text-slate-900 block leading-tight">
                              {rev.buyer_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {rev.country} • {rev.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100">
                        "{rev.comment}"
                      </p>

                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>Gig: <strong className="text-slate-600">{rev.gig_title}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nain Music • Verified Pro Seller Studio Profile</span>
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
                Save All Studio Changes
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
