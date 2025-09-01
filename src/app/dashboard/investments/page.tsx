"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CircleDollarSign, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentAccountForm } from "@/components/investment-account-form";
import { InvestmentAccountCard } from "@/components/investment-account-card";
import { convertToCAD } from "@/lib/currency";
import { useExchangeRates } from "@/hooks/use-exchange-rates";

interface InvestmentAccount {
  id: string;
  name: string;
  accountType: string;
  currentValue: number;
  currency: string;
  monthlyReturnPercent: number;
  annualReturnPercent: number;
  createdAt: string;
  updatedAt: string;
}

export default function InvestmentsPage() {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const { rates, loading: ratesLoading, isLive } = useExchangeRates();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investment-accounts');
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else if (response.status === 401) {
        console.error('Authentication required. Please make sure you are logged in.');
        // The user should be logged in to access the dashboard, but if not, 
        // the page will handle this at a higher level
      } else {
        console.error('Failed to fetch investment accounts. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching investment accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Helper function to convert to CAD using live rates when available
  const convertToCadWithLiveRates = (amount: number, currency: string): number => {
    if (currency === 'CAD' || !rates) {
      return currency === 'CAD' ? amount : convertToCAD(amount, currency);
    }

    const rate = rates[currency];
    if (!rate) {
      return convertToCAD(amount, currency); // Fallback to cached rates
    }

    return amount / rate;
  };

  // Calculate totals (convert all to CAD using live rates)
  const totalInvestments = accounts.reduce((sum, account) => {
    const cadValue = convertToCadWithLiveRates(account.currentValue, account.currency);
    return sum + cadValue;
  }, 0);
  const projectedAnnualReturn = accounts.reduce((sum, account) => {
    const cadValue = convertToCadWithLiveRates(account.currentValue, account.currency);
    return sum + (cadValue * (account.annualReturnPercent / 100));
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <Skeleton className="h-3 w-12 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-3 w-12 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investments</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowAmounts(!showAmounts)}
          >
            {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAmounts ? "Hide Values" : "Show Values"}
          </Button>
          <InvestmentAccountForm onAccountChanged={fetchAccounts} />
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Investment Accounts</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your investment portfolio by adding your accounts.
          </p>
          <InvestmentAccountForm onAccountChanged={fetchAccounts} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Total Value</h3>
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {showAmounts ? `CAD$${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">Across all accounts (converted to CAD)</p>
                  {!ratesLoading && (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {isLive ? 'Live rates' : 'Cached rates'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Projected Annual Return</h3>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-emerald-400">
                  {showAmounts ? `CAD$${projectedAnnualReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Based on current allocation (CAD)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Portfolio Diversification</h3>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                </div>
                <p className="text-3xl font-bold">{accounts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Investment accounts</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Investment Accounts</h2>
              <p className="text-sm text-muted-foreground">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <InvestmentAccountCard
                  key={account.id}
                  account={account}
                  showAmounts={showAmounts}
                  onAccountChanged={fetchAccounts}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}