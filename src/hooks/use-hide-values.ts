"use client";

import { useState, useEffect } from "react";

export function useHideValues() {
  const [hideValues, setHideValues] = useState(true); // Default to hidden
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load the preference from localStorage on mount
    const stored = localStorage.getItem('finance-hide-values');
    if (stored !== null) {
      setHideValues(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  const toggleHideValues = () => {
    const newValue = !hideValues;
    setHideValues(newValue);
    localStorage.setItem('finance-hide-values', newValue.toString());
  };

  const formatValue = (value: number | string, prefix: string = '') => {
    if (hideValues) {
      return '••••••';
    }
    
    if (typeof value === 'number') {
      return `${prefix}${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
    
    return `${prefix}${value}`;
  };

  return {
    hideValues,
    toggleHideValues,
    formatValue,
    isLoaded
  };
}
