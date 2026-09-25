import React, { useState, useEffect } from 'react';
import { 
  GigProvider, 
  useGig 
} from './context/GigContext';
import { Header } from './components/common/Header';
import { SellerDashboard } from './components/dashboard/SellerDashboard';
import { UniversalGigBuilder } from './components/builder/UniversalGigBuilder';
import { BuyerGigPreview } from './components/preview/BuyerGigPreview';
import { BuyerOrdersDashboard } from './components/buyer/BuyerOrdersDashboard';
import { OrderWorkspace } from './components/workspace/OrderWorkspace';
import { OrderModal } from './components/workspace/OrderModal';
import { CustomOfferModal } from './components/workspace/CustomOfferModal';
import { PrivateChatModal } from './components/workspace/PrivateChatModal';
import { BuyerBillingProfileModal } from './components/profile/BuyerBillingProfileModal';
import { BuyerProfileModal } from './components/profile/BuyerProfileModal';
import { SellerProfileModal } from './components/profile/SellerProfileModal';
import { AuthModal } from './components/profile/AuthModal';
import { NainAIAssistantModal } from './components/support/NainAIAssistantModal';
import { AIFloatingSupportWidget } from './components/support/AIFloatingSupportWidget';
import { WixConnectionModal } from './components/common/WixConnectionModal';
import { parseIncomingWixUrl, syncAppUrl, clearUrlAction } from './utils/wixUrlRouter';
import { WIX_CONFIG } from './config/wixIntegrationConfig';
import { 
  Plus, 
  X, 
  Sliders, 
  Layers, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Gig, PackageType, Order, CustomOffer, Conversation, AppView } from './types';

// App content wrapper that accesses the GigContext
const AppContent: React.FC = () => {
  const { 
    gigs, 
    currentGig, 
    setCurrentGig, 
    setCurrentStep, 
    createNewGig, 
    services,
    isChatOpen,
    setIsChatOpen,
    conversations,
    openChatWithBuyer,
    setSelectedOrderId,
    isBillingModalOpen,
    setIsBillingModalOpen,
    isBuyerProfileModalOpen,
    setIsBuyerProfileModalOpen,
    isSellerProfileModalOpen,
    setIsSellerProfileModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    setViewMode
  } = useGig();

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [isWixModalOpen, setIsWixModalOpen] = useState(false);
  const [isFromWix, setIsFromWix] = useState(false);
  const [showWixWelcomeBanner, setShowWixWelcomeBanner] = useState(false);

  // Standard Order checkout modal state
  const [checkoutModalData, setCheckoutModalData] = useState<{
    gig: Gig;
    packageType: PackageType;
    selectedExtraIds: string[];
  } | null>(null);

  // Custom offer builder modal state
  const [customOfferBuilderData, setCustomOfferBuilderData] = useState<{
    isOpen: boolean;
    gig?: Gig | null;
    conversation?: Conversation | null;
  }>({ isOpen: false });

  // Custom offer checkout modal state (when buyer clicks Accept Offer & Pay in chat)
  const [checkoutCustomOffer, setCheckoutCustomOffer] = useState<CustomOffer | null>(null);

  // Handle incoming deep links from Wix or direct browser links
  useEffect(() => {
    const handleUrlState = () => {
      const parsed = parseIncomingWixUrl();
      if (parsed.isFromWix) {
        setIsFromWix(true);
        setShowWixWelcomeBanner(true);
      }

      if (parsed.gigId) {
        const targetGig = gigs.find(g => g.id === parsed.gigId);
        if (targetGig) {
          setCurrentGig(targetGig);
          setActiveView('preview');
          setViewMode('buyer');
          return;
        }
      }

      if (parsed.serviceId) {
        const matchedGig = gigs.find(g => g.service_id === parsed.serviceId);
        if (matchedGig) {
          setCurrentGig(matchedGig);
        }
        if (parsed.view === 'builder') {
          createNewGig(parsed.serviceId);
          setActiveView('builder');
          setViewMode('seller');
        } else {
          setActiveView('preview');
          setViewMode('buyer');
        }
        return;
      }

      if (parsed.view) {
        setActiveView(parsed.view);
        if (parsed.view === 'preview') setViewMode('buyer');
        if (parsed.view === 'dashboard' || parsed.view === 'builder') setViewMode('seller');
      }

      if (parsed.action) {
        if (parsed.action === 'create-gig' || parsed.action === 'become-seller') {
          setActiveView('builder');
          setViewMode('seller');
          setShowServicePicker(true);
        } else if (parsed.action === 'chat' || parsed.action === 'messages') {
          setIsChatOpen(true);
        } else if (parsed.action === 'support' || parsed.action === 'help') {
          setIsAIAssistantOpen(true);
        } else if (parsed.action === 'login' || parsed.action === 'signin' || parsed.action === 'signup') {
          setIsAuthModalOpen(true);
        } else if (parsed.action === 'buyer-profile') {
          setIsBuyerProfileModalOpen(true);
        } else if (parsed.action === 'seller-profile') {
          setIsSellerProfileModalOpen(true);
        } else if (parsed.action === 'billing') {
          setIsBillingModalOpen(true);
        }
      }
    };

    handleUrlState();
    window.addEventListener('popstate', handleUrlState);
    return () => window.removeEventListener('popstate', handleUrlState);
  }, [gigs, services, setCurrentGig, createNewGig, setViewMode, setIsChatOpen, setIsAIAssistantOpen, setIsAuthModalOpen, setIsBuyerProfileModalOpen, setIsSellerProfileModalOpen, setIsBillingModalOpen]);

  // Sync state to URL seamlessly
  const handleNavigateView = (view: AppView) => {
    setActiveView(view);
    syncAppUrl({ 
      view, 
      gigId: currentGig?.id,
      ref: isFromWix ? 'wix' : undefined 
    });
  };

  const handleSelectGigForEdit = (gig: Gig) => {
    setCurrentGig(gig);
    setCurrentStep(1);
    setActiveView('builder');
  };

  const handleSelectGigForPreview = (gig: Gig) => {
    setCurrentGig(gig);
    setActiveView('preview');
  };

  const handleStartCreateGig = (serviceId?: string) => {
    if (serviceId) {
      createNewGig(serviceId);
      setShowServicePicker(false);
      setActiveView('builder');
    } else {
      setShowServicePicker(true);
    }
  };

  const handlePickService = (serviceId: string) => {
    createNewGig(serviceId);
    setShowServicePicker(false);
    setActiveView('builder');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Subtle Inbound Referral Banner when arriving from Wix */}
      {showWixWelcomeBanner && (
        <div className="bg-slate-900 text-amber-300 text-xs px-4 py-2 border-b border-slate-800 flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Connected from <strong className="text-white">nain-music.com</strong> • Welcome to Nain Music Marketplace & Studio Engine
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={WIX_CONFIG.wixMarketingUrl}
                className="text-amber-400 hover:text-white underline font-semibold flex items-center gap-1 text-[11px]"
                target="_blank"
                rel="noreferrer"
              >
                <span>Visit Marketing Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setShowWixWelcomeBanner(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Nain Music Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigateView}
        onCreateNewGig={() => handleStartCreateGig()}
        onOpenWixGuide={() => setIsWixModalOpen(true)}
        isFromWix={isFromWix}
      />

      {/* View Switcher */}
      <div className="flex-1">
        {activeView === 'dashboard' && (
          <SellerDashboard
            onNavigateView={handleNavigateView}
            onSelectGigForEdit={handleSelectGigForEdit}
            onSelectGigForPreview={handleSelectGigForPreview}
            onCreateNewGig={handleStartCreateGig}
            onOpenCustomOfferModal={(gig) => {
              // Custom offers are created inside private chat
              const conv = conversations[0];
              setCustomOfferBuilderData({
                isOpen: true,
                gig,
                conversation: conv,
              });
            }}
          />
        )}

        {activeView === 'builder' && (
          <UniversalGigBuilder
            onNavigateView={handleNavigateView}
          />
        )}

        {activeView === 'preview' && (
          <BuyerOrdersDashboard
            onNavigateView={handleNavigateView}
            onOpenOrderCheckout={(packageType, selectedExtraIds) => {
              if (currentGig) {
                setCheckoutModalData({
                  gig: currentGig,
                  packageType,
                  selectedExtraIds,
                });
              }
            }}
          />
        )}

        {activeView === 'order_workspace' && (
          <OrderWorkspace
            onBackToStudio={() => handleNavigateView('dashboard')}
          />
        )}
      </div>

      {/* Service Picker Modal (when seller clicks Create Gig) */}
      {showServicePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Select Music Service for Your New Gig
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The Universal Gig Builder will automatically configure its fields, features, and requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServicePicker(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handlePickService(srv.id)}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-900 transition text-left group flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        {srv.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{srv.features.length} Dynamic Features</span>
                    <span>•</span>
                    <span>{srv.suggestedExtras.length} Extras</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Service can also be adapted anytime inside the builder without losing core work.
              </span>
              <button
                type="button"
                onClick={() => setShowServicePicker(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs hover:text-white"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Standard Package Order Checkout Modal */}
      {checkoutModalData && (
        <OrderModal
          gig={checkoutModalData.gig}
          packageType={checkoutModalData.packageType}
          selectedExtraIds={checkoutModalData.selectedExtraIds}
          onClose={() => setCheckoutModalData(null)}
          onOrderCreated={(order) => {
            setCheckoutModalData(null);
            setSelectedOrderId(order.id);
            setActiveView('order_workspace');
          }}
        />
      )}

      {/* Custom Offer Buyer Acceptance & Checkout Modal */}
      {checkoutCustomOffer && (
        <OrderModal
          customOffer={checkoutCustomOffer}
          onClose={() => setCheckoutCustomOffer(null)}
          onOrderCreated={(order) => {
            setCheckoutCustomOffer(null);
            setSelectedOrderId(order.id);
            setActiveView('order_workspace');
          }}
        />
      )}

      {/* Private 1-to-1 Buyer & Seller Chat Modal */}
      {isChatOpen && (
        <PrivateChatModal
          onClose={() => {
            setIsChatOpen(false);
            clearUrlAction();
          }}
          onOpenCustomOfferBuilder={(conv) => {
            setCustomOfferBuilderData({
              isOpen: true,
              conversation: conv,
              gig: currentGig || gigs[0],
            });
          }}
          onAcceptOfferToCheckout={(offer) => {
            setCheckoutCustomOffer(offer);
            setIsChatOpen(false);
          }}
        />
      )}

      {/* Seller Custom Offer Creator Modal - Rendered on top of chat/dashboard with immediate access */}
      {customOfferBuilderData.isOpen && (
        <CustomOfferModal
          gig={customOfferBuilderData.gig}
          conversation={customOfferBuilderData.conversation}
          onClose={() => setCustomOfferBuilderData({ isOpen: false })}
          onOfferSent={() => {
            setCustomOfferBuilderData({ isOpen: false });
            setIsChatOpen(true);
          }}
        />
      )}

      {/* Global Buyer Account Billing Profile Modal */}
      {isBillingModalOpen && (
        <BuyerBillingProfileModal
          isOpen={isBillingModalOpen}
          onClose={() => {
            setIsBillingModalOpen(false);
            clearUrlAction();
          }}
        />
      )}

      {/* Dedicated Sign In / Authentication Modal for Wix Login CTA */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          clearUrlAction();
        }}
      />

      {/* Dedicated Buyer Profile Modal (Bio, Languages, Linked Accounts, Music Interests) */}
      <BuyerProfileModal
        isOpen={isBuyerProfileModalOpen}
        onClose={() => {
          setIsBuyerProfileModalOpen(false);
          clearUrlAction();
        }}
      />

      {/* Dedicated Seller Studio Profile Modal (Gear, DAWs, Reviews) */}
      <SellerProfileModal
        isOpen={isSellerProfileModalOpen}
        onClose={() => {
          setIsSellerProfileModalOpen(false);
          clearUrlAction();
        }}
        onNavigateToBuilder={(gigId) => {
          if (gigId) {
            const matched = gigs.find(g => g.id === gigId);
            if (matched) handleSelectGigForEdit(matched);
          } else {
            setActiveView('builder');
          }
        }}
      />

      {/* 24/7 First-Response Bilingual AI Support Assistant Modal */}
      {isAIAssistantOpen && (
        <NainAIAssistantModal
          isOpen={isAIAssistantOpen}
          onClose={() => {
            setIsAIAssistantOpen(false);
            clearUrlAction();
          }}
          onNavigateView={setActiveView}
        />
      )}

      {/* Floating AI Support Trigger Badge (Bottom-Right) */}
      <AIFloatingSupportWidget
        onOpen={() => setIsAIAssistantOpen(true)}
      />

      {/* Dedicated Wix Website Integration Hub Modal */}
      <WixConnectionModal
        isOpen={isWixModalOpen}
        onClose={() => setIsWixModalOpen(false)}
        onNavigateToRoute={(view, serviceId) => {
          setIsWixModalOpen(false);
          if (serviceId) {
            const matched = gigs.find(g => g.service_id === serviceId);
            if (matched) setCurrentGig(matched);
          }
          handleNavigateView(view as AppView);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-600">Nain Music</span>
            <span>•</span>
            <span>Music Marketplace</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>20% Platform Fee</span>
            <span>•</span>
            <span>80% Seller Net Earnings</span>
            <span>•</span>
            <span>Permanent Base Currency: INR (₹)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsAIAssistantOpen(true)}
              className="font-semibold text-amber-600 hover:text-amber-700 underline flex items-center gap-1 cursor-pointer"
            >
              AI Help & Support (हिंदी/EN)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <GigProvider>
      <AppContent />
    </GigProvider>
  );
}
