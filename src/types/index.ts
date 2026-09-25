export type GigStatus = 'draft' | 'published' | 'paused';

export type PackageType = 'basic' | 'standard' | 'premium';

export type RequirementType = 'text' | 'multiple_choice' | 'file_upload';

export type MediaType = 'image' | 'audio' | 'video' | 'document';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  email?: string;
  role?: 'buyer' | 'seller' | 'admin';
  headline?: string;
  level?: string;
  rating: number;
  reviews_count: number;
  response_time: string;
  last_delivery?: string;
  orders_completed?: number;
  location: string;
  joined_date: string;
  bio: string;
  badges: string[];
  skills?: string[];
  studio_gear?: string[];
  daws?: string[];
  languages?: BuyerLanguageItem[];
  linked_accounts?: BuyerLinkedAccountItem[];
  certifications?: string[];
}

export type BuyerLanguageProficiency = 'Basic' | 'Conversational' | 'Fluent' | 'Native / Bilingual';

export interface BuyerLanguageItem {
  id: string;
  language: string;
  proficiency: BuyerLanguageProficiency;
}

export interface BuyerLinkedAccountItem {
  id: string;
  provider: 'Google' | 'Spotify' | 'YouTube' | 'SoundCloud' | 'Instagram' | 'GitHub' | 'Discord';
  identifier: string;
  is_connected: boolean;
  connected_at?: string;
}

export interface BuyerProfile {
  id: string;
  user_id?: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  headline?: string;
  bio: string;
  member_since: string;
  location: string;
  country: string;
  country_code: string;
  city: string;
  languages: BuyerLanguageItem[];
  linked_accounts: BuyerLinkedAccountItem[];
  interests: string[];
  buyer_type: 'individual' | 'business';
  company_name?: string;
  gstin?: string;
  is_verified?: boolean;
}

export interface ServiceFeatureDefinition {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'number' | 'text';
  unit?: string;
  portion?: 'mixing' | 'mastering' | 'general';
  defaultValues?: {
    basic: boolean | number | string;
    standard: boolean | number | string;
    premium: boolean | number | string;
  };
}

export interface ServiceDefinition {
  id: string;
  name: string;
  iconName: string;
  description: string;
  category: string;
  serviceTypes: string[];
  metadataFields: {
    genres?: string[];
    styles?: string[];
    languages?: string[];
    vocalTypes?: string[];
    targetDaws?: string[];
    targetPlatforms?: string[];
    instruments?: string[];
    skillLevels?: string[];
    customAttributes?: { name: string; options: string[] }[];
  };
  features: ServiceFeatureDefinition[];
  suggestedExtras: {
    name: string;
    description: string;
    defaultPriceInr: number;
    additionalDays: number;
  }[];
  suggestedRequirements: {
    question: string;
    type: RequirementType;
    options?: string[];
    required: boolean;
  }[];
  isClassService?: boolean;
}

export interface GigPackage {
  id: string;
  gig_id: string;
  package_type: PackageType;
  name: string;
  description: string;
  price_inr: number;
  price_usd?: number;
  pricing_currency?: 'INR' | 'USD';
  delivery_days: number;
  revisions: number; // -1 for unlimited
  quantity_scope: string;
  included_features: Record<string, boolean | number | string>;
  deliverables: string[];
  published: boolean;
}

export interface GigExtra {
  id: string;
  gig_id: string;
  name: string;
  description: string;
  price_inr: number;
  delivery_days: number;
  enabled: boolean;
}

export interface GigRequirement {
  id: string;
  gig_id: string;
  question: string;
  type: RequirementType;
  options?: string[];
  required: boolean;
  order: number;
}

export interface GigMedia {
  id: string;
  gig_id: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url?: string;
  title: string;
  sort_order: number;
  primary: boolean;
  audio_before_url?: string;
  audio_after_url?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Gig {
  id: string;
  seller_id: string;
  service_id: string;
  title_prefix: string; // Always "I will "
  service_title: string; // The editable portion
  category: string; // "Music & Audio"
  service_type: string;
  metadata: {
    genres: string[];
    styles?: string[];
    languages?: string[];
    vocal_instrumental?: string;
    target_daw?: string;
    target_platforms?: string[];
    instruments?: string[];
    skill_level?: string;
    custom_attributes?: Record<string, string>;
  };
  search_tags: string[];
  negative_tags?: string[];
  description: string;
  summary?: string;
  status: GigStatus;
  has_three_packages: boolean;
  pricing_currency?: 'INR' | 'USD';
  packages: GigPackage[];
  extras: GigExtra[];
  requirements: GigRequirement[];
  faqs: FAQItem[];
  media: GigMedia[];
  seller_rights_confirmed: boolean;
  max_active_projects?: number; // Maximum active projects handled at the same time (default 1)
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ProjectCapacityInfo {
  maxActiveProjects: number;
  currentActiveProjects: number;
  availableSlots: number;
  isFullyBooked: boolean;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromInr: number;
  name: string;
}

export type OrderStatus = 
  | 'Requirements Needed' 
  | 'Awaiting Requirements' 
  | 'In Progress' 
  | 'Delivered' 
  | 'Revision Requested' 
  | 'Completed' 
  | 'Cancelled';

export type OrderSourceType = 'gig_order' | 'custom_offer';

export interface OrderFileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  duration?: string;
  uploaded_at: string;
  drive_file_id?: string;
  drive_web_view_link?: string;
  storage_provider?: 'wix_media' | 'google_drive' | 'wetransfer' | 'transfernow';
}

export interface OrderDelivery {
  id: string;
  delivery_number: number;
  seller_id: string;
  seller_name: string;
  delivered_at: string;
  message: string;
  files: OrderFileAttachment[];
  status: 'pending_review' | 'accepted' | 'revision_requested';
  revision_request_note?: string;
}

export interface OrderActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  user_name: string;
  user_role: 'buyer' | 'seller' | 'system';
  type: 
    | 'order_placed'
    | 'payment_confirmed'
    | 'requirements_submitted'
    | 'order_started'
    | 'delivery_date_established'
    | 'delivery_submitted'
    | 'revision_requested'
    | 'revised_delivery_submitted'
    | 'delivery_accepted'
    | 'order_completed'
    | 'clearing_started'
    | 'clearing_completed'
    | 'order_cancelled';
}

export interface OrderRequirementsData {
  creative_brief?: string;
  audio_files?: OrderFileAttachment[];
  reference_track?: string;
  language_dialect?: string;
  additional_notes?: string;
  submitted_at?: string;
  custom_answers?: Record<string, string | string[]>;
}

export interface Order {
  id: string;
  order_number: string;
  order_type?: OrderSourceType;
  gig_id: string;
  gig_title: string;
  service_name: string;
  seller_id: string;
  seller_name?: string;
  buyer_name: string;
  buyer_username?: string;
  buyer_email: string;
  buyer_avatar?: string;
  buyer_location?: string;
  package_type: PackageType;
  package_name: string;
  package_scope: string;
  quantity?: number;
  price_inr: number;
  price_usd?: number;
  pricing_currency?: 'INR' | 'USD';
  delivery_days: number;
  revisions_allowed: number;
  revisions_used?: number;
  selected_extras: { name: string; price_inr: number; days: number }[];
  
  // Custom Offer frozen snapshot
  custom_offer_id?: string;
  custom_offer_details?: {
    title: string;
    description: string;
    scope?: string;
    deliverables?: string[];
    requirements?: string[];
    price_inr: number;
    price_usd?: number;
    currency?: 'INR' | 'USD';
    pricing_currency?: 'INR' | 'USD';
    offer_amount?: number;
    delivery_days: number;
    revisions: number;
    quantity: number;
  };

  total_price_inr: number;
  status: OrderStatus;
  created_at: string;
  delivery_due_at?: string;
  completed_at?: string;
  
  // Requirements
  requirements_data?: OrderRequirementsData;
  requirements_submitted_at?: string;
  buyer_responses?: Record<string, string | string[]>;

  // Deliveries & Revisions
  deliveries?: OrderDelivery[];
  revision_history?: {
    request_note: string;
    requested_at: string;
    revision_number: number;
  }[];

  // Activity timeline
  activity_timeline?: OrderActivityEvent[];

  // Financial & 7-day Clearing (Seller-only)
  provider_earnings_inr: number; // 80%
  nain_fee_inr: number; // 20%
  clearing_status?: 'pending_clearing' | 'cleared';
  clearing_started_at?: string;
  clearing_ends_at?: string; // exactly 7 days after completion
  clearing_days?: number; // 7 days

  // Payment Verification & Escrow
  payment_status?: 'pending' | 'paid' | 'failed';
  payment_reference?: string;
  payment_method?: 'razorpay' | 'paypal' | 'escrow';
  paid_amount_inr?: number;

  // Indirect Tax Details (GST / VAT / Sales Tax / None)
  tax_details?: TaxDetails;
  billing_profile?: BuyerBillingProfile;
  invoice_number?: string;

  // Buyer Rating & Review
  buyer_review?: GigReview;
  reviewed_at?: string;
}

export interface ReviewSubRatings {
  communication?: number; // 1-5
  service_as_described?: number; // 1-5
  quality_of_delivery?: number; // 1-5
}

export interface GigReview {
  id: string;
  order_id: string;
  order_number: string;
  gig_id: string;
  seller_id: string;
  buyer_id?: string;
  buyer_name: string;
  buyer_username: string;
  buyer_avatar?: string;
  buyer_location?: string;
  rating: number; // 1 to 5
  sub_ratings?: ReviewSubRatings;
  review_text: string;
  package_name: string;
  package_type?: PackageType;
  price_inr?: number;
  created_at: string;
  seller_response?: {
    message: string;
    responded_at: string;
  };
  helpful_count: number;
  verified_purchase: boolean;
  tags?: string[];
}

export type BuyerType = 'individual' | 'business';

export interface BuyerBillingProfile {
  id: string;
  name: string;
  email: string;
  buyer_type: BuyerType;
  country: string; // e.g. "India"
  country_code: string; // e.g. "IN"
  state: string; // e.g. "Bihar" or "Maharashtra"
  state_code?: string; // e.g. "BR", "MH", "CA", "TX"
  postal_code: string; // e.g. "800001"
  address_line1?: string;
  business_name?: string; // required if business
  tax_id?: string; // GSTIN for India, VAT for EU/UK, EIN/Tax ID for US/other
  created_at: string;
  updated_at: string;
}

export type TaxType = 'GST' | 'VAT' | 'Sales Tax' | 'None';

export interface TaxDetails {
  buyer_country: string;
  buyer_country_code: string;
  buyer_state?: string;
  buyer_state_code?: string;
  postal_code?: string;
  buyer_type?: BuyerType;
  business_name?: string;
  tax_id?: string;
  billing_jurisdiction: string;
  tax_type: TaxType;
  tax_subtype?: string; // e.g. 'Intrastate (CGST + SGST)', 'Interstate (IGST)', 'B2B Reverse Charge'
  tax_rate: number; // e.g., 0.18
  tax_rate_percentage: string; // e.g., "18%"
  taxable_amount: number; // base INR amount
  tax_amount: number; // calculated tax in INR
  final_total: number; // base INR + tax INR
  currency: string; // 'INR'
  calculation_timestamp: string;
  tax_code?: string; // SAC / MOSS classification
  notes?: string;
  rule_source?: string;
  is_taxable?: boolean;
  is_reverse_charge?: boolean;
  exemption_reason?: string;
  
  // Specific India GST breakdown components
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;

  // Validation / Missing Information State
  is_valid: boolean;
  missing_fields?: string[];
  error_message?: string;
}

export interface CustomOffer {
  id: string;
  conversation_id?: string;
  seller_id: string;
  buyer_name: string;
  gig_id: string;
  service_name: string;
  title: string; // Scope & Specifications / Project Title
  description: string; // Offer Description & Terms
  currency?: 'INR' | 'USD';
  offer_amount?: number;
  price_inr: number;
  price_usd?: number;
  pricing_currency?: 'INR' | 'USD';
  delivery_days: number;
  revisions: number;
  requirements: string[]; // Requirements (e.g., stems, references, BPM)
  deliverables: string[];
  extras?: {
    name: string;
    price_inr: number;
    price_usd?: number;
    currency?: 'INR' | 'USD';
    pricing_currency?: 'INR' | 'USD';
    offer_amount?: number;
  }[];
  seller_notes?: string;
  cancellation_terms?: string;
  expires_at?: string;
  expiry_days?: number;
  created_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'change_requested';
  change_request_note?: string;
  order_id?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  drive_file_id?: string;
  drive_web_view_link?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'buyer' | 'seller' | 'system';
  sender_name: string;
  text?: string;
  timestamp: string;
  custom_offer_id?: string;
  attachment?: ChatAttachment;
  moderation_flag?: 'warn' | 'blocked' | 'reported';
  moderation_warning?: string;
  is_saved?: boolean;
  target_audience?: 'seller_only' | 'buyer_only' | 'all';
  reply_to?: {
    id: string;
    sender_name: string;
    snippet: string;
  };
}

export type ChatFilter = 
  | 'all' 
  | 'unread' 
  | 'starred' 
  | 'custom_offers' 
  | 'archived' 
  | 'spam' 
  | 'follow_up' 
  | 'nudge';

export interface Conversation {
  id: string;
  gig_id?: string;
  gig_title?: string;
  service_name?: string;
  seller_id: string;
  seller_name: string;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar?: string;
  messages: ChatMessage[];
  updated_at: string;
  is_starred?: boolean;
  is_archived?: boolean;
  is_spam?: boolean;
  needs_follow_up?: boolean;
  last_nudged_at?: string;
  unread_count?: number;
}

export type ModerationCategory = 
  | 'outside_payment' 
  | 'external_social_link'
  | 'email_address'
  | 'illegal_dangerous'
  | 'illegal_activity'
  | 'obscene_sexual'
  | 'explicit_content'
  | 'harassment_threat' 
  | 'suspicious_link' 
  | 'spam_scam';

export interface ModerationResult {
  action: 'allow' | 'warn' | 'block';
  category?: ModerationCategory;
  warningMessage?: string;
  blockedReason?: string;
  hasSuspiciousLink?: boolean;
}

export interface ModerationRecord {
  id: string;
  conversation_id: string;
  message_id: string;
  reporter_role: 'buyer' | 'seller' | 'system';
  reporter_name: string;
  reported_user_name: string;
  reason: string;
  description?: string;
  timestamp: string;
  message_snippet: string;
  status: 'pending_review' | 'actioned' | 'dismissed';
  automated_classification?: string;
  outcome: 'blocked' | 'flagged' | 'reported';
}

export type AppView = 'dashboard' | 'builder' | 'preview' | 'order_workspace';

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  actionPrompt?: {
    label: string;
    action: 'create_gig' | 'view_orders' | 'open_chat' | 'human_support' | 'earnings';
  };
}

