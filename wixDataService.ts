/**
 * Nain Music — Central Persistent Database Service Layer
 * Powered by Firebase Firestore (Phase 1 Migration)
 * 
 * ENTITIES MANAGED:
 * 1. users: Master user accounts and roles keyed by auth.currentUser.uid
 * 2. buyerProfiles: Private buyer preference and order contact details
 * 3. sellerProfiles: Public studio engineer and music producer profiles
 * 4. gigs: Marketplace audio engineering and production listings
 * 5. gigPackages: Tiered package structures (Basic, Standard, Premium)
 * 
 * STRICT ARCHITECTURE PRINCIPLES:
 * - Developer Google Auth credentials are NOT automatically converted into Nain Music profiles.
 * - Profiles are only created/updated when the user explicitly triggers Sign In / Sign Up / Profile Save.
 * - Firestore is authoritative. auth.currentUser.uid is the authoritative security token.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../config/firebase';
import { User, BuyerProfile, Gig, GigPackage } from '../types';

export interface DatabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'firestore' | 'local_cache_fallback';
}

class WixDataService {
  /**
   * Helper to retrieve authoritative authenticated user UID.
   * Returns null if unauthenticated.
   */
  private getAuthUid(): string | null {
    if (auth.currentUser && auth.currentUser.uid) {
      return auth.currentUser.uid;
    }
    // Check fallback session identifier if stored during guest/transition
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('nain_music_current_seller_profile_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.id || null;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  // =========================================================================
  // 1. USERS COLLECTION
  // =========================================================================

  async getUser(userId?: string): Promise<DatabaseOperationResult<User>> {
    const targetUid = userId || this.getAuthUid();
    if (!targetUid) {
      return { success: false, error: 'Unauthenticated', source: 'local_cache_fallback' };
    }

    const path = `users/${targetUid}`;
    try {
      const userRef = doc(db, 'users', targetUid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        return { success: true, data: snap.data() as User, source: 'firestore' };
      }
      return { success: false, error: 'User not found in Firestore', source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] getUser note:', error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async syncUser(userData: Partial<User>): Promise<DatabaseOperationResult<User>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated: User identity not established', source: 'local_cache_fallback' };
    }

    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      const existingSnap = await getDoc(userRef);
      const existingData = existingSnap.exists() ? (existingSnap.data() as User) : null;

      // Only save fields explicitly provided or existing in previous record
      const userPayload: User = {
        id: uid,
        name: userData.name || existingData?.name || 'Nain Studio Artist',
        username: userData.username || existingData?.username || uid.slice(0, 10),
        email: userData.email || existingData?.email || '',
        avatar_url: userData.avatar_url || existingData?.avatar_url || '',
        headline: userData.headline || existingData?.headline || 'Music Creator & Audio Engineer',
        level: userData.level || existingData?.level || 'New Seller',
        rating: userData.rating ?? existingData?.rating ?? 5.0,
        reviews_count: userData.reviews_count ?? existingData?.reviews_count ?? 0,
        response_time: userData.response_time || existingData?.response_time || '1 Hour',
        location: userData.location || existingData?.location || 'India',
        joined_date: userData.joined_date || existingData?.joined_date || '2026',
        bio: userData.bio || existingData?.bio || '',
        badges: userData.badges || existingData?.badges || ['Verified Creator'],
        role: userData.role || existingData?.role || 'seller'
      };

      await setDoc(userRef, userPayload, { merge: true });
      return { success: true, data: userPayload, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] syncUser note:', error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // =========================================================================
  // 2. BUYER PROFILES (PRIVATE ACCESS ONLY)
  // =========================================================================

  async getMyBuyerProfile(): Promise<DatabaseOperationResult<BuyerProfile>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated', source: 'local_cache_fallback' };
    }

    const path = `buyerProfiles/${uid}`;
    try {
      const profileRef = doc(db, 'buyerProfiles', uid);
      const snapshot = await getDoc(profileRef);

      if (snapshot.exists()) {
        return { success: true, data: snapshot.data() as BuyerProfile, source: 'firestore' };
      }

      // Do NOT auto-create profile on read probe; return not found cleanly
      return { success: false, error: 'Buyer profile not yet created in Firestore', source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] getMyBuyerProfile note:', error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async updateMyBuyerProfile(profileUpdate: Partial<BuyerProfile>): Promise<DatabaseOperationResult<BuyerProfile>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated', source: 'local_cache_fallback' };
    }

    const path = `buyerProfiles/${uid}`;
    try {
      const profileRef = doc(db, 'buyerProfiles', uid);
      const sanitized: Partial<BuyerProfile> = {
        ...profileUpdate,
        id: uid,
        user_id: uid
      };

      await setDoc(profileRef, sanitized, { merge: true });
      const freshSnap = await getDoc(profileRef);
      return { success: true, data: freshSnap.data() as BuyerProfile, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] updateMyBuyerProfile note:', error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // =========================================================================
  // 3. SELLER PROFILES
  // =========================================================================

  async getSellerProfile(sellerId: string): Promise<DatabaseOperationResult<User>> {
    const path = `sellerProfiles/${sellerId}`;
    try {
      const sellerRef = doc(db, 'sellerProfiles', sellerId);
      const snap = await getDoc(sellerRef);

      if (snap.exists()) {
        return { success: true, data: snap.data() as User, source: 'firestore' };
      }

      // Check fallback users collection
      const userRef = doc(db, 'users', sellerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() as User, source: 'firestore' };
      }

      return { success: false, error: 'Seller profile not found in Firestore', source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] getSellerProfile note:', error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async updateMySellerProfile(profileUpdate: Partial<User>): Promise<DatabaseOperationResult<User>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated: Must be logged in to update seller profile', source: 'local_cache_fallback' };
    }

    const path = `sellerProfiles/${uid}`;
    try {
      const sellerRef = doc(db, 'sellerProfiles', uid);
      const payload: Partial<User> & { id: string; user_id: string } = {
        ...profileUpdate,
        id: uid,
        user_id: uid
      };

      await setDoc(sellerRef, payload, { merge: true });
      // Also update master users collection for role synchronization
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { ...payload, role: 'seller' }, { merge: true });

      const updatedSnap = await getDoc(sellerRef);
      return { success: true, data: updatedSnap.data() as User, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] updateMySellerProfile note:', error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // =========================================================================
  // 4. GIGS & GIG PACKAGES
  // =========================================================================

  async getGigs(options?: { serviceId?: string; sellerOnly?: boolean }): Promise<DatabaseOperationResult<Gig[]>> {
    const path = 'gigs';
    try {
      const uid = this.getAuthUid();
      const gigsCol = collection(db, 'gigs');

      let gigsQuery;
      if (options?.sellerOnly && uid) {
        // Query only gigs belonging to authenticated seller
        gigsQuery = query(gigsCol, where('seller_id', '==', uid));
      } else if (options?.serviceId) {
        // Query published gigs filtered by service category
        gigsQuery = query(gigsCol, where('status', '==', 'published'), where('service_id', '==', options.serviceId));
      } else {
        // Query all published marketplace gigs
        gigsQuery = query(gigsCol, where('status', '==', 'published'));
      }

      const querySnapshot = await getDocs(gigsQuery);
      const gigs: Gig[] = [];

      querySnapshot.forEach(docSnap => {
        gigs.push(docSnap.data() as Gig);
      });

      return { success: true, data: gigs, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] getGigs note:', error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async getGigById(gigId: string): Promise<DatabaseOperationResult<Gig>> {
    const path = `gigs/${gigId}`;
    try {
      const gigRef = doc(db, 'gigs', gigId);
      const snap = await getDoc(gigRef);

      if (!snap.exists()) {
        return { success: false, error: 'Gig not found in Firestore', source: 'firestore' };
      }

      const gigData = snap.data() as Gig;
      return { success: true, data: gigData, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] getGigById note:', error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async saveGig(gig: Gig): Promise<DatabaseOperationResult<Gig>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated: Must be logged in to save gig', source: 'local_cache_fallback' };
    }

    const path = `gigs/${gig.id}`;
    try {
      const gigRef = doc(db, 'gigs', gig.id);
      const enforcedGig: Gig = {
        ...gig,
        seller_id: gig.seller_id || uid, // Maintain seller ownership
        updated_at: new Date().toISOString()
      };

      await setDoc(gigRef, enforcedGig, { merge: true });

      // Save individual packages if present
      if (gig.packages && Array.isArray(gig.packages)) {
        for (const pkg of gig.packages) {
          if (pkg.id) {
            const pkgRef = doc(db, 'gigPackages', pkg.id);
            await setDoc(pkgRef, { ...pkg, gig_id: gig.id }, { merge: true });
          }
        }
      }

      return { success: true, data: enforcedGig, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] saveGig note:', error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  async createGig(gig: Gig): Promise<DatabaseOperationResult<Gig>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated: Must be logged in to create gig', source: 'local_cache_fallback' };
    }

    const path = `gigs/${gig.id}`;
    try {
      const gigRef = doc(db, 'gigs', gig.id);
      const newGig: Gig = {
        ...gig,
        seller_id: uid, // Authoritative seller ownership
        created_at: gig.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(gigRef, newGig);

      // Persist packages
      if (gig.packages && Array.isArray(gig.packages)) {
        for (const pkg of gig.packages) {
          if (pkg.id) {
            const pkgRef = doc(db, 'gigPackages', pkg.id);
            await setDoc(pkgRef, { ...pkg, gig_id: gig.id });
          }
        }
      }

      return { success: true, data: newGig, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] createGig note:', error);
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  async deleteGig(gigId: string): Promise<DatabaseOperationResult<boolean>> {
    const uid = this.getAuthUid();
    if (!uid) {
      return { success: false, error: 'Unauthenticated: Must be logged in to delete gig', source: 'local_cache_fallback' };
    }

    const path = `gigs/${gigId}`;
    try {
      const gigRef = doc(db, 'gigs', gigId);
      const snap = await getDoc(gigRef);

      if (snap.exists()) {
        const gigData = snap.data() as Gig;
        if (gigData.seller_id !== uid) {
          throw new Error('Forbidden: You cannot delete another seller\'s Gig');
        }
      }

      await deleteDoc(gigRef);
      return { success: true, data: true, source: 'firestore' };
    } catch (error) {
      console.warn('[Firestore] deleteGig note:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export const wixDataService = new WixDataService();
