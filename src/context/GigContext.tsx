import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Gig, 
  ServiceDefinition, 
  CurrencyCode, 
  Order, 
  CustomOffer, 
  User, 
  GigPackage, 
  GigStatus, 
  OrderStatus, 
  Conversation, 
  ChatMessage, 
  ChatAttachment,
  ModerationCategory,
  OrderFileAttachment,
  OrderDelivery,
  OrderActivityEvent,
  OrderRequirementsData,
  ProjectCapacityInfo,
  TaxDetails,
  BuyerBillingProfile,
  BuyerProfile,
  GigReview,
  ReviewSubRatings,
  PackageType
} from '../types';
import { INITIAL_SERVICES, formatCustomOfferPrice, USD_TO_INR_RATE } from '../data/servicesData';
import { INITIAL_GIGS, CURRENT_USER, DEFAULT_BUYER_PROFILE } from '../data/initialGigs';
import { INITIAL_GIG_REVIEWS } from '../data/initialReviews';
import { checkMessageSafety, canSendNudge, saveModerationRecord, getCategorySafetyNotice } from '../utils/chatModeration';
import { generateAutomaticOrderNumber } from '../utils/orderNumberGenerator';
import { fetchLiveExchangeRates, subscribeToExchangeRates, ExchangeRatesData } from '../utils/exchangeRates';
import { wixDataService } from '../services/wixDataService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  stepStatuses: {
    overview: boolean;
    pricing: boolean;
    description: boolean;
    requirements: boolean;
    gallery: boolean;
  };
}

interface GigContextType {
  gigs: Gig[];
  services: ServiceDefinition[];
  currentGig: Gig | null;
  currentStep: number;
  selectedCurrency: CurrencyCode;
  liveRates: ExchangeRatesData | null;
  refreshExchangeRates: () => Promise<ExchangeRatesData>;
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  buyerProfile: BuyerProfile;
  updateBuyerProfile: (updates: Partial<BuyerProfile>) => void;
  isBuyerProfileModalOpen: boolean;
  setIsBuyerProfileModalOpen: (open: boolean) => void;
  isSellerProfileModalOpen: boolean;
  setIsSellerProfileModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  buyerBillingProfile: BuyerBillingProfile;
  updateBuyerBillingProfile: (profile: Partial<BuyerBillingProfile>) => void;
  isBillingModalOpen: boolean;
  setIsBillingModalOpen: (open: boolean) => void;
  orders: Order[];
  customOffers: CustomOffer[];
  conversations: Conversation[];
  activeConversationId: string | null;
  isChatOpen: boolean;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  aiAssistantInitialQuery: string | null;
  openAIAssistant: (initialQuery?: string) => void;
  chatRole: 'seller' | 'buyer';
  viewMode: 'seller' | 'buyer';
  setViewMode: (mode: 'seller' | 'buyer') => void;
  lastSavedAt: string | null;
  isAutoSaving: boolean;
  setSelectedCurrency: (curr: CurrencyCode) => void;
  setCurrentStep: (step: number) => void;
  setCurrentGig: (gig: Gig | null) => void;
  setActiveConversationId: (id: string | null) => void;
  setIsChatOpen: (open: boolean) => void;
  setChatRole: (role: 'seller' | 'buyer') => void;
  openChatWithBuyer: (buyerName?: string, gigId?: string, asRole?: 'seller' | 'buyer') => void;
  sendMessage: (
    conversationId: string, 
    text?: string, 
    sender?: 'buyer' | 'seller', 
    attachment?: ChatAttachment,
    replyTo?: { id: string; sender_name: string; snippet: string }
  ) => { success: boolean; messageId?: string; blocked?: boolean; reason?: string; warning?: string; category?: ModerationCategory };
  updateMessageAttachmentDriveId: (conversationId: string, messageId: string, driveFileId: string, driveWebViewLink?: string) => void;
  deleteChatMessage: (conversationId: string, messageId: string) => void;
  deleteMessageAttachment: (conversationId: string, messageId: string) => void;
  toggleSaveMessage: (conversationId: string, messageId: string) => void;
  toggleStarConversation: (conversationId: string) => void;
  toggleArchiveConversation: (conversationId: string) => void;
  toggleSpamConversation: (conversationId: string) => void;
  toggleFollowUpConversation: (conversationId: string) => void;
  sendNudge: (conversationId: string) => { success: boolean; message: string };
  sendCustomOfferInChat: (conversationId: string, offerData: Omit<CustomOffer, 'id' | 'created_at' | 'status'>) => CustomOffer;
  respondToCustomOffer: (offerId: string, action: 'accept' | 'decline' | 'request_changes', note?: string) => void;
  createOrderFromCustomOffer: (
    offerId: string, 
    buyerName?: string, 
    buyerEmail?: string,
    paymentDetails?: { reference?: string; method?: 'razorpay' | 'paypal' | 'escrow'; amount?: number; taxDetails?: TaxDetails; billingProfile?: BuyerBillingProfile }
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createNewGig: (serviceId?: string) => Gig;
  loadGigForEditing: (gigId: string) => void;
  updateCurrentGig: (updater: Partial<Gig> | ((prev: Gig) => Gig)) => void;
  saveCurrentGigDraft: () => { success: boolean; timestamp: string };
  publishCurrentGig: () => { success: boolean; errors: string[] };
  unpublishGig: (gigId: string) => void;
  toggleGigStatus: (gigId: string, status: GigStatus) => void;
  deleteGig: (gigId: string) => void;
  duplicateGig: (gigId: string) => void;
  changeServiceForCurrentGig: (newServiceId: string) => void;
  addCustomService: (newService: ServiceDefinition) => void;
  validateGig: (gig: Gig) => ValidationResult;
  getGigCapacity: (gigId: string) => ProjectCapacityInfo;
  updateGigMaxActiveProjects: (gigId: string, maxProjects: number) => void;
  createOrderFromPackage: (
    gigId: string, 
    packageType: 'basic' | 'standard' | 'premium', 
    extraIds: string[], 
    buyerName: string, 
    buyerEmail: string,
    paymentDetails?: { reference?: string; method?: 'razorpay' | 'paypal' | 'escrow'; amount?: number; taxDetails?: TaxDetails; billingProfile?: BuyerBillingProfile }
  ) => Order;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  submitOrderDelivery: (orderId: string, deliveryData: { message: string; files: OrderFileAttachment[] }) => void;
  requestOrderRevision: (orderId: string, note: string) => void;
  acceptOrderDeliveryAndComplete: (orderId: string, reviewInput?: { rating: number; review_note: string }) => void;
  simulateClearingComplete: (orderId: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  submitOrderRequirements: (orderId: string, requirementsOrResponses: Record<string, any> | OrderRequirementsData) => void;
  clearAllOrders: () => void;
  loadSampleOrder: () => void;
  createCustomOffer: (offer: Omit<CustomOffer, 'id' | 'created_at' | 'status'>) => CustomOffer;
  requestWithdrawal: (amountInr: number) => { success: boolean; message: string };
  exportGigsJson: () => string;
  importGigsJson: (jsonString: string) => { success: boolean; message: string };

  // Ratings & Reviews for Completed Orders
  reviews: GigReview[];
  addOrderReview: (reviewData: {
    order_id: string;
    order_number: string;
    gig_id: string;
    seller_id?: string;
    buyer_name: string;
    buyer_username?: string;
    buyer_avatar?: string;
    buyer_location?: string;
    rating: number;
    sub_ratings?: ReviewSubRatings;
    review_text: string;
    package_name?: string;
    package_type?: PackageType;
    price_inr?: number;
    tags?: string[];
  }) => GigReview;
  updateOrderReview: (
    reviewId: string, 
    updatedText: string, 
    rating: number, 
    sub_ratings?: ReviewSubRatings, 
    tags?: string[]
  ) => void;
  addSellerReviewResponse: (reviewId: string, message: string) => void;
  toggleReviewHelpful: (reviewId: string) => void;
}

const GigContext = createContext<GigContextType | null>(null);

const STORAGE_GIGS_KEY = 'nain_music_gigs_v3';
const STORAGE_SERVICES_KEY = 'nain_music_services_v3';
const STORAGE_ORDERS_KEY = 'nain_music_orders_v3';
const STORAGE_CONVERSATIONS_KEY = 'nain_music_conversations_v3';
const STORAGE_BUYER_BILLING_PROFILE_KEY = 'nain_music_buyer_billing_profile_v1';
const STORAGE_REVIEWS_KEY = 'nain_music_reviews_v1';
const STORAGE_CURRENT_USER_KEY = 'nain_music_current_seller_profile_v1';
const STORAGE_BUYER_PROFILE_KEY = 'nain_music_buyer_profile_v1';

export const DEFAULT_BUYER_BILLING_PROFILE: BuyerBillingProfile = {
  id: 'profile_sarah_jenkins',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@soundlab.io',
  buyer_type: 'individual',
  country: 'India',
  country_code: 'IN',
  state: 'Bihar',
  state_code: 'BR',
  postal_code: '800001',
  address_line1: 'Flat 402, Ganga Heights, Bailey Road',
  business_name: '',
  tax_id: '',
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-01-10T10:00:00Z',
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_sarah_01',
    gig_id: 'gig_mix_01',
    gig_title: 'I will mix and master your song to competitive commercial streaming standards',
    service_name: 'Mixing & Mastering',
    seller_id: CURRENT_USER.id,
    seller_name: CURRENT_USER.name,
    buyer_id: 'buyer_sarah_01',
    buyer_name: 'Sarah Jenkins',
    buyer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    is_starred: true,
    needs_follow_up: true,
    unread_count: 0,
    messages: [
      {
        id: 'msg_01',
        conversation_id: 'conv_sarah_01',
        sender: 'buyer',
        sender_name: 'Sarah Jenkins',
        text: 'Hi SoundWave! I listened to your mixing portfolio and love the analog summing warmth. I have a 5-track indie pop EP ready for release. Do you do custom packages for multi-track EP mixing with vocal pitch correction included?',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'msg_02',
        conversation_id: 'conv_sarah_01',
        sender: 'seller',
        sender_name: CURRENT_USER.name,
        text: 'Hey Sarah! Thanks so much for reaching out. Yes, absolutely! We do full EP multi-track mixing with analog summing and detailed Melodyne vocal tuning. Let me send you a custom tailored offer with all deliverables and requirements.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'conv_aarav_02',
    gig_id: 'gig_mix_01',
    gig_title: 'I will mix and master your song to competitive commercial streaming standards',
    service_name: 'Mixing & Mastering',
    seller_id: CURRENT_USER.id,
    seller_name: CURRENT_USER.name,
    buyer_id: 'buyer_aarav_02',
    buyer_name: 'Aarav Mehta',
    buyer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_starred: false,
    needs_follow_up: false,
    unread_count: 1,
    messages: [
      {
        id: 'msg_aarav_01',
        conversation_id: 'conv_aarav_02',
        sender: 'buyer',
        sender_name: 'Aarav Mehta',
        text: 'Hey! What format do you need for the drum multi-tracks and bass DI?',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'msg_aarav_02',
        conversation_id: 'conv_aarav_02',
        sender: 'seller',
        sender_name: CURRENT_USER.name,
        text: 'Hi Aarav! 24-bit WAV files exported from bar 1 (so all stems align), dry with no master bus limiters. If you have reference tracks you like, send links too!',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
    ],
    updated_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: 'conv_maya_03',
    gig_id: 'gig_mix_01',
    gig_title: 'I will mix and master your song to competitive commercial streaming standards',
    service_name: 'Dolby Atmos & Spatial Audio',
    seller_id: CURRENT_USER.id,
    seller_name: CURRENT_USER.name,
    buyer_id: 'buyer_maya_03',
    buyer_name: 'Maya Lin',
    buyer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_starred: false,
    is_archived: false,
    needs_follow_up: true,
    unread_count: 0,
    messages: [
      {
        id: 'msg_maya_01',
        conversation_id: 'conv_maya_03',
        sender: 'buyer',
        sender_name: 'Maya Lin',
        text: 'Hello! Can you also deliver 7.1.4 ADM BWF files for Apple Music Spatial Audio release?',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'msg_maya_02',
        conversation_id: 'conv_maya_03',
        sender: 'seller',
        sender_name: CURRENT_USER.name,
        text: 'Hi Maya, yes we have full calibrated Dolby Atmos monitoring and provide certified ADM BWF files.',
        timestamp: new Date(Date.now() - 3600000 * 46).toISOString(),
      }
    ],
    updated_at: new Date(Date.now() - 3600000 * 46).toISOString(),
  }
];

export const DEFAULT_GIG_ORDER: Order = {
  id: 'ord_demo_101',
  order_number: 'NAIN-ORD-74921',
  order_type: 'gig_order',
  gig_id: 'gig_mix_01',
  gig_title: 'I will mix and master your song to competitive commercial streaming standards',
  service_name: 'Mixing & Mastering',
  seller_id: CURRENT_USER.id,
  seller_name: CURRENT_USER.name,
  buyer_name: 'Aarav Mehta (Artist)',
  buyer_username: 'aaravmehta',
  buyer_email: 'aarav@mehtasound.com',
  buyer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  buyer_location: 'Mumbai, India',
  package_type: 'standard',
  package_name: 'Gold Pro Mix & Master',
  package_scope: 'Up to 36 stems, vocal tuning, drum alignment & analog bus processing',
  quantity: 1,
  price_inr: 5499,
  delivery_days: 4,
  revisions_allowed: 4,
  revisions_used: 0,
  selected_extras: [
    { name: '24-Hour Express Studio Delivery', price_inr: 1800, days: -2 }
  ],
  total_price_inr: 7299,
  status: 'In Progress',
  created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  delivery_due_at: new Date(Date.now() + 3600000 * 70).toISOString(),
  requirements_submitted_at: new Date(Date.now() - 3600000 * 25).toISOString(),
  requirements_data: {
    creative_brief: 'We tracked an alternative indie-rock track with live acoustic drums, bass, rhythm guitars, and 4 vocal layers (lead, double, and 2 stereo harmonies). Looking for a wide, radio-ready modern sound similar to The 1975 or Arctic Monkeys. Please keep vocal sibilance under control and add subtle plate reverb to the bridge.',
    reference_track: 'The 1975 - Somebody Else (Spotify / 24-bit FLAC target)',
    language_dialect: 'Hindi / English Indie Fusion',
    additional_notes: 'Track recorded at 124 BPM in F# Minor. Stems are exported dry without master bus limiters.',
    submitted_at: new Date(Date.now() - 3600000 * 25).toISOString(),
    audio_files: [
      {
        id: 'stem_drum_01',
        name: 'Indie_Track_Drum_Stems_24bit_48k.zip',
        size: 148 * 1024 * 1024,
        type: 'application/zip',
        uploaded_at: new Date(Date.now() - 3600000 * 25).toISOString(),
        url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
      },
      {
        id: 'stem_vox_02',
        name: 'Lead_Vocal_Dry_Raw_Takes.wav',
        size: 38 * 1024 * 1024,
        type: 'audio/wav',
        duration: '3:42',
        uploaded_at: new Date(Date.now() - 3600000 * 25).toISOString(),
        url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
      }
    ]
  },
  activity_timeline: [
    {
      id: 'evt_101_1',
      title: 'Order Placed (#NAIN-ORD-74921)',
      description: 'Standard Package "Gold Pro Mix & Master" ordered with 24-Hour Express Studio Delivery.',
      timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
      user_name: 'Aarav Mehta (Artist)',
      user_role: 'buyer',
      type: 'order_placed'
    },
    {
      id: 'evt_101_2',
      title: 'Payment Confirmed by Nain Escrow',
      description: '₹7,299 secured safely in Escrow. Funds will be cleared to seller upon completion.',
      timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
      user_name: 'Nain Music Escrow',
      user_role: 'system',
      type: 'payment_confirmed'
    },
    {
      id: 'evt_101_3',
      title: 'Requirements Submitted by Buyer',
      description: 'Buyer provided creative brief, reference track, and 2 audio stem archives (186 MB total).',
      timestamp: new Date(Date.now() - 3600000 * 25).toISOString(),
      user_name: 'Aarav Mehta (Artist)',
      user_role: 'buyer',
      type: 'requirements_submitted'
    },
    {
      id: 'evt_101_4',
      title: 'Order Started & Delivery Clock Running',
      description: 'Delivery deadline established: 4 Days. Studio engineer notified.',
      timestamp: new Date(Date.now() - 3600000 * 25).toISOString(),
      user_name: 'Nain Music Engine',
      user_role: 'system',
      type: 'order_started'
    }
  ],
  provider_earnings_inr: Math.round(7299 * 0.8), // 80% = ₹5,839
  nain_fee_inr: Math.round(7299 * 0.2), // 20% = ₹1,460
};

export const DEFAULT_CUSTOM_OFFER_ORDER: Order = {
  id: 'ord_demo_102',
  order_number: 'NAIN-ORD-88319',
  order_type: 'custom_offer',
  gig_id: 'gig_mix_01',
  gig_title: 'Custom Offer: Mix and Master — 2 Songs',
  service_name: 'Mixing & Mastering',
  seller_id: CURRENT_USER.id,
  seller_name: CURRENT_USER.name,
  buyer_name: 'Devika Sharma (Singer-Songwriter)',
  buyer_username: 'devikamusic',
  buyer_email: 'devika@indiesounds.in',
  buyer_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  buyer_location: 'New Delhi, India',
  package_type: 'standard',
  package_name: 'Tailored Custom Offer',
  package_scope: '2 songs + mastering',
  quantity: 1,
  price_inr: 3500,
  delivery_days: 4,
  revisions_allowed: 10,
  revisions_used: 0,
  selected_extras: [],
  custom_offer_id: 'off_demo_custom_01',
  custom_offer_details: {
    title: 'Mix and Master — 2 Songs',
    scope: '2 songs + mastering',
    description: 'Full commercial mix and master for 2 singles including instrumental bounce and radio edit. Turnaround in 4 days.',
    deliverables: [
      'Stereo 24-bit WAV Masters (2 Songs)',
      'Instrumental Mixes',
      'Radio Edit Clean Versions',
      'Acapella Vocal Stems',
      'Streaming Loudness Compliance (-14 LUFS)'
    ],
    requirements: [
      'Dry Multitrack Audio Stems in 24-bit WAV',
      'Rough demo mix reference (WAV)',
      'Commercial reference track for each song'
    ],
    price_inr: 3500,
    delivery_days: 4,
    revisions: 10,
    quantity: 1
  },
  total_price_inr: 3500,
  status: 'In Progress',
  created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  delivery_due_at: new Date(Date.now() + 3600000 * 78).toISOString(),
  requirements_submitted_at: new Date(Date.now() - 3600000 * 17).toISOString(),
  requirements_data: {
    creative_brief: '2 acoustic pop singles ("Safar" and "Khoya"). Acoustic guitars, upright bass, cello, percussion, and intimate female lead vocals. Need warm acoustic imaging with clean low-end clarity and transparent compression on vocals.',
    reference_track: 'Prateek Kuhad - cold/mess (Acoustic master benchmark)',
    language_dialect: 'Hindi Contemporary Indie',
    additional_notes: 'Song 1 is 98 BPM in D Major. Song 2 is 112 BPM in G Minor. Stems are consolidated from bar 1.',
    submitted_at: new Date(Date.now() - 3600000 * 17).toISOString(),
    audio_files: [
      {
        id: 'stem_safar_01',
        name: 'Safar_Multitrack_Consolidated_Stems.zip',
        size: 165 * 1024 * 1024,
        type: 'application/zip',
        uploaded_at: new Date(Date.now() - 3600000 * 17).toISOString(),
        url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
      },
      {
        id: 'stem_khoya_02',
        name: 'Khoya_Acoustic_Arrangement_24bit.zip',
        size: 132 * 1024 * 1024,
        type: 'application/zip',
        uploaded_at: new Date(Date.now() - 3600000 * 17).toISOString(),
        url: 'https://cdn.freesound.org/previews/518/518305_10842244-lq.mp3'
      }
    ]
  },
  activity_timeline: [
    {
      id: 'evt_102_1',
      title: 'Custom Offer Accepted (#NAIN-ORD-88319)',
      description: 'Devika Sharma accepted private custom proposal: "Mix and Master — 2 Songs".',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      user_name: 'Devika Sharma (Singer-Songwriter)',
      user_role: 'buyer',
      type: 'order_placed'
    },
    {
      id: 'evt_102_2',
      title: 'Payment Confirmed by Nain Escrow',
      description: '₹3,500 secured in Escrow. Escrow guarantee active.',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      user_name: 'Nain Music Escrow',
      user_role: 'system',
      type: 'payment_confirmed'
    },
    {
      id: 'evt_102_3',
      title: 'Requirements Submitted by Buyer',
      description: 'Buyer submitted stems for both singles ("Safar" and "Khoya") and reference track info.',
      timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
      user_name: 'Devika Sharma (Singer-Songwriter)',
      user_role: 'buyer',
      type: 'requirements_submitted'
    },
    {
      id: 'evt_102_4',
      title: 'Order Started & Delivery Clock Running',
      description: 'Turnaround: 4 Days. Revisions: 10 allowed.',
      timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
      user_name: 'Nain Music Engine',
      user_role: 'system',
      type: 'order_started'
    }
  ],
  provider_earnings_inr: Math.round(3500 * 0.8), // 80% = ₹2,800
  nain_fee_inr: Math.round(3500 * 0.2), // 20% = ₹700
};

export const DEFAULT_COMPLETED_ORDER: Order = {
  id: 'ord_demo_103',
  order_number: 'NAIN-ORD-62184',
  order_type: 'gig_order',
  gig_id: 'gig_mix_01',
  gig_title: 'I will mix and master your song to competitive commercial streaming standards',
  service_name: 'Mixing & Mastering',
  seller_id: CURRENT_USER.id,
  seller_name: CURRENT_USER.name,
  buyer_name: 'Sarah Jenkins',
  buyer_username: 'sarahjenkins_music',
  buyer_email: 'sarah@soundpulse.co.uk',
  buyer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  buyer_location: 'London, UK',
  package_type: 'standard',
  package_name: 'Gold Pro Mix & Master',
  package_scope: 'Up to 36 stems, vocal tuning, drum alignment & analog bus processing',
  quantity: 1,
  price_inr: 5499,
  delivery_days: 4,
  revisions_allowed: 4,
  revisions_used: 1,
  selected_extras: [],
  total_price_inr: 5499,
  status: 'Completed',
  created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  delivery_due_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  completed_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  deliveries: [
    {
      id: 'del_103_1',
      delivery_number: 1,
      seller_id: CURRENT_USER.id,
      seller_name: CURRENT_USER.name,
      delivered_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      message: 'Here is your final approved 24-bit 48kHz WAV master! Reached -9 LUFS with pristine dynamic punch.',
      files: [
        {
          id: 'file_final_master_wav_103',
          name: 'Sarah_Jenkins_Single_Final_Master_24bit_48k.wav',
          size: 48 * 1024 * 1024,
          type: 'audio/wav',
          duration: '3:28',
          uploaded_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        }
      ],
      status: 'accepted'
    }
  ],
  provider_earnings_inr: Math.round(5499 * 0.8),
  nain_fee_inr: Math.round(5499 * 0.2),
  clearing_status: 'pending_clearing',
  buyer_review: INITIAL_GIG_REVIEWS[0],
  reviewed_at: INITIAL_GIG_REVIEWS[0].created_at
};

export const DEFAULT_UNREVIEWED_COMPLETED_ORDER: Order = {
  id: 'ord_demo_104',
  order_number: 'NAIN-ORD-91024',
  order_type: 'gig_order',
  gig_id: 'gig_mix_01',
  gig_title: 'I will mix and master your song to competitive commercial streaming standards',
  service_name: 'Mixing & Mastering',
  seller_id: CURRENT_USER.id,
  seller_name: CURRENT_USER.name,
  buyer_name: 'Rohan Verma',
  buyer_username: 'rohanbeats',
  buyer_email: 'rohan@beatlab.in',
  buyer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  buyer_location: 'Mumbai, India',
  package_type: 'premium',
  package_name: 'Platinum Commercial Master',
  package_scope: 'Unlimited multitracks, Dolby Atmos stem export & analog hybrid summing',
  quantity: 1,
  price_inr: 9999,
  delivery_days: 6,
  revisions_allowed: 5,
  revisions_used: 0,
  selected_extras: [],
  total_price_inr: 9999,
  status: 'Completed',
  created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  delivery_due_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  completed_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  deliveries: [
    {
      id: 'del_104_1',
      delivery_number: 1,
      seller_id: CURRENT_USER.id,
      seller_name: CURRENT_USER.name,
      delivered_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      message: 'Here are your delivered masters in 24-bit 48kHz WAV along with stems for Dolby Atmos. Thank you for your business!',
      files: [
        {
          id: 'file_del_104_wav',
          name: 'Rohan_Platinum_Master_24bit_48k.wav',
          size: 52 * 1024 * 1024,
          type: 'audio/wav',
          duration: '3:50',
          uploaded_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        }
      ],
      status: 'accepted'
    }
  ],
  provider_earnings_inr: Math.round(9999 * 0.8),
  nain_fee_inr: Math.round(9999 * 0.2),
  clearing_status: 'pending_clearing'
};

export const GigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gigs, setGigs] = useState<Gig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GIGS_KEY);
      if (saved) {
        const parsed: Gig[] = JSON.parse(saved);
        // Migrate any legacy mixing or mastering gigs to mixing-mastering
        return parsed.map(g => (g.service_id === 'mixing' || g.service_id === 'mastering') ? { ...g, service_id: 'mixing-mastering' } : g);
      }
    } catch {
      // ignore
    }
    return INITIAL_GIGS;
  });

  const [services, setServices] = useState<ServiceDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SERVICES_KEY);
      if (saved) {
        const parsed: ServiceDefinition[] = JSON.parse(saved);
        // If old separate mixing or mastering exists, or mixing-mastering lacks portion data, refresh to combined INITIAL_SERVICES
        const hasLegacy = parsed.some(s => s.id === 'mixing' || s.id === 'mastering');
        const mmService = parsed.find(s => s.id === 'mixing-mastering');
        const hasPortionData = mmService && mmService.features.some(f => f.portion === 'mixing');
        if (!hasLegacy && hasPortionData) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SERVICES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(o => {
            const isCustom = o.order_type === 'custom_offer' || Boolean(o.custom_offer_id) || o.package_name?.toLowerCase().includes('custom');
            const sanitizedDeliveries = (o.deliveries || []).map((deliv: any) => ({
              ...deliv,
              message: deliv.message
                ?.replace(/Both 24-bit 48kHz WAV and 320kbps MP3 versions are included/gi, 'Studio 24-bit 48kHz WAV master is included')
                ?.replace(/and 320kbps MP3 versions are included/gi, 'is included')
                ?.replace(/320kbps MP3/gi, '24-bit WAV')
                ?.replace(/MP3/gi, 'WAV') || deliv.message,
              files: (deliv.files || []).filter((f: any) => {
                const name = (f.name || '').toLowerCase();
                return !name.endsWith('.mp3') && f.type !== 'audio/mpeg' && !name.includes('_320k');
              })
            }));
            return {
              ...o,
              order_type: isCustom ? 'custom_offer' : (o.order_type || 'gig_order'),
              deliveries: sanitizedDeliveries,
              quantity: o.quantity || 1,
              revisions_used: o.revisions_used || 0,
              buyer_username: o.buyer_username || o.buyer_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'musicartist',
              buyer_location: o.buyer_location || 'India',
              service_name: (o.service_name === 'Mixing' || o.service_name === 'Mastering') ? 'Mixing & Mastering' : o.service_name,
              provider_earnings_inr: o.provider_earnings_inr || Math.round(o.total_price_inr * 0.8),
              nain_fee_inr: o.nain_fee_inr || Math.round(o.total_price_inr * 0.2),
              activity_timeline: o.activity_timeline || [
                {
                  id: `evt_${o.id}_1`,
                  title: `Order Placed (#${o.order_number})`,
                  description: `${o.package_name} ordered.`,
                  timestamp: o.created_at,
                  user_name: o.buyer_name,
                  user_role: 'buyer',
                  type: 'order_placed'
                },
                {
                  id: `evt_${o.id}_2`,
                  title: 'Payment Confirmed by Nain Escrow',
                  description: `₹${o.total_price_inr.toLocaleString('en-IN')} escrow payment secured.`,
                  timestamp: o.created_at,
                  user_name: 'Nain Music Escrow',
                  user_role: 'system',
                  type: 'payment_confirmed'
                }
              ]
            } as Order;
          });

          // Ensure both gig order and custom offer demo orders are present
          const hasCustom = normalized.some(o => o.order_type === 'custom_offer');
          if (!hasCustom) {
            normalized.push(DEFAULT_CUSTOM_OFFER_ORDER);
          }
          const hasCompletedReviewed = normalized.some(o => o.id === 'ord_demo_103');
          if (!hasCompletedReviewed) {
            normalized.push(DEFAULT_COMPLETED_ORDER);
          }
          const hasUnreviewedCompleted = normalized.some(o => o.id === 'ord_demo_104');
          if (!hasUnreviewedCompleted) {
            normalized.push(DEFAULT_UNREVIEWED_COMPLETED_ORDER);
          }
          return normalized;
        }
      }
    } catch {
      // ignore
    }
    return [DEFAULT_GIG_ORDER, DEFAULT_CUSTOM_OFFER_ORDER, DEFAULT_COMPLETED_ORDER, DEFAULT_UNREVIEWED_COMPLETED_ORDER];
  });

  const [reviews, setReviews] = useState<GigReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REVIEWS_KEY);
      if (saved) {
        const parsed: GigReview[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_GIG_REVIEWS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }, [reviews]);

  const addOrderReview = (reviewData: {
    order_id: string;
    order_number: string;
    gig_id: string;
    seller_id?: string;
    buyer_name: string;
    buyer_username?: string;
    buyer_avatar?: string;
    buyer_location?: string;
    rating: number;
    sub_ratings?: ReviewSubRatings;
    review_text: string;
    package_name?: string;
    package_type?: PackageType;
    price_inr?: number;
    tags?: string[];
  }): GigReview => {
    const newReview: GigReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      order_id: reviewData.order_id,
      order_number: reviewData.order_number,
      gig_id: reviewData.gig_id,
      seller_id: reviewData.seller_id || CURRENT_USER.id,
      buyer_name: reviewData.buyer_name,
      buyer_username: reviewData.buyer_username || reviewData.buyer_name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      buyer_avatar: reviewData.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      buyer_location: reviewData.buyer_location || 'India',
      rating: reviewData.rating,
      sub_ratings: reviewData.sub_ratings || {
        communication: reviewData.rating,
        service_as_described: reviewData.rating,
        quality_of_delivery: reviewData.rating
      },
      review_text: reviewData.review_text,
      package_name: reviewData.package_name || 'Studio Package',
      package_type: reviewData.package_type || 'standard',
      price_inr: reviewData.price_inr || 5499,
      created_at: new Date().toISOString(),
      helpful_count: 0,
      verified_purchase: true,
      tags: reviewData.tags || ['Verified Delivery', 'Commercial Standard']
    };

    setReviews(prev => [newReview, ...prev]);

    // Update the corresponding order with the review
    setOrders(prev => prev.map(o => {
      if (o.id === reviewData.order_id || o.order_number === reviewData.order_number) {
        return {
          ...o,
          buyer_review: newReview,
          reviewed_at: newReview.created_at
        };
      }
      return o;
    }));

    return newReview;
  };

  const updateOrderReview = (
    reviewId: string, 
    updatedText: string, 
    rating: number, 
    sub_ratings?: ReviewSubRatings, 
    tags?: string[]
  ) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const updated: GigReview = {
          ...r,
          review_text: updatedText,
          rating,
          sub_ratings: sub_ratings || r.sub_ratings,
          tags: tags || r.tags
        };
        // Also sync order
        setOrders(prevOrders => prevOrders.map(o => {
          if (o.buyer_review?.id === reviewId || o.id === r.order_id) {
            return { ...o, buyer_review: updated };
          }
          return o;
        }));
        return updated;
      }
      return r;
    }));
  };

  const addSellerReviewResponse = (reviewId: string, responseMessage: string) => {
    const seller_response = {
      message: responseMessage,
      responded_at: new Date().toISOString()
    };

    setReviews(prev => prev.map(r => {
      if (r.id === reviewId || r.order_id === reviewId) {
        return {
          ...r,
          seller_response
        };
      }
      return r;
    }));

    setOrders(prevOrders => prevOrders.map(o => {
      if (o.buyer_review?.id === reviewId || o.id === reviewId || o.buyer_review?.order_id === reviewId) {
        return {
          ...o,
          buyer_review: o.buyer_review ? {
            ...o.buyer_review,
            seller_response
          } : undefined
        };
      }
      return o;
    }));
  };

  const toggleReviewHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpful_count: (r.helpful_count || 0) + 1
        };
      }
      return r;
    }));
  };

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ord_demo_101');

  const [customOffers, setCustomOffers] = useState<CustomOffer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_sarah_01');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiAssistantInitialQuery, setAiAssistantInitialQuery] = useState<string | null>(null);

  const openAIAssistant = (initialQuery?: string) => {
    if (initialQuery) {
      setAiAssistantInitialQuery(initialQuery);
    }
    setIsAIAssistantOpen(true);
  };

  const [chatRole, setChatRole] = useState<'seller' | 'buyer'>('seller');
  const [viewMode, setViewMode] = useState<'seller' | 'buyer'>('seller');

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return CURRENT_USER;
  });

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      const updated: User = {
        ...prev,
        ...updates
      };
      // 1. Authoritative central database sync
      wixDataService.syncUser(updated).catch(err => console.warn('WixData syncUser background error:', err));
      wixDataService.updateMySellerProfile(updated).catch(err => console.warn('WixData updateSellerProfile background error:', err));
      // 2. Temporary migration cache fallback
      try {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save currentUser to localStorage', e);
      }
      return updated;
    });
  };

  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUYER_PROFILE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_BUYER_PROFILE;
  });

  const updateBuyerProfile = (updates: Partial<BuyerProfile>) => {
    setBuyerProfile(prev => {
      const updated: BuyerProfile = {
        ...prev,
        ...updates
      };
      // 1. Authoritative central database sync
      wixDataService.updateMyBuyerProfile(updated).catch(err => console.warn('WixData updateBuyerProfile background error:', err));
      // 2. Temporary migration cache fallback
      try {
        localStorage.setItem(STORAGE_BUYER_PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save buyerProfile to localStorage', e);
      }
      return updated;
    });
  };

  const [isBuyerProfileModalOpen, setIsBuyerProfileModalOpen] = useState<boolean>(false);
  const [isSellerProfileModalOpen, setIsSellerProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [buyerBillingProfile, setBuyerBillingProfile] = useState<BuyerBillingProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUYER_BILLING_PROFILE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_BUYER_BILLING_PROFILE;
  });

  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);

  const updateBuyerBillingProfile = (profileUpdate: Partial<BuyerBillingProfile>) => {
    setBuyerBillingProfile(prev => {
      const updated: BuyerBillingProfile = {
        ...prev,
        ...profileUpdate,
        updated_at: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_BUYER_BILLING_PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save buyer billing profile to localStorage', e);
      }
      return updated;
    });
  };

  const [currentGig, setCurrentGig] = useState<Gig | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [liveRates, setLiveRates] = useState<ExchangeRatesData | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Subscribe to live dynamic exchange rates and auto-refresh periodically (every 15 mins)
  useEffect(() => {
    let isSubscribed = true;
    const unsubscribe = subscribeToExchangeRates((rates) => {
      if (isSubscribed) {
        setLiveRates(rates);
      }
    });

    fetchLiveExchangeRates()
      .then((rates) => {
        if (isSubscribed) setLiveRates(rates);
      })
      .catch((err) => console.warn('Exchange rates initial fetch error', err));

    const interval = setInterval(() => {
      fetchLiveExchangeRates(true)
        .then((rates) => {
          if (isSubscribed) setLiveRates(rates);
        })
        .catch((err) => console.warn('Exchange rates scheduled refresh error', err));
    }, 15 * 60 * 1000);

    return () => {
      isSubscribed = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refreshExchangeRates = async (): Promise<ExchangeRatesData> => {
    const fresh = await fetchLiveExchangeRates(true);
    setLiveRates(fresh);
    return fresh;
  };

  // Phase 1: Hydrate authoritative Gigs and Buyer Profile from Firestore
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        // Only load profile from Firestore if an explicit Nain Music account exists
        const userRes = await wixDataService.getUser(firebaseUser.uid).catch(() => null);
        if (isMounted && userRes && userRes.success && userRes.data) {
          setCurrentUser(userRes.data);
        }

        const buyerRes = await wixDataService.getMyBuyerProfile().catch(() => null);
        if (isMounted && buyerRes && buyerRes.success && buyerRes.data) {
          setBuyerProfile(buyerRes.data);
        }
      }

      // Fetch authoritative marketplace published gigs
      wixDataService.getGigs().then(result => {
        if (isMounted && result.success && result.data && result.data.length > 0) {
          setGigs(result.data);
        }
      }).catch(err => console.warn('Firestore getGigs hydration note:', err));
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to local storage', e);
    }
  }, [conversations]);

  // Sync gigs to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GIGS_KEY, JSON.stringify(gigs));
    } catch (e) {
      console.error('Failed to save gigs to local storage', e);
    }
  }, [gigs]);

  // Sync services
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save services to local storage', e);
    }
  }, [services]);

  // Sync orders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to local storage', e);
    }
  }, [orders]);

  // Purge any legacy MP3 delivery files from existing orders so only lossless WAV files remain
  useEffect(() => {
    setOrders(prevOrders => {
      let hasChanges = false;
      const cleaned = prevOrders.map(o => {
        if (!o.deliveries || o.deliveries.length === 0) return o;
        const newDeliveries = o.deliveries.map(deliv => {
          const wavOnlyFiles = (deliv.files || []).filter(f => {
            const name = (f.name || '').toLowerCase();
            return !name.endsWith('.mp3') && f.type !== 'audio/mpeg' && !name.includes('_320k');
          });
          const msgChanged = deliv.message?.includes('MP3');
          if (wavOnlyFiles.length !== (deliv.files || []).length || msgChanged) {
            hasChanges = true;
            return {
              ...deliv,
              message: deliv.message
                ?.replace(/Both 24-bit 48kHz WAV and 320kbps MP3 versions are included/gi, 'Studio 24-bit 48kHz WAV master is included')
                ?.replace(/and 320kbps MP3 versions are included/gi, 'is included')
                ?.replace(/320kbps MP3/gi, '24-bit WAV')
                ?.replace(/MP3/gi, 'WAV') || deliv.message,
              files: wavOnlyFiles
            };
          }
          return deliv;
        });
        if (hasChanges) {
          return { ...o, deliveries: newDeliveries };
        }
        return o;
      });
      return hasChanges ? cleaned : prevOrders;
    });
  }, []);

  // Generate dynamic package defaults for a given service
  const createDefaultPackagesForService = (gigId: string, service: ServiceDefinition): GigPackage[] => {
    const isClasses = service.id === 'music-classes';
    const isProduction = service.id === 'music-production' || service.id === 'full-production';

    const getPrice = (type: 'basic' | 'standard' | 'premium') => {
      if (isClasses) return type === 'basic' ? 1499 : type === 'standard' ? 4999 : 8999;
      if (isProduction) return type === 'basic' ? 3499 : type === 'standard' ? 7999 : 14999;
      return type === 'basic' ? 2499 : type === 'standard' ? 5499 : 9999;
    };

    const getFeatures = (type: 'basic' | 'standard' | 'premium') => {
      const featMap: Record<string, boolean | number | string> = {};
      service.features.forEach(f => {
        if (f.defaultValues) {
          featMap[f.id] = f.defaultValues[type];
        } else {
          featMap[f.id] = type === 'premium';
        }
      });
      return featMap;
    };

    return [
      {
        id: `pkg_${Date.now()}_basic`,
        gig_id: gigId,
        package_type: 'basic',
        name: isClasses ? 'Single 1-on-1 Session' : 'Basic Tier',
        description: `Essential ${service.name.toLowerCase()} for independent artists and focused single-track projects.`,
        price_inr: getPrice('basic'),
        delivery_days: isClasses ? 2 : 3,
        revisions: 2,
        quantity_scope: isClasses ? '1 live class' : '1 track / project',
        included_features: getFeatures('basic'),
        deliverables: ['High-Res 24-bit WAV', 'Standard Reference Format'],
        published: true,
      },
      {
        id: `pkg_${Date.now()}_standard`,
        gig_id: gigId,
        package_type: 'standard',
        name: isClasses ? 'Multi-Session Package' : 'Standard Commercial Tier',
        description: `Full commercial-grade ${service.name.toLowerCase()} with expanded revisions, stems, and professional polish.`,
        price_inr: getPrice('standard'),
        delivery_days: isClasses ? 7 : 4,
        revisions: 4,
        quantity_scope: isClasses ? '4 live classes' : 'Full commercial scope',
        included_features: getFeatures('standard'),
        deliverables: ['High-Res 24-bit WAV', 'Separated Sub-Stems', '320kbps MP3'],
        published: true,
      },
      {
        id: `pkg_${Date.now()}_premium`,
        gig_id: gigId,
        package_type: 'premium',
        name: isClasses ? 'Complete Masterclass Mentorship' : 'Platinum Complete Master Tier',
        description: `Uncompromised top-tier ${service.name.toLowerCase()} with unlimited revisions, priority turnaround, and full project archives.`,
        price_inr: getPrice('premium'),
        delivery_days: isClasses ? 14 : 6,
        revisions: -1, // Unlimited
        quantity_scope: isClasses ? '8 classes + mentorship' : 'Unlimited full production scope',
        included_features: getFeatures('premium'),
        deliverables: ['24-bit 96kHz Master', 'Full DAW Project Zip', 'Uncompressed Stems Archive', 'Commercial License Agreement'],
        published: true,
      },
    ];
  };

  const createNewGig = (serviceId: string = 'mixing-mastering'): Gig => {
    const service = services.find(s => s.id === serviceId) || services[0];
    const gigId = `gig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newGig: Gig = {
      id: gigId,
      seller_id: CURRENT_USER.id,
      service_id: service.id,
      title_prefix: 'I will ',
      service_title: '',
      category: 'Music & Audio',
      service_type: service.serviceTypes[0] || 'Standard Service',
      metadata: {
        genres: service.metadataFields.genres ? [service.metadataFields.genres[0]] : ['Pop'],
        styles: service.metadataFields.styles ? [service.metadataFields.styles[0]] : undefined,
        languages: service.metadataFields.languages ? [service.metadataFields.languages[0]] : undefined,
        target_daw: service.metadataFields.targetDaws ? service.metadataFields.targetDaws[0] : undefined,
      },
      search_tags: [service.name.toLowerCase(), 'music', 'audio'],
      negative_tags: [],
      description: '',
      summary: '',
      status: 'draft',
      has_three_packages: true,
      packages: createDefaultPackagesForService(gigId, service),
      extras: service.suggestedExtras.map((ext, idx) => ({
        id: `ext_${Date.now()}_${idx}`,
        gig_id: gigId,
        name: ext.name,
        description: ext.description,
        price_inr: ext.defaultPriceInr,
        delivery_days: ext.additionalDays,
        enabled: true,
      })),
      requirements: service.suggestedRequirements.map((req, idx) => ({
        id: `req_${Date.now()}_${idx}`,
        gig_id: gigId,
        question: req.question,
        type: req.type,
        options: req.options,
        required: req.required,
        order: idx + 1,
      })),
      faqs: [
        {
          id: `faq_${Date.now()}_1`,
          question: `What audio format should I provide for this ${service.name.toLowerCase()} service?`,
          answer: 'Please provide high-resolution uncompressed 24-bit WAV files (44.1kHz or 48kHz preferred) with all tracks aligned from 0:00.',
        },
      ],
      media: [
        {
          id: `med_${Date.now()}_1`,
          gig_id: gigId,
          media_type: 'image',
          file_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
          title: 'Professional Music Studio',
          sort_order: 1,
          primary: true,
        },
      ],
      seller_rights_confirmed: false,
      max_active_projects: 1, // Default capacity: 1 concurrent project
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentGig(newGig);
    setCurrentStep(1);
    setLastSavedAt(null);
    return newGig;
  };

  const loadGigForEditing = (gigId: string) => {
    const found = gigs.find(g => g.id === gigId);
    if (found) {
      // Deep clone to allow safe editing
      setCurrentGig(JSON.parse(JSON.stringify(found)));
      setCurrentStep(1);
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const updateCurrentGig = (updater: Partial<Gig> | ((prev: Gig) => Gig)) => {
    setCurrentGig(prev => {
      if (!prev) return null;
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      updated.updated_at = new Date().toISOString();
      return updated;
    });
  };

  const saveCurrentGigDraft = (): { success: boolean; timestamp: string } => {
    if (!currentGig) return { success: false, timestamp: '' };

    setIsAutoSaving(true);
    const now = new Date().toISOString();
    const updatedGig: Gig = {
      ...currentGig,
      updated_at: now,
    };

    setGigs(prev => {
      const idx = prev.findIndex(g => g.id === updatedGig.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedGig;
        return next;
      }
      return [updatedGig, ...prev];
    });

    setCurrentGig(updatedGig);
    wixDataService.saveGig(updatedGig).catch(err => console.warn('WixData saveGig background error:', err));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedAt(timeStr);
    setTimeout(() => setIsAutoSaving(false), 400);

    return { success: true, timestamp: timeStr };
  };

  const validateGig = (gig: Gig): ValidationResult => {
    const errors: string[] = [];

    // Step 1: Overview
    const titleValid = Boolean(gig.service_title && gig.service_title.trim().length >= 5);
    const serviceValid = Boolean(gig.service_id && gig.service_type);
    const tagsValid = gig.search_tags.length >= 1;
    const overviewValid = titleValid && serviceValid && tagsValid;

    if (!titleValid) errors.push('Gig Title must be at least 5 characters after "I will ".');
    if (!serviceValid) errors.push('Please select a valid service and service type.');
    if (!tagsValid) errors.push('Please add at least 1 positive search tag.');

    // Step 2: Pricing
    const activePackages = gig.has_three_packages ? gig.packages : gig.packages.slice(0, 1);
    const pricingValid = activePackages.length > 0 && activePackages.every(
      p => p.price_inr >= 1000 && p.delivery_days >= 1 && p.name.trim().length > 0
    );
    if (!pricingValid) errors.push('Minimum price floor is ₹1,000 / $10 USD. All active packages must be at least ₹1,000, have a name, and delivery days (>= 1).');

    // Step 4: Description
    const descValid = Boolean(gig.description && gig.description.trim().length >= 40);
    if (!descValid) errors.push('Gig Description must be at least 40 characters explaining your service.');

    // Step 5: Requirements
    const reqsValid = gig.requirements.length >= 1 && gig.requirements.every(r => r.question.trim().length >= 5);
    if (!reqsValid) errors.push('Please add at least 1 requirement question for your buyers.');

    // Step 7: Gallery
    const galleryValid = gig.media.length >= 1 && gig.seller_rights_confirmed;
    if (!galleryValid) {
      if (gig.media.length === 0) errors.push('Please add at least one image or audio showcase file.');
      if (!gig.seller_rights_confirmed) errors.push('You must certify that you own or hold commercial rights to all uploaded media.');
    }

    const isValid = overviewValid && pricingValid && descValid && reqsValid && galleryValid;

    return {
      isValid,
      errors,
      stepStatuses: {
        overview: overviewValid,
        pricing: pricingValid,
        description: descValid,
        requirements: reqsValid,
        gallery: galleryValid,
      },
    };
  };

  const publishCurrentGig = (): { success: boolean; errors: string[] } => {
    if (!currentGig) return { success: false, errors: ['No active gig found.'] };

    const validation = validateGig(currentGig);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const now = new Date().toISOString();
    // Mark published packages as buyer-visible
    const updatedPackages = currentGig.packages.map(p => ({
      ...p,
      published: true,
    }));

    const publishedGig: Gig = {
      ...currentGig,
      status: 'published',
      packages: updatedPackages,
      published_at: currentGig.published_at || now,
      updated_at: now,
    };

    setGigs(prev => {
      const idx = prev.findIndex(g => g.id === publishedGig.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = publishedGig;
        return next;
      }
      return [publishedGig, ...prev];
    });

    setCurrentGig(publishedGig);
    wixDataService.saveGig(publishedGig).catch(err => console.warn('WixData publishGig background error:', err));
    return { success: true, errors: [] };
  };

  const unpublishGig = (gigId: string) => {
    setGigs(prev =>
      prev.map(g => {
        if (g.id === gigId) {
          const pausedGig: Gig = { ...g, status: 'paused', updated_at: new Date().toISOString() };
          wixDataService.saveGig(pausedGig).catch(err => console.warn('WixData unpublishGig background error:', err));
          return pausedGig;
        }
        return g;
      })
    );
    if (currentGig && currentGig.id === gigId) {
      setCurrentGig(prev => (prev ? { ...prev, status: 'paused' } : null));
    }
  };

  const toggleGigStatus = (gigId: string, status: GigStatus) => {
    setGigs(prev =>
      prev.map(g => {
        if (g.id === gigId) {
          const updatedGig: Gig = { ...g, status, updated_at: new Date().toISOString() };
          wixDataService.saveGig(updatedGig).catch(err => console.warn('WixData toggleGigStatus background error:', err));
          return updatedGig;
        }
        return g;
      })
    );
    if (currentGig && currentGig.id === gigId) {
      setCurrentGig(prev => (prev ? { ...prev, status } : null));
    }
  };

  const deleteGig = (gigId: string) => {
    setGigs(prev => prev.filter(g => g.id !== gigId));
    wixDataService.deleteGig(gigId).catch(err => console.warn('WixData deleteGig background error:', err));
    if (currentGig && currentGig.id === gigId) {
      setCurrentGig(null);
    }
  };

  const duplicateGig = (gigId: string) => {
    const target = gigs.find(g => g.id === gigId);
    if (!target) return;

    const newId = `gig_${Date.now()}_copy`;
    const copy: Gig = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      service_title: `${target.service_title} (Copy)`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: undefined,
    };

    setGigs(prev => [copy, ...prev]);
  };

  const changeServiceForCurrentGig = (newServiceId: string) => {
    const targetService = services.find(s => s.id === newServiceId);
    if (!targetService || !currentGig) return;

    const newPackages = createDefaultPackagesForService(currentGig.id, targetService);

    updateCurrentGig(prev => ({
      ...prev,
      service_id: targetService.id,
      service_type: targetService.serviceTypes[0] || 'Standard',
      metadata: {
        genres: targetService.metadataFields.genres ? [targetService.metadataFields.genres[0]] : ['Pop'],
        styles: targetService.metadataFields.styles ? [targetService.metadataFields.styles[0]] : undefined,
        languages: targetService.metadataFields.languages ? [targetService.metadataFields.languages[0]] : undefined,
        target_daw: targetService.metadataFields.targetDaws ? targetService.metadataFields.targetDaws[0] : undefined,
      },
      packages: newPackages,
      extras: targetService.suggestedExtras.map((ext, idx) => ({
        id: `ext_${Date.now()}_${idx}`,
        gig_id: currentGig.id,
        name: ext.name,
        description: ext.description,
        price_inr: ext.defaultPriceInr,
        delivery_days: ext.additionalDays,
        enabled: true,
      })),
      requirements: targetService.suggestedRequirements.map((req, idx) => ({
        id: `req_${Date.now()}_${idx}`,
        gig_id: currentGig.id,
        question: req.question,
        type: req.type,
        options: req.options,
        required: req.required,
        order: idx + 1,
      })),
    }));
  };

  const addCustomService = (newService: ServiceDefinition) => {
    setServices(prev => {
      const exists = prev.some(s => s.id === newService.id);
      if (exists) return prev;
      return [...prev, newService];
    });
  };

  const getGigCapacity = (gigId: string): ProjectCapacityInfo => {
    const gig = gigs.find(g => g.id === gigId);
    const maxActiveProjects = (gig?.max_active_projects !== undefined && gig.max_active_projects > 0)
      ? gig.max_active_projects
      : 1;

    // Active projects are orders for this specific gig that are NOT Completed and NOT Cancelled
    const currentActiveProjects = orders.filter(
      o => o.gig_id === gigId && o.status !== 'Completed' && o.status !== 'Cancelled'
    ).length;

    const availableSlots = Math.max(0, maxActiveProjects - currentActiveProjects);
    const isFullyBooked = availableSlots <= 0;

    return {
      maxActiveProjects,
      currentActiveProjects,
      availableSlots,
      isFullyBooked,
    };
  };

  const updateGigMaxActiveProjects = (gigId: string, maxProjects: number) => {
    const safeMax = Math.max(1, Math.floor(maxProjects));
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, max_active_projects: safeMax, updated_at: new Date().toISOString() } : g));
    if (currentGig && currentGig.id === gigId) {
      setCurrentGig(prev => prev ? { ...prev, max_active_projects: safeMax, updated_at: new Date().toISOString() } : null);
    }
  };

  const createOrderFromPackage = (
    gigId: string,
    packageType: 'basic' | 'standard' | 'premium',
    extraIds: string[],
    buyerName: string,
    buyerEmail: string,
    paymentDetails?: { reference?: string; method?: 'razorpay' | 'paypal' | 'escrow'; amount?: number; taxDetails?: TaxDetails; billingProfile?: BuyerBillingProfile }
  ): Order => {
    const gig = gigs.find(g => g.id === gigId);
    if (!gig) throw new Error('Gig not found');

    // BACKEND CAPACITY CHECK:
    const capacity = getGigCapacity(gigId);
    if (capacity.isFullyBooked) {
      throw new Error(`This music service is currently fully booked (${capacity.currentActiveProjects}/${capacity.maxActiveProjects} active projects). No slots are currently available.`);
    }

    const pkg = gig.packages.find(p => p.package_type === packageType) || gig.packages[0];
    const chosenExtras = gig.extras
      .filter(e => extraIds.includes(e.id))
      .map(e => ({ name: e.name, price_inr: e.price_inr, days: e.delivery_days }));

    const extrasTotal = chosenExtras.reduce((sum, e) => sum + e.price_inr, 0);
    const basePriceInr = pkg.price_inr + extrasTotal;
    const taxDetails = paymentDetails?.taxDetails;
    const finalTotalPriceInr = taxDetails ? taxDetails.final_total : basePriceInr;
    const effectiveBilling = paymentDetails?.billingProfile || buyerBillingProfile;

    const orderNumber = generateAutomaticOrderNumber(orders.length);
    const createdAt = new Date().toISOString();
    const deliveryDueAt = new Date(Date.now() + pkg.delivery_days * 24 * 3600 * 1000).toISOString();

    const paymentMethod = paymentDetails?.method || 'razorpay';
    const paymentRef = paymentDetails?.reference || (paymentMethod === 'paypal' ? `PP_${Date.now()}` : `RZP_${Date.now()}`);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      invoice_number: `INV-${new Date().getFullYear()}-${orderNumber}`,
      order_type: 'gig_order',
      gig_id: gig.id,
      gig_title: `I will ${gig.service_title}`,
      service_name: services.find(s => s.id === gig.service_id)?.name || 'Music Service',
      seller_id: gig.seller_id,
      seller_name: CURRENT_USER.name,
      buyer_name: buyerName,
      buyer_username: buyerName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'musicbuyer',
      buyer_email: buyerEmail,
      buyer_location: effectiveBilling.state ? `${effectiveBilling.state}, ${effectiveBilling.country}` : (taxDetails?.billing_jurisdiction || 'India'),
      buyer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      package_type: packageType,
      package_name: pkg.name,
      package_scope: pkg.quantity_scope,
      quantity: 1,
      price_inr: basePriceInr,
      delivery_days: pkg.delivery_days,
      delivery_due_at: deliveryDueAt,
      revisions_allowed: pkg.revisions,
      revisions_used: 0,
      selected_extras: chosenExtras,
      total_price_inr: finalTotalPriceInr,
      status: gig.requirements && gig.requirements.length > 0 ? 'Requirements Needed' : 'In Progress',
      created_at: createdAt,
      provider_earnings_inr: Math.round(basePriceInr * 0.8), // 80% to provider strictly on base gig price
      nain_fee_inr: Math.round(basePriceInr * 0.2), // 20% to Nain Music strictly on base gig price
      payment_status: 'paid',
      payment_reference: paymentRef,
      payment_method: paymentMethod,
      paid_amount_inr: finalTotalPriceInr,
      tax_details: taxDetails,
      billing_profile: effectiveBilling,
      activity_timeline: [
        {
          id: `evt_${Date.now()}_1`,
          title: `Order Placed (#${orderNumber})`,
          description: `${pkg.name} package purchased for ${gig.service_title}.`,
          timestamp: createdAt,
          user_name: buyerName,
          user_role: 'buyer',
          type: 'order_placed'
        },
        {
          id: `evt_${Date.now()}_2`,
          title: 'Payment Confirmed by Nain Payment Protection',
          description: `₹${finalTotalPriceInr.toLocaleString('en-IN')} payment secured via ${paymentMethod === 'razorpay' ? 'Razorpay' : paymentMethod === 'paypal' ? 'PayPal' : 'Protection'} (Ref: ${paymentRef}). Protected by Nain Guarantee.`,
          timestamp: createdAt,
          user_name: 'Nain Payment Protection',
          user_role: 'system',
          type: 'payment_confirmed'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    return newOrder;
  };

  const submitOrderRequirements = (
    orderId: string, 
    requirementsOrResponses: Record<string, any> | OrderRequirementsData
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const now = new Date().toISOString();
        const due = new Date(Date.now() + o.delivery_days * 24 * 3600 * 1000).toISOString();
        
        let reqData: OrderRequirementsData;
        if ('creative_brief' in requirementsOrResponses || 'audio_files' in requirementsOrResponses) {
          reqData = {
            ...(requirementsOrResponses as OrderRequirementsData),
            submitted_at: now
          };
        } else {
          const dict = requirementsOrResponses as Record<string, any>;
          reqData = {
            creative_brief: dict['brief'] || dict['custom_req_0'] || 'Stems and vocal arrangements uploaded as requested.',
            reference_track: dict['reference'] || dict['custom_req_1'] || 'Not provided',
            language_dialect: dict['language'] || 'Hindi / English',
            additional_notes: dict['notes'] || 'Please deliver 24-bit 48kHz WAV files.',
            custom_answers: dict,
            submitted_at: now,
            audio_files: [
              {
                id: `stem_${Date.now()}`,
                name: 'Audio_Stems_Multitrack_24bit_WAV.zip',
                size: 142 * 1024 * 1024,
                type: 'application/zip',
                uploaded_at: now,
                url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
              }
            ]
          };
        }

        const evtSubmitted: OrderActivityEvent = {
          id: `evt_${Date.now()}_1`,
          title: 'Requirements Submitted by Buyer',
          description: 'Buyer submitted creative brief, musical references, and project stems.',
          timestamp: now,
          user_name: o.buyer_name,
          user_role: 'buyer',
          type: 'requirements_submitted'
        };
        const evtStarted: OrderActivityEvent = {
          id: `evt_${Date.now()}_2`,
          title: 'Order Started & Delivery Clock Running',
          description: `Turnaround: ${o.delivery_days} days. Delivery due by ${new Date(due).toLocaleDateString()}.`,
          timestamp: now,
          user_name: 'Nain Music Engine',
          user_role: 'system',
          type: 'order_started'
        };

        return {
          ...o,
          status: 'In Progress',
          requirements_submitted_at: now,
          delivery_due_at: due,
          requirements_data: reqData,
          buyer_responses: ('custom_answers' in reqData ? reqData.custom_answers : requirementsOrResponses) as any,
          activity_timeline: [...(o.activity_timeline || []), evtSubmitted, evtStarted]
        };
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (status === 'Completed') {
      acceptOrderDeliveryAndComplete(orderId);
      return;
    }
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const submitOrderDelivery = (orderId: string, deliveryData: { message: string; files: OrderFileAttachment[] }) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const isRevision = o.status === 'Revision Requested';
      const deliveryNumber = (o.deliveries?.length || 0) + 1;
      const newDelivery: OrderDelivery = {
        id: `del_${Date.now()}`,
        delivery_number: deliveryNumber,
        seller_id: CURRENT_USER.id,
        seller_name: CURRENT_USER.name,
        delivered_at: new Date().toISOString(),
        message: deliveryData.message,
        files: deliveryData.files,
        status: 'pending_review'
      };
      const newDeliveries = [...(o.deliveries || []), newDelivery];
      const activityType = isRevision ? 'revised_delivery_submitted' : 'delivery_submitted';
      const eventTitle = isRevision 
        ? `Revised Delivery #${deliveryNumber} Submitted` 
        : `Work Delivered (Delivery #${deliveryNumber})`;
      const eventDesc = `${deliveryData.files.length} audio file(s) delivered with engineering notes.`;
      const newEvent: OrderActivityEvent = {
        id: `evt_${Date.now()}`,
        title: eventTitle,
        description: eventDesc,
        timestamp: new Date().toISOString(),
        user_name: CURRENT_USER.name,
        user_role: 'seller',
        type: activityType
      };
      return {
        ...o,
        status: 'Delivered',
        deliveries: newDeliveries,
        activity_timeline: [...(o.activity_timeline || []), newEvent]
      };
    }));
  };

  const requestOrderRevision = (orderId: string, note: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const revisionsUsed = (o.revisions_used || 0) + 1;
      const newRevisionItem = {
        request_note: note,
        requested_at: new Date().toISOString(),
        revision_number: revisionsUsed
      };
      const newEvent: OrderActivityEvent = {
        id: `evt_${Date.now()}`,
        title: `Revision Requested by Buyer (#${revisionsUsed})`,
        description: note,
        timestamp: new Date().toISOString(),
        user_name: o.buyer_name,
        user_role: 'buyer',
        type: 'revision_requested'
      };
      return {
        ...o,
        status: 'Revision Requested',
        revisions_used: revisionsUsed,
        revision_history: [...(o.revision_history || []), newRevisionItem],
        activity_timeline: [...(o.activity_timeline || []), newEvent]
      };
    }));
  };

  const acceptOrderDeliveryAndComplete = (orderId: string, reviewInput?: { rating: number; review_note: string }) => {
    let createdReview: GigReview | undefined;
    const targetOrder = orders.find(o => o.id === orderId);

    if (reviewInput && reviewInput.rating && targetOrder) {
      createdReview = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order_id: targetOrder.id,
        order_number: targetOrder.order_number,
        gig_id: targetOrder.gig_id,
        seller_id: targetOrder.seller_id,
        buyer_name: targetOrder.buyer_name,
        buyer_username: targetOrder.buyer_username || targetOrder.buyer_name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        buyer_avatar: targetOrder.buyer_avatar,
        buyer_location: targetOrder.buyer_location || 'India',
        rating: reviewInput.rating,
        sub_ratings: {
          communication: reviewInput.rating,
          service_as_described: reviewInput.rating,
          quality_of_delivery: reviewInput.rating
        },
        review_text: reviewInput.review_note || 'Outstanding studio delivery and communication!',
        package_name: targetOrder.package_name,
        package_type: targetOrder.package_type,
        price_inr: targetOrder.total_price_inr,
        created_at: new Date().toISOString(),
        helpful_count: 0,
        verified_purchase: true,
        tags: ['Verified Order', 'Commercial Master']
      };
      setReviews(prev => [createdReview!, ...prev]);
    }

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const completedAt = new Date().toISOString();
      const clearingEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // exactly 7 days
      const providerEarnings = Math.round(o.total_price_inr * 0.8);
      const nainFee = Math.round(o.total_price_inr * 0.2);
      
      const evtAccepted: OrderActivityEvent = {
        id: `evt_${Date.now()}_1`,
        title: 'Buyer Accepted Delivery',
        description: 'Delivered master approved by buyer. Escrow release initiated.',
        timestamp: completedAt,
        user_name: o.buyer_name,
        user_role: 'buyer',
        type: 'delivery_accepted'
      };
      const evtCompleted: OrderActivityEvent = {
        id: `evt_${Date.now()}_2`,
        title: 'Order Completed Successfully',
        description: `Order successfully finalized. Seller net earnings: ₹${providerEarnings.toLocaleString('en-IN')}.`,
        timestamp: completedAt,
        user_name: 'Nain Music Escrow',
        user_role: 'system',
        type: 'order_completed'
      };
      const evtClearing: OrderActivityEvent = {
        id: `evt_${Date.now()}_3`,
        title: '7-Day Clearing Period Started',
        description: `₹${providerEarnings.toLocaleString('en-IN')} moved to "Pending — Being Cleared". Available to withdraw in 7 days.`,
        timestamp: completedAt,
        user_name: 'Nain Finance Engine',
        user_role: 'system',
        type: 'clearing_started'
      };

      return {
        ...o,
        status: 'Completed',
        completed_at: completedAt,
        provider_earnings_inr: providerEarnings,
        nain_fee_inr: nainFee,
        clearing_status: 'pending_clearing',
        clearing_started_at: completedAt,
        clearing_ends_at: clearingEndsAt,
        clearing_days: 7,
        buyer_review: createdReview || o.buyer_review,
        reviewed_at: createdReview ? createdReview.created_at : o.reviewed_at,
        activity_timeline: [...(o.activity_timeline || []), evtAccepted, evtCompleted, evtClearing]
      };
    }));
  };

  const simulateClearingComplete = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const clearedAt = new Date().toISOString();
      const evt: OrderActivityEvent = {
        id: `evt_${Date.now()}`,
        title: 'Clearing Period Completed (7 Days)',
        description: `₹${o.provider_earnings_inr.toLocaleString('en-IN')} is now "Available to Withdraw".`,
        timestamp: clearedAt,
        user_name: 'Nain Finance Engine',
        user_role: 'system',
        type: 'clearing_completed'
      };
      return {
        ...o,
        clearing_status: 'cleared',
        clearing_ends_at: new Date(Date.now() - 1000).toISOString(),
        activity_timeline: [...(o.activity_timeline || []), evt]
      };
    }));
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const cancelledAt = new Date().toISOString();
      const evt: OrderActivityEvent = {
        id: `evt_${Date.now()}`,
        title: 'Order Cancelled',
        description: reason || 'Order cancelled by mutual agreement. Escrow funds released to buyer.',
        timestamp: cancelledAt,
        user_name: CURRENT_USER.name,
        user_role: 'seller',
        type: 'order_cancelled'
      };
      return {
        ...o,
        status: 'Cancelled',
        activity_timeline: [...(o.activity_timeline || []), evt]
      };
    }));
  };

  const clearAllOrders = () => {
    setOrders([]);
    setSelectedOrderId(null);
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
  };

  const loadSampleOrder = () => {
    const sample = {
      ...DEFAULT_GIG_ORDER,
      id: `ord_${Date.now()}`,
      order_number: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString()
    };
    setOrders([sample]);
    setSelectedOrderId(sample.id);
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([sample]));
    } catch {
      // ignore
    }
  };

  const openChatWithBuyer = (buyerName?: string, gigId?: string, asRole: 'seller' | 'buyer' = 'seller') => {
    setChatRole(asRole);
    if (buyerName) {
      const existing = conversations.find(c => c.buyer_name.toLowerCase() === buyerName.toLowerCase());
      if (existing) {
        setActiveConversationId(existing.id);
      } else {
        const gig = gigId ? gigs.find(g => g.id === gigId) : currentGig;
        const newConvId = `conv_${Date.now()}`;
        const newConv: Conversation = {
          id: newConvId,
          gig_id: gig?.id,
          gig_title: gig?.service_title,
          service_name: services.find(s => s.id === gig?.service_id)?.name || 'Music Service',
          seller_id: CURRENT_USER.id,
          seller_name: CURRENT_USER.name,
          buyer_id: `buyer_${Date.now()}`,
          buyer_name: buyerName,
          buyer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          messages: [
            {
              id: `msg_${Date.now()}`,
              conversation_id: newConvId,
              sender: 'system',
              sender_name: 'Nain Music',
              text: `Private 1-to-1 conversation started between ${buyerName} and ${CURRENT_USER.name}.`,
              timestamp: new Date().toISOString(),
            }
          ],
          updated_at: new Date().toISOString(),
        };
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConvId);
      }
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    setIsChatOpen(true);
  };

  const sendMessage = (
    conversationId: string, 
    text?: string, 
    sender: 'buyer' | 'seller' = chatRole,
    attachment?: ChatAttachment,
    replyTo?: { id: string; sender_name: string; snippet: string }
  ) => {
    if ((!text || !text.trim()) && !attachment) {
      return { success: false };
    }

    const activeConv = conversations.find(c => c.id === conversationId);
    const senderName = sender === 'seller' ? CURRENT_USER.name : (activeConv?.buyer_name || 'Buyer');

    // 1. Run authoritative pre-delivery safety check on message text & attachment
    const contentToEvaluate = [text?.trim(), attachment?.name].filter(Boolean).join(' ');
    const safetyResult = contentToEvaluate ? checkMessageSafety(contentToEvaluate) : { action: 'allow' as const };

    // 2. PRE-DELIVERY BLOCK:
    // Intercepted BEFORE saving, delivering, or showing to recipient.
    // The blocked branch MUST NOT create a database or stored message record.
    if (safetyResult.action === 'block') {
      const notice = getCategorySafetyNotice(safetyResult.category);

      saveModerationRecord({
        conversation_id: conversationId,
        message_id: `blocked_${Date.now()}`,
        reporter_role: 'system',
        reporter_name: 'Nain Safety Engine',
        reported_user_name: senderName,
        reason: notice.message,
        message_snippet: text || attachment?.name || '',
        outcome: 'blocked',
        automated_classification: safetyResult.category,
      });

      return {
        success: false,
        blocked: true,
        category: safetyResult.category,
        reason: notice.fullNotice,
      };
    }

    const newMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      conversation_id: conversationId,
      sender,
      sender_name: senderName,
      text: text?.trim() || undefined,
      timestamp: new Date().toISOString(),
      attachment,
      reply_to: replyTo,
      moderation_flag: safetyResult.action === 'warn' ? 'warn' : undefined,
      moderation_warning: safetyResult.action === 'warn' ? safetyResult.warningMessage : undefined,
    };

    // 3. If flagged with warning (e.g. outside payment or suspicious link)
    if (safetyResult.action === 'warn') {
      saveModerationRecord({
        conversation_id: conversationId,
        message_id: newMsgId,
        reporter_role: 'system',
        reporter_name: 'Nain Safety Engine',
        reported_user_name: senderName,
        reason: safetyResult.warningMessage || 'Platform safety warning triggered',
        message_snippet: text || '',
        outcome: 'flagged',
        automated_classification: safetyResult.category,
      });
    }

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          updated_at: new Date().toISOString(),
          unread_count: sender !== chatRole ? (c.unread_count || 0) + 1 : c.unread_count,
        };
      }
      return c;
    }));

    return {
      success: true,
      messageId: newMsgId,
      warning: safetyResult.action === 'warn' ? safetyResult.warningMessage : undefined
    };
  };

  const updateMessageAttachmentDriveId = (
    conversationId: string, 
    messageId: string, 
    driveFileId: string, 
    driveWebViewLink?: string
  ) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: c.messages.map(m => {
          if (m.id !== messageId || !m.attachment) return m;
          return {
            ...m,
            attachment: {
              ...m.attachment,
              drive_file_id: driveFileId,
              drive_web_view_link: driveWebViewLink
            }
          };
        })
      };
    }));
  };

  const toggleSaveMessage = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: c.messages.map(m => m.id === messageId ? { ...m, is_saved: !m.is_saved } : m)
      };
    }));
  };

  const deleteChatMessage = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: c.messages.filter(m => m.id !== messageId),
        updated_at: new Date().toISOString()
      };
    }));
  };

  const deleteMessageAttachment = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: c.messages.map(m => {
          if (m.id !== messageId) return m;
          if (!m.text || !m.text.trim()) return null;
          const { attachment, ...rest } = m;
          return rest as ChatMessage;
        }).filter(Boolean) as ChatMessage[],
        updated_at: new Date().toISOString()
      };
    }));
  };

  const toggleStarConversation = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, is_starred: !c.is_starred } : c));
  };

  const toggleArchiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c));
  };

  const toggleSpamConversation = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, is_spam: !c.is_spam } : c));
  };

  const toggleFollowUpConversation = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, needs_follow_up: !c.needs_follow_up } : c));
  };

  const sendNudge = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return { success: false, message: 'Conversation not found.' };

    const check = canSendNudge(conv.last_nudged_at);
    if (!check.allowed) {
      return {
        success: false,
        message: `Nudge was already sent recently. Please wait ${check.waitMinutes || 60} minutes before sending another reminder.`
      };
    }

    const senderName = chatRole === 'seller' ? CURRENT_USER.name : conv.buyer_name;
    const nudgeMsg: ChatMessage = {
      id: `nudge_${Date.now()}`,
      conversation_id: conversationId,
      sender: 'system',
      sender_name: 'Nain Music System',
      text: `🔔 Gentle reminder from ${senderName}: Checking in on this project conversation. Please respond when available!`,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      messages: [...c.messages, nudgeMsg],
      last_nudged_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : c));

    return {
      success: true,
      message: 'Friendly reminder sent to conversation.'
    };
  };

  const sendCustomOfferInChat = (
    conversationId: string,
    offerData: Omit<CustomOffer, 'id' | 'created_at' | 'status'>
  ): CustomOffer => {
    const offerId = `off_${Date.now()}`;
    const safePriceInr = Math.max(1000, Number(offerData.price_inr) || 1000);
    const offerCurrency = offerData.currency || offerData.pricing_currency || (offerData.price_usd ? 'USD' : 'INR');
    const offerAmount = offerData.offer_amount !== undefined && offerData.offer_amount > 0
      ? offerData.offer_amount
      : (offerCurrency === 'USD' ? (offerData.price_usd || Number((safePriceInr / USD_TO_INR_RATE).toFixed(2))) : safePriceInr);

    const newOffer: CustomOffer = {
      ...offerData,
      id: offerId,
      currency: offerCurrency,
      pricing_currency: offerCurrency,
      offer_amount: offerAmount,
      price_inr: safePriceInr,
      price_usd: offerData.price_usd || (offerCurrency === 'USD' ? offerAmount : Number((safePriceInr / USD_TO_INR_RATE).toFixed(2))),
      conversation_id: conversationId,
      created_at: new Date().toISOString(),
      status: 'pending',
    };

    setCustomOffers(prev => [newOffer, ...prev]);

    const displayOfferPrice = formatCustomOfferPrice(newOffer);

    const offerMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender: 'seller',
      sender_name: CURRENT_USER.name,
      text: `📋 Sent Custom Offer: ${newOffer.title} (${displayOfferPrice})`,
      timestamp: new Date().toISOString(),
      custom_offer_id: offerId,
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, offerMsg],
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    }));

    return newOffer;
  };

  const respondToCustomOffer = (
    offerId: string,
    action: 'accept' | 'decline' | 'request_changes',
    note?: string
  ) => {
    setCustomOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          status: action === 'request_changes' ? 'change_requested' : action === 'accept' ? 'accepted' : 'declined',
          change_request_note: note || o.change_request_note,
        };
      }
      return o;
    }));

    const offer = customOffers.find(o => o.id === offerId);
    if (offer && offer.conversation_id) {
      let text = '';
      let targetAudience: 'seller_only' | 'all' = 'all';
      if (action === 'decline') {
        text = `❌ The buyer has declined this custom offer.`;
        targetAudience = 'seller_only';
      } else if (action === 'request_changes') {
        text = `💬 Buyer requested adjustments: "${note || 'Could you please adjust the turnaround time or terms?'}"`;
        targetAudience = 'seller_only';
      }
      if (text) {
        const msg: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversation_id: offer.conversation_id,
          sender: 'system',
          sender_name: 'Nain System',
          text,
          timestamp: new Date().toISOString(),
          target_audience: targetAudience,
        };
        setConversations(prev => prev.map(c => c.id === offer.conversation_id ? {
          ...c,
          messages: [...c.messages, msg],
          updated_at: new Date().toISOString()
        } : c));
      }
    }
  };

  const createOrderFromCustomOffer = (
    offerId: string,
    buyerName?: string,
    buyerEmail?: string,
    paymentDetails?: { reference?: string; method?: 'razorpay' | 'paypal' | 'escrow'; amount?: number; taxDetails?: TaxDetails; billingProfile?: BuyerBillingProfile }
  ): Order => {
    const offer = customOffers.find(o => o.id === offerId);
    if (!offer) throw new Error('Custom offer not found');

    const gig = gigs.find(g => g.id === offer.gig_id) || gigs[0];

    // Backend capacity check if linked to a gig
    if (gig && gig.id) {
      const capacity = getGigCapacity(gig.id);
      if (capacity.isFullyBooked) {
        throw new Error(`This music service is currently fully booked (${capacity.currentActiveProjects}/${capacity.maxActiveProjects} active projects). No slots are currently available.`);
      }
    }

    const orderNumber = generateAutomaticOrderNumber(orders.length);

    const chosenBuyer = buyerName || offer.buyer_name;
    const createdAt = new Date().toISOString();
    const deliveryDueAt = new Date(Date.now() + offer.delivery_days * 24 * 3600 * 1000).toISOString();

    const paymentMethod = paymentDetails?.method || 'razorpay';
    const paymentRef = paymentDetails?.reference || (paymentMethod === 'paypal' ? `PP_${Date.now()}` : `RZP_${Date.now()}`);

    const basePriceInr = offer.price_inr;
    const isOfferUsd = offer.currency === 'USD' || offer.pricing_currency === 'USD' || (offer.price_usd && !offer.price_inr);
    const offerAmountUsd = offer.offer_amount !== undefined && isOfferUsd 
      ? offer.offer_amount 
      : (offer.price_usd || Number((basePriceInr / USD_TO_INR_RATE).toFixed(2)));

    const taxDetails = paymentDetails?.taxDetails;
    const finalTotalPriceInr = taxDetails ? taxDetails.final_total : basePriceInr;
    const effectiveBilling = paymentDetails?.billingProfile || buyerBillingProfile;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      invoice_number: `INV-${new Date().getFullYear()}-${orderNumber}`,
      order_type: 'custom_offer',
      gig_id: gig?.id || 'custom',
      gig_title: `Custom Offer: ${offer.title}`,
      service_name: offer.service_name,
      seller_id: offer.seller_id || CURRENT_USER.id,
      seller_name: CURRENT_USER.name,
      buyer_name: chosenBuyer,
      buyer_username: chosenBuyer.toLowerCase().replace(/[^a-z0-9]/g, '') || 'musicartist',
      buyer_email: buyerEmail || 'buyer@musicartist.com',
      buyer_location: effectiveBilling.state ? `${effectiveBilling.state}, ${effectiveBilling.country}` : (taxDetails?.billing_jurisdiction || 'India'),
      buyer_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      package_type: 'standard',
      package_name: 'Tailored Custom Offer',
      package_scope: offer.title,
      quantity: 1,
      price_inr: basePriceInr,
      price_usd: isOfferUsd ? offerAmountUsd : undefined,
      pricing_currency: isOfferUsd ? 'USD' : 'INR',
      delivery_days: offer.delivery_days,
      delivery_due_at: deliveryDueAt,
      revisions_allowed: offer.revisions,
      revisions_used: 0,
      selected_extras: [],
      custom_offer_id: offer.id,
      custom_offer_details: {
        title: offer.title,
        description: offer.description,
        scope: offer.title,
        deliverables: offer.deliverables && offer.deliverables.length > 0 ? offer.deliverables : ['Custom Audio Deliverables', 'Master Stereo WAV File'],
        requirements: offer.requirements || [],
        currency: isOfferUsd ? 'USD' : 'INR',
        pricing_currency: isOfferUsd ? 'USD' : 'INR',
        offer_amount: isOfferUsd ? offerAmountUsd : basePriceInr,
        price_inr: offer.price_inr,
        price_usd: isOfferUsd ? offerAmountUsd : undefined,
        delivery_days: offer.delivery_days,
        revisions: offer.revisions,
        quantity: 1,
      },
      total_price_inr: finalTotalPriceInr,
      status: offer.requirements && offer.requirements.length > 0 ? 'Requirements Needed' : 'In Progress',
      created_at: createdAt,
      provider_earnings_inr: Math.round(basePriceInr * 0.8), // 80% to provider strictly on base gig price
      nain_fee_inr: Math.round(basePriceInr * 0.2), // 20% to Nain Music strictly on base gig price
      payment_status: 'paid',
      payment_reference: paymentRef,
      payment_method: paymentMethod,
      paid_amount_inr: finalTotalPriceInr,
      tax_details: taxDetails,
      billing_profile: effectiveBilling,
      activity_timeline: [
        {
          id: `evt_${Date.now()}_1`,
          title: `Custom Offer Accepted (#${orderNumber})`,
          description: `${chosenBuyer} accepted tailored custom offer: "${offer.title}".`,
          timestamp: createdAt,
          user_name: chosenBuyer,
          user_role: 'buyer',
          type: 'order_placed'
        },
        {
          id: `evt_${Date.now()}_2`,
          title: 'Payment Confirmed by Nain Payment Protection',
          description: `${isOfferUsd ? `$${(paymentDetails?.amount || offerAmountUsd).toFixed(2)} USD` : `₹${finalTotalPriceInr.toLocaleString('en-IN')}`} secured via ${paymentMethod === 'razorpay' ? 'Razorpay' : paymentMethod === 'paypal' ? 'PayPal' : 'Protection'} (Ref: ${paymentRef}). Protected by Nain Guarantee.`,
          timestamp: createdAt,
          user_name: 'Nain Payment Protection',
          user_role: 'system',
          type: 'payment_confirmed'
        }
      ]
    };

    setCustomOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted', order_id: newOrder.id } : o));

    if (offer.conversation_id) {
      const sysMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: offer.conversation_id,
        sender: 'system',
        sender_name: 'Nain Music Escrow',
        text: `🎉 Custom offer accepted and payment funded! Order #${orderNumber} created. Status: Requirements Needed.`,
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => prev.map(c => c.id === offer.conversation_id ? {
        ...c,
        messages: [...c.messages, sysMsg],
        updated_at: new Date().toISOString()
      } : c));
    }

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    return newOrder;
  };

  const createCustomOffer = (offerData: Omit<CustomOffer, 'id' | 'created_at' | 'status'>): CustomOffer => {
    const safePriceInr = Math.max(1000, Number(offerData.price_inr) || 1000);
    const offerCurrency = offerData.currency || offerData.pricing_currency || (offerData.price_usd ? 'USD' : 'INR');
    const offerAmount = offerData.offer_amount !== undefined && offerData.offer_amount > 0
      ? offerData.offer_amount
      : (offerCurrency === 'USD' ? (offerData.price_usd || Number((safePriceInr / USD_TO_INR_RATE).toFixed(2))) : safePriceInr);

    const newOffer: CustomOffer = {
      ...offerData,
      currency: offerCurrency,
      pricing_currency: offerCurrency,
      offer_amount: offerAmount,
      price_inr: safePriceInr,
      price_usd: offerData.price_usd || (offerCurrency === 'USD' ? offerAmount : Number((safePriceInr / USD_TO_INR_RATE).toFixed(2))),
      id: `off_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    setCustomOffers(prev => [newOffer, ...prev]);
    return newOffer;
  };

  const requestWithdrawal = (amountInr: number) => {
    return {
      success: true,
      message: `Withdrawal request for ₹${amountInr.toLocaleString('en-IN')} submitted. Nain Music finance team will process this within 1-2 business days.`,
    };
  };

  const exportGigsJson = (): string => {
    return JSON.stringify({
      schema_version: '1.0',
      exported_at: new Date().toISOString(),
      platform: 'Nain Music',
      user: CURRENT_USER,
      gigs,
      services,
    }, null, 2);
  };

  const importGigsJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.gigs)) {
        setGigs(data.gigs);
        return { success: true, message: `Successfully imported ${data.gigs.length} Gigs into your Nain Studio.` };
      }
      return { success: false, message: 'Invalid JSON format: missing "gigs" array.' };
    } catch {
      return { success: false, message: 'Failed to parse JSON file.' };
    }
  };

  return (
    <GigContext.Provider
      value={{
        gigs,
        services,
        currentGig,
        currentStep,
        selectedCurrency,
        liveRates,
        refreshExchangeRates,
        currentUser,
        updateCurrentUser,
        buyerProfile,
        updateBuyerProfile,
        isBuyerProfileModalOpen,
        setIsBuyerProfileModalOpen,
        isSellerProfileModalOpen,
        setIsSellerProfileModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        buyerBillingProfile,
        updateBuyerBillingProfile,
        isBillingModalOpen,
        setIsBillingModalOpen,
        orders,
        customOffers,
        conversations,
        activeConversationId,
        isChatOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        aiAssistantInitialQuery,
        openAIAssistant,
        chatRole,
        viewMode,
        setViewMode,
        lastSavedAt,
        isAutoSaving,
        setSelectedCurrency,
        setCurrentStep,
        setCurrentGig,
        setActiveConversationId,
        setIsChatOpen,
        setChatRole,
        openChatWithBuyer,
        sendMessage,
        updateMessageAttachmentDriveId,
        deleteChatMessage,
        deleteMessageAttachment,
        toggleSaveMessage,
        toggleStarConversation,
        toggleArchiveConversation,
        toggleSpamConversation,
        toggleFollowUpConversation,
        sendNudge,
        sendCustomOfferInChat,
        respondToCustomOffer,
        createOrderFromCustomOffer,
        updateOrderStatus,
        createNewGig,
        loadGigForEditing,
        updateCurrentGig,
        saveCurrentGigDraft,
        publishCurrentGig,
        unpublishGig,
        toggleGigStatus,
        deleteGig,
        duplicateGig,
        changeServiceForCurrentGig,
        addCustomService,
        validateGig,
        getGigCapacity,
        updateGigMaxActiveProjects,
        createOrderFromPackage,
        selectedOrderId,
        setSelectedOrderId,
        submitOrderDelivery,
        requestOrderRevision,
        acceptOrderDeliveryAndComplete,
        simulateClearingComplete,
        cancelOrder,
        submitOrderRequirements,
        clearAllOrders,
        loadSampleOrder,
        createCustomOffer,
        requestWithdrawal,
        exportGigsJson,
        importGigsJson,
        reviews,
        addOrderReview,
        updateOrderReview,
        addSellerReviewResponse,
        toggleReviewHelpful,
      }}
    >
      {children}
    </GigContext.Provider>
  );
};

export const useGig = () => {
  const context = useContext(GigContext);
  if (!context) {
    throw new Error('useGig must be used within a GigProvider');
  }
  return context;
};
