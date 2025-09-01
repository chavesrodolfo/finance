"use client";

import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rates: { [key: string]: number };
  lastUpdated: string;
  source: 'live' | 'fallback';
  error?: string;
}

export function useExchangeRates() {
  const [data, setData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/exchange-rates');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData({
          rates: result.rates,
          lastUpdated: result.lastUpdated,
          source: result.source,
          error: result.error
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch exchange rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchRates,
    rates: data?.rates || null,
    lastUpdated: data?.lastUpdated || null,
    isLive: data?.source === 'live',
    isFallback: data?.source === 'fallback'
  };
}

// Helper functions that use the hook data
export function useConvertToCAD() {
  const { rates } = useExchangeRates();

  return (amount: number, fromCurrency: string): number => {
    if (!rates || fromCurrency === 'CAD') {
      return amount;
    }

    const rate = rates[fromCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for currency: ${fromCurrency}`);
      return amount;
    }

    return amount / rate;
  };
}