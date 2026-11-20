import { useState, useEffect } from 'react';

/** Base prices in PKR for each course (keyed by a stable identifier). */
export interface CoursePriceData {
  /** Price in PKR — always set. */
  pkr: number;
  /** Price in USD — only set when both currencies are provided. */
  usd?: number;
  /** For YouTube-style dual pricing (full course vs recorded lectures). */
  secondaryPkr?: number;
  secondaryUsd?: number;
  /** Label for primary price (e.g. "Full course"). */
  primaryLabel?: string;
  /** Label for secondary price (e.g. "Recorded lectures"). */
  secondaryLabel?: string;
}

interface CurrencyState {
  /** ISO country code (e.g. 'PK', 'US', 'GB'). */
  countryCode: string | null;
  /** Detected currency symbol (e.g. 'Rs', '$', '\u00a3'). */
  symbol: string;
  /** Conversion rate from PKR to local currency. */
  rateFromPkr: number;
  /** Whether detection is still in progress. */
  loading: boolean;
}

const CACHE_KEY_COUNTRY = 'mg_currency_country';
const CACHE_KEY_RATES = 'mg_currency_rates';
const CACHE_KEY_TS = 'mg_currency_ts';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const COUNTRY_CURRENCY_MAP: Record<string, { symbol: string; currency: string }> = {
  PK: { symbol: 'Rs', currency: 'PKR' },
  US: { symbol: '$', currency: 'USD' },
  GB: { symbol: '\u00a3', currency: 'GBP' },
  CA: { symbol: 'C$', currency: 'CAD' },
  AU: { symbol: 'A$', currency: 'AUD' },
  AE: { symbol: 'AED ', currency: 'AED' },
  SA: { symbol: 'SAR ', currency: 'SAR' },
  IN: { symbol: '\u20b9', currency: 'INR' },
  DE: { symbol: '\u20ac', currency: 'EUR' },
  FR: { symbol: '\u20ac', currency: 'EUR' },
  NL: { symbol: '\u20ac', currency: 'EUR' },
  IT: { symbol: '\u20ac', currency: 'EUR' },
  ES: { symbol: '\u20ac', currency: 'EUR' },
  JP: { symbol: '\u00a5', currency: 'JPY' },
  CN: { symbol: '\u00a5', currency: 'CNY' },
  KR: { symbol: '\u20a9', currency: 'KRW' },
  SG: { symbol: 'S$', currency: 'SGD' },
  MY: { symbol: 'RM', currency: 'MYR' },
  TH: { symbol: '\u0e3f', currency: 'THB' },
  TR: { symbol: '\u20ba', currency: 'TRY' },
  BR: { symbol: 'R$', currency: 'BRL' },
  ZA: { symbol: 'R', currency: 'ZAR' },
  NG: { symbol: '\u20a6', currency: 'NGN' },
  EG: { symbol: 'E\u00a3', currency: 'EGP' },
  BD: { symbol: '\u09f3', currency: 'BDT' },
};

function getCurrencyForCountry(code: string): { symbol: string; currency: string } {
  const upper = code.toUpperCase();
  if (COUNTRY_CURRENCY_MAP[upper]) return COUNTRY_CURRENCY_MAP[upper];
  // Default fallback
  return { symbol: 'Rs', currency: 'PKR' };
}

async function detectCountry(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Geo API failed');
    const data = await res.json();
    return data.country_code || 'PK';
  } catch {
    return 'PK'; // Default to Pakistan
  }
}

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/PKR', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Rates API failed');
    const data = await res.json();
    return data.rates || {};
  } catch {
    // Fallback approximate rates from PKR
    return {
      PKR: 1,
      USD: 0.00357,
      GBP: 0.00282,
      EUR: 0.00328,
      CAD: 0.00493,
      AUD: 0.00548,
      AED: 0.01311,
      SAR: 0.01339,
      INR: 0.299,
      JPY: 0.545,
      CNY: 0.0258,
      KRW: 4.95,
      SGD: 0.00478,
      MYR: 0.0157,
      THB: 0.124,
      TRY: 0.137,
      BRL: 0.0209,
      ZAR: 0.0653,
      NGN: 5.49,
      EGP: 0.174,
      BDT: 0.434,
    };
  }
}

/**
 * Hook that detects the visitor's country and provides a price formatting
 * function that converts PKR/USD base prices to the visitor's local currency.
 */
export function useCurrencyFormatter() {
  const [state, setState] = useState<CurrencyState>({
    countryCode: null,
    symbol: 'Rs',
    rateFromPkr: 1,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Check cache first
      const cachedTs = Number(localStorage.getItem(CACHE_KEY_TS) || '0');
      const now = Date.now();

      if (now - cachedTs < CACHE_TTL) {
        const cachedCountry = localStorage.getItem(CACHE_KEY_COUNTRY);
        const cachedRatesRaw = localStorage.getItem(CACHE_KEY_RATES);
        if (cachedCountry && cachedRatesRaw) {
          try {
            const rates = JSON.parse(cachedRatesRaw) as Record<string, number>;
            const { symbol, currency } = getCurrencyForCountry(cachedCountry);
            const rate = rates[currency] ?? 1;
            if (!cancelled) {
              setState({ countryCode: cachedCountry, symbol, rateFromPkr: rate, loading: false });
            }
            return;
          } catch { /* fall through to re-fetch */ }
        }
      }

      // Fetch fresh data
      const [country, rates] = await Promise.all([detectCountry(), fetchRates()]);

      // Cache results
      try {
        localStorage.setItem(CACHE_KEY_COUNTRY, country);
        localStorage.setItem(CACHE_KEY_RATES, JSON.stringify(rates));
        localStorage.setItem(CACHE_KEY_TS, String(Date.now()));
      } catch { /* storage full or unavailable */ }

      if (cancelled) return;

      const { symbol, currency } = getCurrencyForCountry(country);
      const rate = rates[currency] ?? 1;
      setState({ countryCode: country, symbol, rateFromPkr: rate, loading: false });
    }

    init();
    return () => { cancelled = true; };
  }, []);

  /**
   * Format a course's price for display based on the detected locale.
   * Returns a JSX-ready string with the correct currency symbol.
   * Every course must display a real numeric fee — never "Free" or empty.
   */
  function formatPrice(price: CoursePriceData): string {
    const { symbol, rateFromPkr, countryCode } = state;

    // Determine which base price to convert from
    const isPK = countryCode === 'PK';
    const isUS = countryCode === 'US';

    const formatAmount = (amount: number): string => {
      const converted = amount * rateFromPkr;
      // Round to nearest integer for most currencies, 2 decimals for some
      const rounded = converted >= 1 ? Math.round(converted) : Number(converted.toFixed(2));
      return `${symbol}${rounded.toLocaleString()}`;
    };

    // Handle dual-price courses (YouTube: full course + recorded lectures)
    if (price.secondaryPkr !== undefined && price.secondaryPkr > 0) {
      const primaryAmt = formatAmount(price.pkr);
      const secondaryAmt = formatAmount(price.secondaryPkr);
      const pLabel = price.primaryLabel || '';
      const sLabel = price.secondaryLabel || '';
      return `${pLabel}: ${primaryAmt} | ${sLabel}: ${secondaryAmt}`;
    }

    // If visitor is in PK and we have PKR price → show PKR directly
    if (isPK) {
      return `Rs ${price.pkr.toLocaleString()}`;
    }

    // If visitor is in US and we have a USD price → show USD directly
    if (isUS && price.usd !== undefined) {
      return `$${price.usd.toLocaleString()}`;
    }

    // Otherwise convert from PKR to local currency
    return formatAmount(price.pkr);
  }

  return { formatPrice, loading: state.loading, countryCode: state.countryCode, symbol: state.symbol };
}
