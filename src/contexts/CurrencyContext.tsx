import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'XCD' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'TTD' | 'BBD';

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  name: string;
  /**
   * Placeholder static FX rates relative to 1 USD.
   * NOTE: These are reference rates only — replace with a live FX provider
   * (e.g. exchangerate.host, openexchangerates.org) before relying on
   * displayed conversions for transactional pricing.
   */
  rateFromUSD: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',                rateFromUSD: 1.00 },
  { code: 'XCD', symbol: 'EC$',  name: 'Eastern Caribbean Dollar', rateFromUSD: 2.70 },
  { code: 'GBP', symbol: '£',    name: 'British Pound',            rateFromUSD: 0.79 },
  { code: 'EUR', symbol: '€',    name: 'Euro',                     rateFromUSD: 0.92 },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar',          rateFromUSD: 1.36 },
  { code: 'TTD', symbol: 'TT$',  name: 'Trinidad & Tobago Dollar', rateFromUSD: 6.78 },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbados Dollar',          rateFromUSD: 2.00 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (usdAmount: number) => string;
  formatRange: (min: number, max?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const STORAGE_KEY = 'gem-currency';

const isValidCurrency = (v: string | null): v is Currency =>
  !!v && CURRENCIES.some((c) => c.code === v);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') return 'USD';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isValidCurrency(saved) ? saved : 'USD';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { window.localStorage.setItem(STORAGE_KEY, c); } catch {}
  };

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, currency); } catch {}
  }, [currency]);

  const format = (usdAmount: number): string => {
    const meta = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
    const converted = Math.round(usdAmount * meta.rateFromUSD);
    return `${meta.symbol}${converted.toLocaleString('en-US')}`;
  };

  const formatRange = (min: number, max?: number): string => {
    if (max) return `${format(min)} – ${format(max)}`;
    return `from ${format(min)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, formatRange }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
};
