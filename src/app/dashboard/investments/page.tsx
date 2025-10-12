"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CircleDollarSign, Eye, EyeOff, Edit, Trash2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentAccountForm } from "@/components/investment-account-form";
import { InvestmentAccountCard } from "@/components/investment-account-card";
import { convertToCAD } from "@/lib/currency";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { useHideValues } from "@/hooks/use-hide-values";
import { PieChart } from "@/components/ui/pie-chart";
import { formatCurrency } from "@/lib/utils";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";
import { AssetAllocationForm } from "@/components/asset-allocation-form";
import { RebalanceDialog } from "@/components/rebalance-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface AssetAllocation {
  id: string;
  assetName: string;
  idealAllocationPercent: number;
  currentAllocationAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function InvestmentsPage() {
  const { apiFetch, currentAccountId } = useAccountAwareApi();
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [assetAllocations, setAssetAllocations] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { rates, loading: ratesLoading, isLive } = useExchangeRates();
  const { hideValues, toggleHideValues, formatValue, isLoaded } = useHideValues();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState<AssetAllocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/investment-accounts');

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
  }, [apiFetch]);

  const fetchAssetAllocations = useCallback(async () => {
    try {
      const response = await apiFetch('/api/asset-allocations');

      if (response.ok) {
        const data = await response.json();
        setAssetAllocations(data);
      } else {
        console.error('Failed to fetch asset allocations. Status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching asset allocations:', error);
    }
  }, [apiFetch]);

  // Fetch data on mount and when account context changes
  // Using currentAccountId instead of callbacks in dependencies to prevent infinite loops
  useEffect(() => {
    fetchAccounts();
    fetchAssetAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountId]);

  const handleDeleteAllocation = async () => {
    if (!allocationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await apiFetch(`/api/asset-allocations/${allocationToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset allocation");
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Asset allocation deleted successfully!",
      });

      fetchAssetAllocations();
    } catch (error) {
      console.error("Error deleting asset allocation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete asset allocation",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAllocationToDelete(null);
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
                  <Skeleton className={`${isMobile ? 'w-[280px] h-[280px]' : 'w-[420px] h-[420px]'} rounded-full`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className={`${isMobile ? 'w-[112px] h-[112px]' : 'w-[168px] h-[168px]'} rounded-full bg-background`} />
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

        {/* Asset Distribution Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Total Summary Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className={i === 0 ? "border-primary/20 bg-primary/5" : "border-emerald-500/20 bg-emerald-500/5"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                          </div>
                          <Skeleton className="h-8 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Charts Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, chartIndex) => (
                  <div key={chartIndex}>
                    <Skeleton className="h-6 w-32 mx-auto mb-4" />
                    {/* Pie Chart Skeleton */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Skeleton className={`${isMobile ? 'w-[280px] h-[280px]' : 'w-[420px] h-[420px]'} rounded-full`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Skeleton className={`${isMobile ? 'w-[112px] h-[112px]' : 'w-[168px] h-[168px]'} rounded-full bg-background`} />
                        </div>
                      </div>
                    </div>
                    {/* Legend Skeleton */}
                    <div className="space-y-3">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/30 space-y-2 min-h-[88px]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <Skeleton className="w-3 h-3 rounded-full" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <Skeleton className="h-4 w-20 inline-block" />
                                <Skeleton className="h-3 w-12 inline-block ml-1" />
                              </div>
                              <div className="flex gap-1">
                                <Skeleton className="h-6 w-6 rounded" />
                                <Skeleton className="h-6 w-6 rounded" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                          {chartIndex === 1 && (
                            <Skeleton className="h-3 w-32 mx-auto" />
                          )}
                        </div>
                      ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Assets Diversification</h3>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                </div>
                <p className="text-3xl font-bold">{assetAllocations.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Asset classes tracked</p>
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
                    size={isMobile ? 280 : 420}
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

          {/* Asset Distribution Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Asset Distribution</h2>
                  <p className="text-sm text-muted-foreground">
                    Track your ideal vs current asset allocation
                  </p>
                </div>
                <div className="flex gap-2">
                  {assetAllocations.length > 0 && (
                    <RebalanceDialog
                      allocations={assetAllocations}
                      totalInvestments={totalInvestments}
                    />
                  )}
                  <AssetAllocationForm
                    onAllocationChanged={fetchAssetAllocations}
                    allAllocations={assetAllocations}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assetAllocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Asset Allocations</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your asset allocation by adding assets.
                  </p>
                  <AssetAllocationForm
                  onAllocationChanged={fetchAssetAllocations}
                  allAllocations={assetAllocations}
                />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Total Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-muted-foreground">Total Ideal Allocation</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs">
                                      Sum of all ideal allocations. Calculated as: (Ideal % × Total Investments) for each asset.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-2xl font-bold">
                              {formatValue(assetAllocations.reduce((sum, a) => sum + ((a.idealAllocationPercent / 100) * totalInvestments), 0), '$')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {assetAllocations.reduce((sum, a) => sum + a.idealAllocationPercent, 0).toFixed(1)}% of portfolio
                            </p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-muted-foreground">Total Current Allocation</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs">
                                      Sum of all current allocation amounts across your assets. This represents the actual dollar amounts you currently hold.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-2xl font-bold">
                              {formatValue(assetAllocations.reduce((sum, a) => sum + a.currentAllocationAmount, 0), '$')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {((assetAllocations.reduce((sum, a) => sum + a.currentAllocationAmount, 0) / totalInvestments) * 100).toFixed(1)}% of portfolio
                            </p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CircleDollarSign className="h-6 w-6 text-emerald-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Comparison Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ideal Allocation Pie Chart */}
                    <div>
                      <h3 className="font-medium text-center mb-4">Ideal Allocation</h3>
                      <div className="flex justify-center mb-4">
                        <PieChart
                          data={assetAllocations.map((allocation, index) => {
                            const colors = [
                              '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                              '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                              '#f97316', '#6366f1'
                            ];
                            return {
                              name: allocation.assetName,
                              value: (allocation.idealAllocationPercent / 100) * totalInvestments,
                              color: colors[index % colors.length]
                            };
                          })}
                          size={isMobile ? 280 : 420}
                        />
                      </div>
                      {/* Legend */}
                      <div className="space-y-3">
                        {assetAllocations.map((allocation, index) => {
                          const colors = [
                            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                            '#f97316', '#6366f1'
                          ];
                          const idealAmount = (allocation.idealAllocationPercent / 100) * totalInvestments;
                          return (
                            <div key={allocation.id} className="group p-3 rounded-lg bg-muted/30 space-y-2 min-h-[88px] flex flex-col">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                  <span className="text-sm font-semibold truncate">{allocation.assetName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <span className="text-sm font-semibold">
                                      {formatValue(idealAmount, '$')}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({allocation.idealAllocationPercent.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AssetAllocationForm
                                      allocation={allocation}
                                      onAllocationChanged={fetchAssetAllocations}
                                      allAllocations={assetAllocations}
                                      trigger={
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        setAllocationToDelete(allocation);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full rounded-full"
                                  style={{
                                    backgroundColor: colors[index % colors.length],
                                    width: `${Math.min(allocation.idealAllocationPercent, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Allocation Pie Chart */}
                    <div>
                      <h3 className="font-medium text-center mb-4">Current Allocation</h3>
                      <div className="flex justify-center mb-4">
                        <PieChart
                          data={assetAllocations.map((allocation, index) => {
                            const colors = [
                              '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                              '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                              '#f97316', '#6366f1'
                            ];
                            return {
                              name: allocation.assetName,
                              value: allocation.currentAllocationAmount,
                              color: colors[index % colors.length]
                            };
                          })}
                          size={isMobile ? 280 : 420}
                        />
                      </div>
                      {/* Legend */}
                      <div className="space-y-3">
                        {assetAllocations.map((allocation, index) => {
                          const colors = [
                            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
                            '#f97316', '#6366f1'
                          ];
                          const currentPercent = totalInvestments > 0 ? (allocation.currentAllocationAmount / totalInvestments) * 100 : 0;
                          const difference = currentPercent - allocation.idealAllocationPercent;
                          const isOverAllocated = difference > 0.01;
                          const isUnderAllocated = difference < -0.01;

                          return (
                            <div key={allocation.id} className="group p-3 rounded-lg bg-muted/30 space-y-2 min-h-[88px] flex flex-col">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                  <span className="text-sm font-semibold truncate">{allocation.assetName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <span className="text-sm font-semibold">
                                      {formatValue(allocation.currentAllocationAmount, '$')}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({currentPercent.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AssetAllocationForm
                                      allocation={allocation}
                                      onAllocationChanged={fetchAssetAllocations}
                                      allAllocations={assetAllocations}
                                      trigger={
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        setAllocationToDelete(allocation);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full rounded-full"
                                  style={{
                                    backgroundColor: isOverAllocated ? '#f97316' : isUnderAllocated ? colors[index % colors.length] : '#10b981',
                                    width: `${Math.min(currentPercent, 100)}%`
                                  }}
                                />
                              </div>
                              {(isOverAllocated || isUnderAllocated) && (
                                <div className={`text-xs text-center ${
                                  isOverAllocated
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-blue-400"
                                }`}>
                                  {isOverAllocated ? "Over" : "Under"} allocated by {Math.abs(difference).toFixed(2)}%
                                </div>
                              )}
                              {!isOverAllocated && !isUnderAllocated && (
                                <div className="text-xs text-center text-green-600 dark:text-green-400">
                                  Perfectly allocated
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset Allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{allocationToDelete?.assetName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllocation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}