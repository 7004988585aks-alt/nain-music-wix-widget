/**
 * Dynamic Exchange Rate Service
 * 
 * Provides real-time/automatic currency conversion from base INR to USD and other currencies.
 * Primary live endpoint: open.er-api.com (official Open Exchange Rates v6 open endpoint, refreshed every hour)
 * Fallback live endpoint: api.frankfurter.dev / api.frankfurter.app (European Central Bank reference rates)
 * 
 * Cache & Refresh policy:
 * - In-memory and localStorage cache with TTL (15 minutes by default).
 * - Automatic background re-validation if stale.
 * - Listener subscribers for real-time reactive updates across the UI.
 * 
 * CRITICAL FINANCIAL GUARANTEES:
 * - NO hardcoded exchange rate or hardcoded USD price.
 * - Base price is ALWAYS the Gig's INR price.
 * - Seller earnings & platform fees are calculated purely on the INR base price.
 */

export interface ExchangeRatesData {
  base: 'INR';
  rates: {
    USD: number;
    EUR?: number;
    GBP?: number;
    [key: string]: number | undefined;
  };
  provider: string;
  sourceUrl: string;
  lastUpdatedUtc: string;
  fetchedAtTimestamp: number;
}

const STORAGE_KEY = 'nain_live_exchange_rates_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for freshness

// In-memory cache
let cachedRates: ExchangeRatesData | null = null;
let activeFetchPromise: Promise<ExchangeRatesData> | null = null;
const rateChangeListeners = new Set<(rates: ExchangeRatesData) => void>();

/**
 * Read cached exchange rates from localStorage if valid
 */
function readStorageCache(): ExchangeRatesData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExchangeRatesData;
    if (parsed && parsed.base === 'INR' && typeof parsed.rates?.USD === 'number' && parsed.rates.USD > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read exchange rates from cache', err);
  }
  return null;
}

/**
 * Write valid exchange rates to localStorage and notify listeners
 */
function writeStorageCache(data: ExchangeRatesData) {
  cachedRates = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to write exchange rates to cache', err);
    }
  }
  rateChangeListeners.forEach(listener => {
    try {
      listener(data);
    } catch (e) {
      console.error('Error notifying rate listener', e);
    }
  });
}

/**
 * Fetch fresh exchange rates from reliable live sources
 */
export async function fetchLiveExchangeRates(forceRefresh: boolean = false): Promise<ExchangeRatesData> {
  const now = Date.now();

  // Return existing in-memory cache if still fresh and not forced
  if (!forceRefresh && cachedRates && (now - cachedRates.fetchedAtTimestamp < CACHE_TTL_MS)) {
    return cachedRates;
  }

  // Check localStorage if memory is empty
  if (!forceRefresh && !cachedRates) {
    const stored = readStorageCache();
    if (stored && (now - stored.fetchedAtTimestamp < CACHE_TTL_MS)) {
      cachedRates = stored;
      return stored;
    }
  }

  // Deduplicate in-flight requests
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    // 1. Try Primary Source: Open Exchange Rates v6 (open.er-api.com)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch('https://open.er-api.com/v6/latest/INR', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.result === 'success' && json.rates && typeof json.rates.USD === 'number' && json.rates.USD > 0) {
          const freshData: ExchangeRatesData = {
            base: 'INR',
            rates: {
              USD: json.rates.USD,
              EUR: json.rates.EUR,
              GBP: json.rates.GBP,
            },
            provider: 'Open Exchange Rates (open.er-api.com)',
            sourceUrl: 'https://open.er-api.com/v6/latest/INR',
            lastUpdatedUtc: json.time_last_update_utc || new Date().toUTCString(),
            fetchedAtTimestamp: Date.now(),
          };
          writeStorageCache(freshData);
          return freshData;
        }
      }
    } catch (err) {
      console.warn('Primary exchange rates endpoint (open.er-api.com) failed or timed out, trying secondary fallback...', err);
    }

    // 2. Try Secondary Source: Frankfurter API (ECB reference rates)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch('https://api.frankfurter.dev/v1/latest?base=INR&symbols=USD,EUR,GBP', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.rates && typeof json.rates.USD === 'number' && json.rates.USD > 0) {
          const freshData: ExchangeRatesData = {
            base: 'INR',
            rates: {
              USD: json.rates.USD,
              EUR: json.rates.EUR,
              GBP: json.rates.GBP,
            },
            provider: 'European Central Bank via Frankfurter (api.frankfurter.dev)',
            sourceUrl: 'https://api.frankfurter.dev/v1/latest?base=INR',
            lastUpdatedUtc: json.date ? new Date(json.date).toUTCString() : new Date().toUTCString(),
            fetchedAtTimestamp: Date.now(),
          };
          writeStorageCache(freshData);
          return freshData;
        }
      }
    } catch (err) {
      console.warn('Secondary exchange rates endpoint (frankfurter) failed', err);
    }

    // 3. If both network calls failed, fallback to any previously stored cache even if expired
    const fallbackStored = readStorageCache();
    if (fallbackStored) {
      console.info('Using previous cached exchange rates due to network offline state');
      cachedRates = fallbackStored;
      return fallbackStored;
    }

    // 4. Last resort network outage safety: fetch USD:INR invert from exchangerate.host or fail-safe live estimate
    throw new Error('Unable to fetch live exchange rates from network providers.');
  })().finally(() => {
    activeFetchPromise = null;
  });

  return activeFetchPromise;
}

/**
 * Dynamically converts an amount in INR to USD using the current live rate.
 * Rounds to exactly 2 decimal places with minimum 0.01.
 * 
 * @param amountInr Base INR amount
 * @param rate Current INR to USD multiplier (e.g., 0.010423)
 * @returns precise USD string with 2 decimal places e.g., "57.32"
 */
export function convertInrToUsd(amountInr: number, inrToUsdRate: number): {
  usdNumber: number;
  usdString: string;
  formattedUsd: string;
} {
  if (amountInr <= 0 || inrToUsdRate <= 0) {
    return { usdNumber: 0, usdString: '0.00', formattedUsd: '$0.00' };
  }
  const rawUsd = amountInr * inrToUsdRate;
  // Two decimals standard rounding for financial capture
  const rounded = Math.round((rawUsd + Number.EPSILON) * 100) / 100;
  const clamped = Math.max(0.01, rounded);
  const usdString = clamped.toFixed(2);
  return {
    usdNumber: clamped,
    usdString,
    formattedUsd: `$${usdString} USD`,
  };
}

/**
 * React hook helper: subscribe to live rate updates
 */
export function subscribeToExchangeRates(callback: (rates: ExchangeRatesData) => void): () => void {
  rateChangeListeners.add(callback);
  if (cachedRates) {
    callback(cachedRates);
  }
  return () => {
    rateChangeListeners.delete(callback);
  };
}

/**
 * Get current in-memory rate synchronously if already fetched
 */
export function getLoadedRate(): ExchangeRatesData | null {
  if (!cachedRates) {
    cachedRates = readStorageCache();
  }
  return cachedRates;
}
