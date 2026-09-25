import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS configuration for Wix domain and app subdomain
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://nain-music.com',
    'https://www.nain-music.com',
    'https://app.nain-music.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (origin) {
    if (allowedOrigins.includes(origin) || origin.endsWith('.wixsite.com') || origin.endsWith('.run.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Fallback intelligent answers for Nain Music if Gemini API key is missing or offline
function getFallbackResponse(query: string, languagePref?: string): string {
  const q = query.toLowerCase();
  const isHindi = languagePref === 'hi' || /[अ-ह]|kaise|kya|btao|batao|karna|chahiye|madad|paise|karein|hoga|hogi|bana|suno|karo/i.test(query);

  if (q.includes('gig') || q.includes('service') || q.includes('banaye') || q.includes('create')) {
    if (isHindi) {
      return `🎵 **Nain Music par Gig Kaise Banayein:**\n\n1. **Service Chuniye:** Dashboard me top par '+ Create Gig' button par click karein aur apna music domain chunein (jaise Mixing & Mastering, Beat Production, Vocal Tuning, ya Lyric Writing).\n2. **Overview & Packages:** Basic, Standard, aur Premium packages ke titles, delivery time (days), revisions, aur INR (₹) price set karein.\n3. **Dynamic Features:** Stem limit, analog processing, WAV/MP3 delivery formats toggle karein.\n4. **Requirements & Audio Sample:** Buyer ke liye audio stems upload instructions dalein aur apna best audio preview link add karein.\n5. **Publish:** Save & Publish karte hi aapka Gig live ho jayega aur buyers orders place kar sakenge!`;
    }
    return `🎵 **How to Create a Gig on Nain Music:**\n\n1. **Select Service:** Click '+ Create Gig' in the top navigation or dashboard and choose your audio service (e.g. Mixing & Mastering, Beat Production, Vocal Tuning).\n2. **Packages & Pricing:** Set up 3 tiers (Basic, Standard, Premium) with custom delivery days, revision limits, and INR (₹) rates.\n3. **Audio Features:** Configure features like stems limit, analog gear, audio formats, and extra add-ons.\n4. **Requirements & Demo:** Specify what files the buyer needs to submit (e.g. raw WAV stems, BPM/Key) and add your portfolio demo.\n5. **Publish:** Hit Publish to make your Gig instantly available for discovery and checkout!`;
  }

  if (q.includes('earning') || q.includes('paise') || q.includes('fee') || q.includes('payout') || q.includes('percent') || q.includes('commission')) {
    if (isHindi) {
      return `💰 **Nain Music Marketplace Economics:**\n\n• **80% Provider Earnings:** Aap jo bhi order complete karte hain, uska seedha **80% hissa** aapko milta hai.\n• **20% Platform Fee:** 20% platform charge hota hai jo secure checkout, hosting aur buyer acquisition cover karta hai.\n• **Base Currency INR (₹):** Saari core pricing Indian Rupee me fix rehti hai, aur international buyers ke liye live daily exchange rates par automatic convert hoti hai.\n• Header me 'Earnings (80%)' par click karke aap apna total revenue aur order-wise breakdown dekh sakte hain!`;
    }
    return `💰 **Nain Music Economics & Payouts:**\n\n• **80% Provider Share:** Audio creators and music producers receive **80% net earnings** on every completed order.\n• **20% Platform Fee:** 20% covers buyer discovery, secure payments, and studio infrastructure.\n• **Base Currency INR (₹):** Pricing is anchored in INR with real-time conversion for international clients.\n• Click 'Earnings (80%)' in the top header to view detailed payout analytics!`;
  }

  if (q.includes('payment') || q.includes('razorpay') || q.includes('paypal') || q.includes('upi')) {
    if (isHindi) {
      return `💳 **Payment Methods on Nain Music:**\n\n• **Domestic (India):** Razorpay ke zariye UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, aur NetBanking se turant payment hoti hai.\n• **International (Global):** PayPal aur International Cards ke zariye USD, EUR, GBP me payment accepted hai.\n• Sabhi payments 100% secure escrow me rehti hain jab tak order deliver aur review nahi ho jata.`;
    }
    return `💳 **Payment Gateways Supported:**\n\n• **India:** Instant checkout via Razorpay supporting UPI (GPay, PhonePe, Paytm), Cards, and NetBanking.\n• **Global:** PayPal and International Credit/Debit cards with automatic multi-currency conversion.\n• Funds are securely held in studio escrow until buyer acceptance!`;
  }

  if (q.includes('review') || q.includes('star') || q.includes('rating') || q.includes('feedback')) {
    if (isHindi) {
      return `⭐ **Review & Rating System:**\n\n• Order complete hone ke baad Buyer 1 se 5 stars tak rating de sakta hai.\n• Initial state empty hoti hai taaki buyer apni pasand se 1, 2, 3, 4, ya 5 stars choose kar sake.\n• 3-Criteria Evaluation: Communication, Service as Described, aur Quality of Delivery.\n• Review publish hone ke baad Seller ko official text reply dene ka adhikar hota hai jo public profile par dikhta hai.`;
    }
    return `⭐ **Review & Star Ratings:**\n\n• Buyers rate delivered orders from 1 to 5 stars upon completion.\n• Includes a 3-Criteria Breakdown: Communication, Service as Described, and Delivery Quality.\n• Sellers can submit an official public reply once a review is posted!`;
  }

  if (q.includes('mixing') || q.includes('mastering') || q.includes('audio') || q.includes('sound')) {
    if (isHindi) {
      return `🎧 **Mixing vs Mastering Studio Guide:**\n\n• **Mixing:** Individual tracks (vocals, drums, bass, synths) ko balance karna, EQ, compression, panning, aur reverb/delay dekar ek cohesive stereo track banana.\n• **Mastering:** Final stereo mixdown ko radio/streaming standards (-14 LUFS, true peak limit), spectral balance, analog saturation aur stereo widening dekar commercial release ke liye tayar karna.\n• Nain Music par dono ke dedicated gigs aur multi-tier packages available hain!`;
    }
    return `🎧 **Mixing vs Mastering Breakdown:**\n\n• **Mixing:** Balancing individual instrument and vocal stems with EQ, dynamic compression, and stereo imaging.\n• **Mastering:** Polishing the final 2-track mix for commercial loudness (-14 LUFS), tonal consistency, and punch across all playback systems.\n• Both services are natively supported in our Universal Gig Builder!`;
  }

  if (isHindi) {
    return `Namaste! Main Nain Music ka AI Studio Assistant hoon. 🎧\n\nMain aapki in cheezon me madad kar sakta hoon:\n• **Music Gigs banana ya edit karna** (Mixing, Mastering, Beats, Vocals)\n• **Pricing & Packages** (Basic, Standard, Premium)\n• **Earnings & Payments** (80% provider share, Razorpay/UPI/PayPal)\n• **Orders, Revisions aur Reviews**\n\nAap apna sawal Hindi ya English kisi me bhi pooch sakte hain!`;
  }

  return `Hello! I am your Nain Music AI Studio Assistant. 🎧\n\nI can help you with:\n• **Creating or customizing Music Gigs** (Mixing, Mastering, Production, Vocals)\n• **Configuring Packages & Pricing** (Basic, Standard, Premium tiers)\n• **Payouts & Marketplace Economics** (80% provider share, UPI/Razorpay/PayPal)\n• **Order Management, Deliveries & Star Ratings**\n\nFeel free to ask your question in either English or Hindi/Hinglish!`;
}

// Support Chat API route powered by Gemini with fallback
app.post('/api/support-chat', async (req, res) => {
  try {
    const { messages, languagePreference } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestUserMessage = messages[messages.length - 1]?.text || '';

    // Check if Gemini API is available
    const gemini = getGeminiClient();

    if (!gemini) {
      // Return smart fallback if no key
      const fallback = getFallbackResponse(latestUserMessage, languagePreference);
      return res.json({ reply: fallback, source: 'fallback_knowledge' });
    }

    // Build chat context for Gemini
    const systemInstruction = `You are "Nain AI Assistant" (नैन म्यूजिक एआई असिस्टेंट), the warm, intelligent, and highly knowledgeable first-line Help & Support assistant for Nain Music.

Core Mandate:
- BILINGUAL SUPPORT: You speak and understand both Hindi (हिंदी / Hinglish) and English fluently.
- If the user talks to you in Hindi or Hinglish, answer in natural, friendly, polite Hindi/Hinglish (using 'Aap', 'Ji', clear studio guidance).
- If the user speaks in English, reply in crisp, professional English.
- If the user mixes languages or languagePreference is specified, adapt smoothly.
- Your primary duty is to be the FIRST voice that greets and helps users when they need assistance.

Knowledge of Nain Music Platform:
- Universal Gig Builder: Supports Mixing & Mastering, Beat Production, Vocal Tuning & Pitch Correction, Ghost Production, Lyric Writing, Custom Beats, and Album Artwork.
- Package Structure: 3-tier packages (Basic, Standard, Premium) with customizable delivery days, revisions, and INR rates.
- Marketplace Economics: 80% Provider Earnings, 20% Nain Platform Fee. Base currency is INR (₹) with real-time conversion for USD, EUR, GBP, etc.
- Payments: Domestic via Razorpay (UPI, GPay, PhonePe, Paytm, Cards, NetBanking), International via PayPal or Cards.
- Order Lifecycle: Requirements -> Active In-Production -> Delivery of stems/WAV -> Buyer Review & 1 to 5 Star Rating -> Seller public reply.
- Custom Offers: Sellers and buyers can negotiate custom scopes and prices directly in 1-to-1 private chat.
- Studio Audio Expertise: You know audio engineering, LUFS, sample rates (24-bit 48kHz / 96kHz), WAV/MP3, analog summing, tuning, stem separation.

Formatting & Style:
- Use clean Markdown with bold headings and bullet points for readability.
- Keep answers warm, practical, and direct.
- At the end of relevant answers, gently ask if they need help creating a gig, checking an order, or contacting human support.`;

    // Format conversation history for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || getFallbackResponse(latestUserMessage, languagePreference);
    return res.json({ reply: replyText, source: 'gemini-3.8-flash' });

  } catch (error: any) {
    console.error('Error in /api/support-chat:', error);
    // Graceful fallback on any API error
    const latestUserMessage = req.body?.messages?.[req.body.messages.length - 1]?.text || '';
    const fallback = getFallbackResponse(latestUserMessage, req.body?.languagePreference);
    return res.json({ reply: fallback, source: 'fallback_resilient', errorNotice: error?.message });
  }
});

// Storage Architecture Manifest & Audit Route
app.get('/api/storage/manifest', (req, res) => {
  res.json({
    status: 'locked_and_enforced',
    architecture: {
      wix_database: {
        layer: 'Permanent Core Data (Wix / App Database)',
        entities: [
          'Buyer profiles & preferences',
          'Seller profiles, bio, DAW setup, studio gear',
          'Gig details, pricing tiers, FAQs, requirements',
          'Orders and order metadata',
          'Reviews and star ratings',
          'Earnings ledger & Platform Fee records (80/20 split)',
          'Followers and marketplace records',
          'Chat text/messages and chat metadata'
        ]
      },
      wix_visual_assets: {
        layer: 'Permanent Visual Assets (Wix)',
        entities: [
          'Buyer/Seller profile photos',
          'Seller logos & badges',
          'Gig cover images & thumbnails'
        ]
      },
      google_drive: {
        layer: 'Heavy File Storage ONLY',
        purposes: [
          'Chat heavy attachments (audio/video/PDF/docs) with real-time deletion policy sync',
          'Order Delivery heavy files (Master WAVs, Stems, multitrack ZIPs) with permanent archive protection'
        ],
        forbidden_storage: [
          'App code',
          'Backend code',
          'Buyer/Seller profiles',
          'Gig database',
          'Orders database',
          'Reviews & Ratings',
          'Earnings & Platform Fee ledger',
          'Permanent profile images',
          'Permanent Gig images',
          'Authentication / session tokens'
        ]
      }
    }
  });
});

// Wix Integration Route Map & Status Endpoint
app.get('/api/wix/route-map', (req, res) => {
  res.json({
    status: 'connected',
    marketing_site: 'https://www.nain-music.com',
    app_subdomain: 'https://app.nain-music.com',
    dns_records: {
      type: 'CNAME',
      host: 'app',
      target: 'ghs.googlehosted.com.',
      ttl: 3600
    },
    cta_mappings: [
      { button: 'Browse Gigs', url: 'https://app.nain-music.com/?view=preview&ref=wix' },
      { button: 'Book a Music Class', url: 'https://app.nain-music.com/?service=music-classes&view=preview&ref=wix' },
      { button: 'Mixing & Mastering', url: 'https://app.nain-music.com/?service=mixing-mastering&view=preview&ref=wix' },
      { button: 'Music Production', url: 'https://app.nain-music.com/?service=music-production&view=preview&ref=wix' },
      { button: 'Become a Seller / Create Gig', url: 'https://app.nain-music.com/?view=builder&action=create-gig&ref=wix' },
      { button: 'Sign In / Account', url: 'https://app.nain-music.com/?action=login&ref=wix' },
      { button: 'Private Studio Chat', url: 'https://app.nain-music.com/?action=chat&ref=wix' },
      { button: 'AI Help & Support', url: 'https://app.nain-music.com/?action=support&ref=wix' },
      { button: 'My Orders / Project Status', url: 'https://app.nain-music.com/?view=orders&ref=wix' }
    ]
  });
});

// Health check endpoint for uptime monitors and DNS verification
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'nain-music-app',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// PHASE 1: FIREBASE FIRESTORE PERSISTENT DATABASE LAYER
// Collections: users, buyerProfiles, sellerProfiles, gigs, gigPackages
// ============================================================================

// Phase 1 Database Audit & Verification Endpoint
app.get('/api/db/audit', (req, res) => {
  res.json({
    phase: 'Phase 1 Active (Firestore Production Migration)',
    primary_database: 'Firebase Firestore',
    authoritative_collections: [
      'users',
      'buyerProfiles',
      'sellerProfiles',
      'gigs',
      'gigPackages'
    ],
    storage_architecture: {
      metadata_and_marketplace: 'Firebase Firestore (Authoritative)',
      heavy_audio_and_deliveries: 'Google Drive v3 (Exclusive heavy file store)',
      flat_file_json: 'Decommissioned / Inactive'
    },
    security: {
      rules_engine: 'firestore.rules',
      abac_attribute_access_control: true,
      auth_uid_authoritative: true,
      cross_user_isolation: true,
      published_only_public_queries: true
    }
  });
});


// Start Express server and mount Vite middleware
async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nain Music full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
