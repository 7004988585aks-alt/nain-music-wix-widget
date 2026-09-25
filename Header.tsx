import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  Layers, 
  Eye, 
  ShoppingBag, 
  IndianRupee, 
  Sparkles,
  SlidersHorizontal,
  MessageSquare,
  Building2,
  Bot,
  User as UserIcon,
  Headphones,
  ChevronDown,
  ShieldCheck,
  Globe,
  Link2,
  FileText,
  HardDrive
} from 'lucide-react';
import { GoogleDriveManagerModal } from '../drive/GoogleDriveManagerModal';
import { NainLogo } from './NainLogo';
import { useGig } from '../../context/GigContext';
import { CURRENCY_CONFIGS } from '../../data/servicesData';
import { CurrencyCode, AppView } from '../../types';

interface HeaderProps {
  currentView?: AppView;
  activeView?: AppView;
  onNavigate: (view: AppView) => void;
  onOpenOrders?: () => void;
  onOpenEarnings?: () => void;
  onOpenCustomService?: () => void;
  onCreateNewGig?: () => void;
  onOpenWixGuide?: () => void;
  isFromWix?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeView,
  onNavigate,
  onOpenOrders,
  onOpenEarnings,
  onOpenCustomService,
  onCreateNewGig,
  onOpenWixGuide,
  isFromWix = false,
}) => {
  const effectiveView = activeView || currentView || 'dashboard';
  const { 
    currentGig, 
    createNewGig, 
    gigs,
    setCurrentGig,
    selectedCurrency, 
    setSelectedCurrency, 
    currentUser,
    buyerProfile,
    isBuyerProfileModalOpen,
    setIsBuyerProfileModalOpen,
    isSellerProfileModalOpen,
    setIsSellerProfileModalOpen,
    setIsAuthModalOpen,
    orders,
    conversations,
    setIsChatOpen,
    setIsAIAssistantOpen,
    liveRates,
    buyerBillingProfile,
    setIsBillingModalOpen,
    viewMode,
    setViewMode
  } = useGig();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if viewing as buyer or seller
  const isBuyerView = effectiveView === 'preview' || viewMode === 'buyer';
  const isSellerView = !isBuyerView;

  const handleCreateGig = () => {
    if (onCreateNewGig) {
      onCreateNewGig();
    } else {
      createNewGig('mixing-mastering');
      onNavigate('builder');
    }
  };

  const handleOpenBuyerView = () => {
    setViewMode('buyer');
    if (!currentGig && gigs && gigs.length > 0) {
      setCurrentGig(gigs[0]);
    }
    onNavigate('preview');
  };

  const handleOpenDashboard = () => {
    setViewMode('seller');
    onNavigate('dashboard');
  };

  const handleOpenOrders = () => {
    if (onOpenOrders) {
      onOpenOrders();
    } else {
      onNavigate('order_workspace');
    }
  };

  const pendingRequirementsCount = orders.filter(o => o.status === 'Requirements Needed').length;
  const totalOrdersCount = orders.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={handleOpenDashboard}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Nain Music Dashboard"
          >
            <NainLogo className="w-10 h-10 drop-shadow-sm group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center text-left leading-none">
              <span className="font-extrabold tracking-wider text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-none">
                NAIN
              </span>
              <span className="font-bold tracking-widest text-[11px] text-amber-600 leading-none mt-0.5">
                MUSIC
              </span>
            </div>
          </button>

          {/* Navigation tabs */}
          <nav className="flex items-center ml-2 sm:ml-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={handleOpenDashboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                effectiveView === 'dashboard'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </button>

            {currentGig && (
              <button
                type="button"
                onClick={() => onNavigate('builder')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  effectiveView === 'builder'
                    ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Universal Builder</span>
                <span className="sm:hidden">Builder</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenBuyerView}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                effectiveView === 'preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Buyer View to preview how buyers view your gigs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buyer View</span>
            </button>
          </nav>

          {/* Create Gig CTA - Moved inward right next to navigation, only visible in Seller View */}
          {isSellerView && (
            <button
              type="button"
              onClick={handleCreateGig}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-xs shrink-0"
              title="Create a new music service gig"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Create Gig</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          
          {/* Custom Future Service Extension */}
          <button
            type="button"
            onClick={onOpenCustomService}
            title="Extend System: Add Future Music Service Definition"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Extend Services</span>
          </button>

          {/* AI Support Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition shadow-2xs group"
            title="Nain AI Support Assistant (Hindi & English)"
          >
            <Bot className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">AI Help</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 font-extrabold uppercase">
              HI/EN
            </span>
          </button>

          {/* Private Chat Messages trigger */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Private 1-to-1 Buyer & Seller Messages with Custom Offers"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Messages</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Orders Workspace trigger */}
          <button
            type="button"
            onClick={handleOpenOrders}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              effectiveView === 'order_workspace'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Orders</span>
            {totalOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {totalOrdersCount}
              </span>
            )}
            {pendingRequirementsCount > 0 && (
              <span 
                className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -right-1" 
                title={`${pendingRequirementsCount} order requires buyer requirements`}
              />
            )}
          </button>

          {/* Marketplace Economics (80% provider / 20% platform) */}
          <button
            type="button"
            onClick={onOpenEarnings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition"
            title="Nain Marketplace Model: 80% Provider Earnings / 20% Nain Fee"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Earnings (80%)</span>
          </button>

          {/* Currency Switcher */}
          <div className="relative flex items-center gap-1.5">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              aria-label="Display currency"
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
            >
              {CURRENCY_CONFIGS.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            {selectedCurrency === 'USD' && liveRates?.rates?.USD && (
              <span className="hidden xl:inline text-[10px] text-emerald-600 font-mono" title={`Live ECB/ER Rate: 1 INR = $${liveRates.rates.USD.toFixed(6)} USD`}>
                • Live Rate
              </span>
            )}
          </div>

          {/* Top-Right Header Trigger for Profile (Adaptive to current mode) */}
          {viewMode === 'seller' ? (
            <button
              type="button"
              onClick={() => setIsSellerProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black transition-all cursor-pointer shadow-xs border border-slate-800 shrink-0"
              title="Open Seller Studio Profile (Gear, DAWs, Skills, Gigs & Reviews)"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio Profile</span>
              <span className="sm:hidden">Studio</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsBuyerProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs border border-amber-600/30 shrink-0"
              title="Open Buyer Profile (Bio, Languages, Linked Accounts, Music Interests)"
            >
              <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Buyer Profile</span>
              <span className="sm:hidden">Buyer</span>
            </button>
          )}

          {/* User Profile Avatar with Dropdown */}
          <div className="relative pl-1 border-l border-slate-200" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer group focus:outline-none"
              title="Account Profiles & Settings"
            >
              <img
                src={viewMode === 'buyer' ? (buyerProfile.avatar_url || currentUser.avatar_url) : currentUser.avatar_url}
                alt={viewMode === 'buyer' ? buyerProfile.name : currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/80 group-hover:scale-105 transition-transform"
              />
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs text-slate-700">
                
                {/* Active user header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={viewMode === 'buyer' ? (buyerProfile.avatar_url || currentUser.avatar_url) : currentUser.avatar_url}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-slate-900 truncate">
                        {viewMode === 'buyer' ? buyerProfile.name : currentUser.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        @{viewMode === 'buyer' ? buyerProfile.username : currentUser.username}
                      </p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                        {viewMode === 'buyer' ? 'Buyer Account' : 'Seller Studio Pro'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-1">
                  
                  {/* Sign In / Account Access */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-950 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 group-hover:text-amber-950 block">
                          Sign In / Switch Account
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Login, Register or Switch Role
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Buyer Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsBuyerProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-950 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 group-hover:text-amber-950 block">
                          Buyer Profile
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Bio, Languages, Linked Accounts
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Seller Studio Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSellerProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-950 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                        <Headphones className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 group-hover:text-amber-950 block">
                          Seller Studio Profile
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Studio Gear, DAWs, Reviews
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Wix Website & Subdomain Integration Hub */}
                  {onOpenWixGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenWixGuide();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-950 transition text-left cursor-pointer group border-t border-slate-100 mt-1 pt-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                          <Globe className="w-3.5 h-3.5 text-blue-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 group-hover:text-amber-950 block">
                              Wix Website Setup
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                              Connected
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Routes, CTA Links & DNS CNAME Guide
                          </span>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Private Master Owner Vault (Admin Only) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsGoogleDriveModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-950 transition text-left cursor-pointer group border-t border-slate-100 mt-1 pt-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 group-hover:text-amber-950 block">
                            Private Owner Vault
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                            Admin Only
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Google Drive Files & Media Backup
                        </span>
                      </div>
                    </div>
                  </button>

                </div>

                {/* View Switcher Footer in Dropdown */}
                <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <div className="flex items-center justify-between p-1 bg-white rounded-xl border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('seller');
                        onNavigate('dashboard');
                        setIsProfileMenuOpen(false);
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                        viewMode === 'seller' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Seller Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('buyer');
                        onNavigate('preview');
                        setIsProfileMenuOpen(false);
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                        viewMode === 'buyer' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Buyer Mode
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
      {/* Private Google Drive Studio Vault Modal */}
      <GoogleDriveManagerModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
      />
    </header>
  );
};
