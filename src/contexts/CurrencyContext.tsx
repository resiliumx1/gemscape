import { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'USD' | 'XCD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (usdAmount: number) => string;
  formatRange: (min: number, max?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const XCD_RATE = 2.70;

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const format = (usdAmount: number): string => {
    if (currency === 'XCD') {
      const xcd = Math.round(usdAmount * XCD_RATE);
      return `EC$${xcd.toLocaleString('en-US')}`;
    }
    return `$${usdAmount.toLocaleString('en-US')}`;
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
