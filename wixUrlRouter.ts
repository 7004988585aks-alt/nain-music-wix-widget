/**
 * Utility for parsing and synchronizing URL parameters between Wix and Nain Music App
 */
import { AppView } from '../types';

export interface ParsedWixUrlState {
  view?: AppView;
  serviceId?: string;
  gigId?: string;
  action?: 'create-gig' | 'chat' | 'messages' | 'support' | 'orders' | 'buyer-profile' | 'seller-profile' | 'billing' | 'login' | 'signup' | string;
  isFromWix: boolean;
  languagePref?: string;
}

/**
 * Parses search query params and hash from the current window location
 */
export function parseIncomingWixUrl(): ParsedWixUrlState {
  if (typeof window === 'undefined') {
    return { isFromWix: false };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toLowerCase();
    const serviceParam = params.get('service')?.toLowerCase();
    const gigParam = params.get('gig');
    const actionParam = params.get('action')?.toLowerCase();
    const refParam = params.get('ref')?.toLowerCase();
    const langParam = params.get('lang')?.toLowerCase();

    let targetView: AppView | undefined = undefined;

    if (viewParam === 'preview' || viewParam === 'marketplace' || viewParam === 'browse' || viewParam === 'buyer') {
      targetView = 'preview';
    } else if (viewParam === 'builder' || viewParam === 'create') {
      targetView = 'builder';
    } else if (viewParam === 'dashboard' || viewParam === 'seller' || viewParam === 'studio') {
      targetView = 'dashboard';
    } else if (viewParam === 'order_workspace' || viewParam === 'orders' || viewParam === 'workspace') {
      targetView = 'order_workspace';
    }

    // Direct action mappings to views if view not explicitly provided
    if (!targetView && actionParam) {
      if (actionParam === 'create-gig' || actionParam === 'become-seller') {
        targetView = 'builder';
      } else if (actionParam === 'orders') {
        targetView = 'order_workspace';
      } else if (actionParam === 'browse' || actionParam === 'classes') {
        targetView = 'preview';
      }
    }

    // Direct service parameter implies preview/marketplace if no other view requested
    if (!targetView && serviceParam) {
      targetView = 'preview';
    }

    const isFromWix = refParam === 'wix' || Boolean(document.referrer && document.referrer.includes('nain-music.com'));

    return {
      view: targetView,
      serviceId: serviceParam || undefined,
      gigId: gigParam || undefined,
      action: actionParam || undefined,
      isFromWix,
      languagePref: langParam || undefined
    };
  } catch (err) {
    console.error('Error parsing incoming URL:', err);
    return { isFromWix: false };
  }
}

/**
 * Updates browser URL history state smoothly without triggering full reload
 */
export function syncAppUrl(state: {
  view?: AppView;
  serviceId?: string;
  gigId?: string;
  ref?: string;
}) {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  try {
    const currentUrl = new URL(window.location.href);
    
    if (state.view) {
      currentUrl.searchParams.set('view', state.view);
    }
    if (state.serviceId) {
      currentUrl.searchParams.set('service', state.serviceId);
    }
    if (state.gigId) {
      currentUrl.searchParams.set('gig', state.gigId);
    }
    if (state.ref) {
      currentUrl.searchParams.set('ref', state.ref);
    }

    window.history.replaceState({}, '', currentUrl.toString());
  } catch (err) {
    // Ignore URL rewrite failures in constrained environments
  }
}

/**
 * Clears transient modal actions (e.g. ?action=login) from URL so modal close returns cleanly to app
 */
export function clearUrlAction() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  try {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('action')) {
      currentUrl.searchParams.delete('action');
      const newQuery = currentUrl.searchParams.toString();
      const newUrl = currentUrl.pathname + (newQuery ? '?' + newQuery : '') + currentUrl.hash;
      window.history.replaceState({}, '', newUrl);
    }
  } catch (err) {
    // Ignore URL rewrite failures
  }
}
