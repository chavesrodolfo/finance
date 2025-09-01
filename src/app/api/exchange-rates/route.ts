import { NextResponse } from 'next/server';

// TradingView-style API endpoint for currency pairs
// Using a free API that provides similar data structure
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/CAD';

// Fallback rates in case API fails
const FALLBACK_RATES: { [key: string]: number } = {
  'CAD': 1.0,
  'USD': 0.74,
  'BRL': 4.10,
};

export async function GET() {
  try {
    // Try to fetch live rates
    const response = await fetch(EXCHANGE_API_URL, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match our expected format
    // The API returns rates from CAD to other currencies
    const exchangeRates = {
      'CAD': 1.0,
      'USD': data.rates?.USD || FALLBACK_RATES.USD,
      'BRL': data.rates?.BRL || FALLBACK_RATES.BRL,
    };

    return NextResponse.json({
      success: true,
      rates: exchangeRates,
      lastUpdated: data.date || new Date().toISOString().split('T')[0],
      source: 'live'
    });

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return NextResponse.json({
      success: true,
      rates: FALLBACK_RATES,
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'fallback',
      error: 'Using fallback rates due to API error'
    });
  }
}

// Alternative endpoint using a different free API as backup
export async function fetchAlternativeRates() {
  try {
    // Using Fixer.io-style free API
    const response = await fetch('https://api.fxratesapi.com/latest?base=CAD&symbols=USD,BRL');
    
    if (!response.ok) {
      throw new Error('Alternative API failed');
    }

    const data = await response.json();
    
    return {
      'CAD': 1.0,
      'USD': data.rates?.USD || FALLBACK_RATES.USD,
      'BRL': data.rates?.BRL || FALLBACK_RATES.BRL,
    };
  } catch (error) {
    console.error('Alternative API also failed:', error);
    return FALLBACK_RATES;
  }
}