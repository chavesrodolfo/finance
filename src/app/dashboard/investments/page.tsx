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
import { useHideValues } from "@/hooks/use-hide-values";
import { PieChart } from "@/components/ui/pie-chart";
import { formatCurrency } from "@/lib/utils";

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
  const { rates, loading: ratesLoading, isLive } = useExchangeRates();
  const { hideValues, toggleHideValues, formatValue, isLoaded } = useHideValues();

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

  if (loading || !isLoaded) {
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

        {/* Portfolio Distribution Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart Skeleton */}
              <div className="flex justify-center">
                <div className="relative">
                  <Skeleton className="w-[420px] h-[420px] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="w-[168px] h-[168px] rounded-full bg-background" />
                  </div>
                </div>
              </div>
              
              {/* Account Breakdown Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32 mb-4" />
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Account Cards skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-20" />
          </div>
          
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
            onClick={toggleHideValues}
          >
            {hideValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                  {formatValue(totalInvestments, 'CAD$')}
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
                  {formatValue(projectedAnnualReturn, 'CAD$')}
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
          
          {/* Portfolio Distribution Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Portfolio Distribution</h2>
              <p className="text-sm text-muted-foreground">
                Breakdown of your investment accounts by value
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex justify-center">
                  <PieChart
                    data={accounts
                      .map(account => ({
                        ...account,
                        cadValue: convertToCadWithLiveRates(account.currentValue, account.currency)
                      }))
                      .sort((a, b) => b.cadValue - a.cadValue)
                      .map((account, index) => {
                        const colors = [
                          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
                          '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                          '#f97316', '#6366f1'
                        ];
                        return {
                          name: account.name,
                          value: account.cadValue,
                          color: colors[index % colors.length]
                        };
                      })}
                    size={420}
                  />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-lg mb-4">Account Breakdown</h3>
                  {accounts
                    .map(account => ({
                      ...account,
                      cadValue: convertToCadWithLiveRates(account.currentValue, account.currency)
                    }))
                    .sort((a, b) => b.cadValue - a.cadValue)
                    .map((account, index) => {
                      const percentage = totalInvestments > 0 ? (account.cadValue / totalInvestments) * 100 : 0;
                      const colors = [
                        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
                        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                        '#f97316', '#6366f1'
                      ];
                      return (
                        <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">{account.accountType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatValue(formatCurrency(account.cadValue))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                  showAmounts={!hideValues}
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