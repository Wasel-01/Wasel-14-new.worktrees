/**
 * Multi-Currency Support Utility
 * 
 * Currency conversion, formatting, and multi-currency handling.
 */

export type SupportedCurrency = 'AED' | 'SAR' | 'EGP' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
    decimals: 2,
  },
  EGP: {
    code: 'EGP',
    symbol: 'ج.م',
    name: 'Egyptian Pound',
    locale: 'ar-EG',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
  },
};

// Exchange rates (base: USD)
// In production, fetch from API (e.g., exchangerate-api.com)
export const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  AED: 3.67,
  SAR: 3.75,
  EGP: 30.90,
  EUR: 0.92,
  GBP: 0.79,
};

export class CurrencyService {
  private static instance: CurrencyService;
  private currentCurrency: SupportedCurrency = 'AED';

  private constructor() {
    // Load from localStorage
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && saved in CURRENCIES) {
      this.currentCurrency = saved as SupportedCurrency;
    } else {
      // Detect from location/browser
      this.detectCurrency();
    }
  }

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private detectCurrency(): void {
    // Try to detect currency from browser locale
    const locale = navigator.language;
    
    if (locale.includes('ae')) this.currentCurrency = 'AED';
    else if (locale.includes('sa')) this.currentCurrency = 'SAR';
    else if (locale.includes('eg')) this.currentCurrency = 'EGP';
    else if (locale.includes('us')) this.currentCurrency = 'USD';
    else if (locale.includes('gb')) this.currentCurrency = 'GBP';
    else if (locale.includes('eu') || locale.includes('de') || locale.includes('fr')) {
      this.currentCurrency = 'EUR';
    }
  }

  getCurrency(): SupportedCurrency {
    return this.currentCurrency;
  }

  setCurrency(currency: SupportedCurrency): void {
    this.currentCurrency = currency;
    localStorage.setItem('preferredCurrency', currency);
  }

  getCurrencyConfig(): CurrencyConfig {
    return CURRENCIES[this.currentCurrency];
  }

  /**
   * Convert amount from one currency to another
   */
  convert(
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ): number {
    if (from === to) return amount;

    // Convert to USD first, then to target currency
    const inUSD = amount / EXCHANGE_RATES[from];
    const inTarget = inUSD * EXCHANGE_RATES[to];

    return Math.round(inTarget * 100) / 100;
  }

  /**
   * Format amount in current currency
   */
  format(amount: number, currency?: SupportedCurrency): string {
    const curr = currency || this.currentCurrency;
    const config = CURRENCIES[curr];

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  }

  /**
   * Format amount with symbol
   */
  formatWithSymbol(amount: number, currency?: SupportedCurrency): string {
    const curr = currency || this.currentCurrency;
    const config = CURRENCIES[curr];

    return `${config.symbol} ${amount.toFixed(config.decimals)}`;
  }

  /**
   * Get symbol for currency
   */
  getSymbol(currency?: SupportedCurrency): string {
    const curr = currency || this.currentCurrency;
    return CURRENCIES[curr].symbol;
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES);
  }
}

// Hook for React components
export function useCurrency() {
  const currencyService = CurrencyService.getInstance();

  return {
    currency: currencyService.getCurrency(),
    setCurrency: (curr: SupportedCurrency) => currencyService.setCurrency(curr),
    config: currencyService.getCurrencyConfig(),
    format: (amount: number, curr?: SupportedCurrency) => currencyService.format(amount, curr),
    formatWithSymbol: (amount: number, curr?: SupportedCurrency) => 
      currencyService.formatWithSymbol(amount, curr),
    convert: (amount: number, from: SupportedCurrency, to: SupportedCurrency) =>
      currencyService.convert(amount, from, to),
    symbol: currencyService.getSymbol(),
    availableCurrencies: currencyService.getAvailableCurrencies(),
  };
}
