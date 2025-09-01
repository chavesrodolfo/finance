// Currency conversion utility with live exchange rates

// Fallback rates in case API fails
const FALLBACK_RATES: { [key: string]: number } = {
  'CAD': 1.0,    // Base currency
  'USD': 0.74,   // 1 CAD = 0.74 USD (so 1 USD = 1.35 CAD)
  'BRL': 4.10,   // 1 CAD = 4.10 BRL (so 1 BRL = 0.24 CAD)
};

// Cache for exchange rates
let cachedRates: { [key: string]: number } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch live exchange rates from our API
 */
async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  try {
    const response = await fetch('/api/exchange-rates');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.rates) {
      return data.rates;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback:', error);
    return FALLBACK_RATES;
  }
}

/**
 * Get exchange rates (cached or fresh)
 */
async function getExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }
  
  // Fetch fresh rates
  try {
    const rates = await fetchExchangeRates();
    cachedRates = rates;
    lastFetchTime = now;
    return rates;
  } catch {
    // If we have cached rates, use them even if expired
    if (cachedRates) {
      console.warn('Using expired cached rates due to fetch error');
      return cachedRates;
    }
    
    // Last resort: use fallback rates
    console.warn('Using fallback rates due to complete failure');
    return FALLBACK_RATES;
  }
}

// Export current exchange rates for immediate use (synchronous)
export let EXCHANGE_RATES = FALLBACK_RATES;

// Update rates immediately when module loads (client-side)
if (typeof window !== 'undefined') {
  getExchangeRates().then(rates => {
    EXCHANGE_RATES = rates;
  }).catch(() => {
    // Keep using fallback rates
  });
}

/**
 * Convert from any currency to CAD (synchronous - uses cached rates)
 * @param amount Amount in the source currency
 * @param fromCurrency Source currency code
 * @returns Amount in CAD
 */
export function convertToCAD(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'CAD') {
    return amount;
  }
  
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${fromCurrency}`);
    return amount; // Fallback: return original amount
  }
  
  // Convert to CAD: divide by the rate (since rate is CAD->currency)
  return amount / rate;
}

/**
 * Convert from any currency to CAD (async - fetches fresh rates if needed)
 * @param amount Amount in the source currency
 * @param fromCurrency Source currency code
 * @returns Amount in CAD
 */
export async function convertToCADAsync(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === 'CAD') {
    return amount;
  }
  
  const rates = await getExchangeRates();
  const rate = rates[fromCurrency];
  
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${fromCurrency}`);
    return amount; // Fallback: return original amount
  }
  
  // Convert to CAD: divide by the rate (since rate is CAD->currency)
  return amount / rate;
}

/**
 * Convert from CAD to any currency
 * @param cadAmount Amount in CAD
 * @param toCurrency Target currency code
 * @returns Amount in target currency
 */
export function convertFromCAD(cadAmount: number, toCurrency: string): number {
  if (toCurrency === 'CAD') {
    return cadAmount;
  }
  
  const rate = EXCHANGE_RATES[toCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${toCurrency}`);
    return cadAmount; // Fallback: return CAD amount
  }
  
  // Convert from CAD: multiply by the rate
  return cadAmount * rate;
}

/**
 * Convert between any two currencies
 * @param amount Amount in source currency
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @returns Amount in target currency
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to CAD first, then to target currency
  const cadAmount = convertToCAD(amount, fromCurrency);
  return convertFromCAD(cadAmount, toCurrency);
}

/**
 * Format currency with proper symbol and locale
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: { [key: string]: string } = {
    'CAD': 'CAD$',
    'USD': 'USD$',
    'BRL': 'R$',
  };
  
  const symbol = symbols[currency] || `${currency}$`;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}