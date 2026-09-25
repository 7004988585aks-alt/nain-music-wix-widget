/**
 * Nain Music — Wix Website & Custom Subdomain Integration Configuration
 *
 * ARCHITECTURE OVERVIEW:
 * 1. Public Marketing Website (Wix): https://www.nain-music.com
 *    - Home, About Us, Services Overview, Music Classes Info, Contact, FAQ, Blog
 * 2. Actual Marketplace Application: https://app.nain-music.com (Cloud Run / App Engine)
 *    - User authentication, Gigs discovery, Universal Gig Builder, Private Messaging,
 *      Orders & Milestones, Deliveries, Reviews & Star Ratings, 80/20 Earnings, Audio Player
 * 3. App Database: Persistent Core Storage (Profiles, Gigs, Orders, Reviews, Chat metadata)
 * 4. Wix Media CDN: Permanent Visual Assets (Profile photos, Logos, Gig cover art)
 * 5. Google Drive Vault: Heavy Chat Attachments & Order Deliverables (Master WAVs, Stems) ONLY.
 */

export interface WixRouteMapping {
  title: string;
  wixButtonName: string;
  wixPageLocation: string;
  targetAppPath: string;
  queryParam: string;
  description: string;
  targetAction: string;
}

export const WIX_CONFIG = {
  /** Production Wix Marketing Website URL */
  wixMarketingUrl: typeof process !== 'undefined' && process.env?.VITE_WIX_SITE_URL
    ? process.env.VITE_WIX_SITE_URL
    : 'https://www.nain-music.com',

  /** Production Nain Music App Subdomain */
  appSubdomainUrl: typeof process !== 'undefined' && process.env?.VITE_APP_URL
    ? process.env.VITE_APP_URL
    : 'https://app.nain-music.com',

  /** Target Subdomain for DNS */
  dnsSubdomain: 'app.nain-music.com',
  rootDomain: 'nain-music.com',

  /** DNS Configuration for Domain Provider (GoDaddy, Namecheap, Google Domains, Cloudflare, Wix DNS) */
  dnsRecords: [
    {
      type: 'CNAME',
      name: 'app',
      target: 'ghs.googlehosted.com.',
      ttl: '3600 (Auto)',
      purpose: 'Points app.nain-music.com subdomain to Nain Music Cloud Run infrastructure'
    },
    {
      type: 'TXT (Verification, if required by GCP)',
      name: 'app (or root @)',
      target: 'google-site-verification=...',
      ttl: '3600',
      purpose: 'Google Cloud Custom Domain ownership verification'
    }
  ],

  /** Verified Routes for Wix Buttons & Links */
  routeMappings: [
    {
      title: 'Browse Gigs & Marketplace',
      wixButtonName: 'Browse Gigs / Explore Services',
      wixPageLocation: 'Wix Home Header, Hero CTA, Services Page',
      targetAppPath: '/?view=preview&ref=wix',
      queryParam: 'view=preview&ref=wix',
      description: 'Opens the Nain Music marketplace and gig preview explorer in buyer view mode.',
      targetAction: 'Opens Buyer Marketplace'
    },
    {
      title: 'Book a Music Class',
      wixButtonName: 'Book a Music Class / Learn Production',
      wixPageLocation: 'Wix Music Classes Page, Academy Section',
      targetAppPath: '/?service=music-classes&view=preview&ref=wix',
      queryParam: 'service=music-classes&view=preview&ref=wix',
      description: 'Filters and navigates directly to 1-on-1 Music Classes and Coaching gigs.',
      targetAction: 'Opens Music Classes Booking'
    },
    {
      title: 'Mixing & Mastering Services',
      wixButtonName: 'Order Mixing & Mastering',
      wixPageLocation: 'Wix Services Page, Audio Engineering Section',
      targetAppPath: '/?service=mixing-mastering&view=preview&ref=wix',
      queryParam: 'service=mixing-mastering&view=preview&ref=wix',
      description: 'Directly opens certified Mixing & Mastering gigs with multi-track packages.',
      targetAction: 'Opens Mixing & Mastering Gig'
    },
    {
      title: 'Music Production & Custom Beats',
      wixButtonName: 'Get Custom Beats / Music Production',
      wixPageLocation: 'Wix Beat Store / Production Section',
      targetAppPath: '/?service=music-production&view=preview&ref=wix',
      queryParam: 'service=music-production&view=preview&ref=wix',
      description: 'Directly opens Beat Production and instrumental scoring gigs.',
      targetAction: 'Opens Music Production Gig'
    },
    {
      title: 'Become a Seller / Create Gig',
      wixButtonName: 'Become a Seller / Join as Creator',
      wixPageLocation: 'Wix Header CTA, Footer Creator Link, Join Page',
      targetAppPath: '/?view=builder&action=create-gig&ref=wix',
      queryParam: 'view=builder&action=create-gig&ref=wix',
      description: 'Launches the Universal Gig Builder for audio engineers to publish their gigs.',
      targetAction: 'Opens Universal Gig Builder'
    },
    {
      title: 'Sign In / Account Access',
      wixButtonName: 'Login / Sign In',
      wixPageLocation: 'Wix Navigation Bar (Right)',
      targetAppPath: '/?action=login&ref=wix',
      queryParam: 'action=login&ref=wix',
      description: 'Directs user to authentication and account profile workspace.',
      targetAction: 'Opens Profile / Account Auth'
    },
    {
      title: 'Direct 1-on-1 Studio Chat',
      wixButtonName: 'Message SoundLab Studio',
      wixPageLocation: 'Wix Contact Page, Seller Profile Card',
      targetAppPath: '/?action=chat&ref=wix',
      queryParam: 'action=chat&ref=wix',
      description: 'Directly triggers the private 1-to-1 audio consultation and custom offer chat modal.',
      targetAction: 'Opens Studio Messaging Modal'
    },
    {
      title: '24/7 AI Audio Support',
      wixButtonName: 'Ask AI Help Desk (Hindi / English)',
      wixPageLocation: 'Wix Support / FAQ Page',
      targetAppPath: '/?action=support&ref=wix',
      queryParam: 'action=support&ref=wix',
      description: 'Launches the bilingual Nain AI Assistant modal immediately upon load.',
      targetAction: 'Opens AI Assistant Support'
    },
    {
      title: 'Track Orders & Deliveries',
      wixButtonName: 'My Orders / Project Status',
      wixPageLocation: 'Wix User Menu / Track Order Link',
      targetAppPath: '/?view=orders&ref=wix',
      queryParam: 'view=orders&ref=wix',
      description: 'Opens Buyer Orders Dashboard with active status, revisions, and Google Drive stem downloads.',
      targetAction: 'Opens Orders Workspace'
    }
  ] as WixRouteMapping[]
};

/**
 * Builds the full direct URL for any Wix button target
 */
export function getWixConnectedAppUrl(queryParam: string, baseUrl?: string): string {
  const base = baseUrl || WIX_CONFIG.appSubdomainUrl;
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanParam = queryParam.startsWith('/') ? queryParam : `/${queryParam.startsWith('?') ? queryParam : `?${queryParam}`}`;
  return `${cleanBase}${cleanParam}`;
}
