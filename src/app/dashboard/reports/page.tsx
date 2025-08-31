"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface YearlyData {
  year: string;
  amount: number;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseData[]>([]);
  const [expensesByPeriod, setExpensesByPeriod] = useState<MonthlyData[] | YearlyData[]>([]);
  const [categoryByPeriod, setCategoryByPeriod] = useState<{[period: string]: ExpenseData[]}>({});
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        
        // Filter data based on time range
        let now = new Date();
        let filterStartDate: Date;
        
        switch (timeRange) {
          case "monthly":
            // Current year for monthly grouping
            filterStartDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "yearly":
            // Last 5 years for yearly grouping
            filterStartDate = new Date(now.getFullYear() - 4, 0, 1);
            break;
          case "custom":
            // Use custom date range if provided, otherwise default to last 90 days
            if (startDate && endDate) {
              filterStartDate = new Date(startDate);
              now = new Date(endDate);
            } else {
              filterStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            }
            break;
          default:
            filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Filter transactions by date range
        const filteredData = data.filter((t: { date: string }) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= filterStartDate && transactionDate <= now;
        });

        // Process analytics with filtered data
        const expenses = filteredData.filter((t: { type: string }) => t.type === "EXPENSE" || t.type === "EXPENSE_SAVINGS");
        const total = expenses.reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);
        
        if (timeRange === "monthly") {
          // Group by month and category
          const monthlyMap: { [key: string]: number } = {};
          const categoryByMonthMap: { [month: string]: { [category: string]: number } } = {};
          
          expenses.forEach((t: { amount: number; date: string; category?: { name: string } }) => {
            const date = new Date(t.date);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const cat = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by month
            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount;
            
            // Category by month
            if (!categoryByMonthMap[monthKey]) categoryByMonthMap[monthKey] = {};
            categoryByMonthMap[monthKey][cat] = (categoryByMonthMap[monthKey][cat] || 0) + amount;
          });
          
          const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
          monthlyData.sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
          setExpensesByPeriod(monthlyData);
          
          // Convert to category distribution by period
          const categoryByPeriodData: {[period: string]: ExpenseData[]} = {};
          Object.entries(categoryByMonthMap).forEach(([month, categories]) => {
            const monthTotal = monthlyMap[month];
            categoryByPeriodData[month] = Object.entries(categories).map(([category, amount]) => ({
              category,
              amount,
              percentage: monthTotal ? (amount / monthTotal) * 100 : 0
            })).sort((a, b) => b.amount - a.amount);
          });
          setCategoryByPeriod(categoryByPeriodData);
          
          // Overall category totals for reference
          const categoryMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; category?: { name: string } }) => {
            const cat = t.category?.name || "Uncategorized";
            categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
          });
          const categories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total ? (amount / total) * 100 : 0
          }));
          categories.sort((a, b) => b.amount - a.amount);
          setExpensesByCategory(categories);
          
        } else if (timeRange === "yearly") {
          // Group by year and category
          const yearlyMap: { [key: string]: number } = {};
          const categoryByYearMap: { [year: string]: { [category: string]: number } } = {};
          
          expenses.forEach((t: { amount: number; date: string; category?: { name: string } }) => {
            const date = new Date(t.date);
            const year = date.getFullYear().toString();
            const cat = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by year
            yearlyMap[year] = (yearlyMap[year] || 0) + amount;
            
            // Category by year
            if (!categoryByYearMap[year]) categoryByYearMap[year] = {};
            categoryByYearMap[year][cat] = (categoryByYearMap[year][cat] || 0) + amount;
          });
          
          const yearlyData = Object.entries(yearlyMap).map(([year, amount]) => ({ year, amount }));
          yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
          setExpensesByPeriod(yearlyData);
          
          // Convert to category distribution by period
          const categoryByPeriodData: {[period: string]: ExpenseData[]} = {};
          Object.entries(categoryByYearMap).forEach(([year, categories]) => {
            const yearTotal = yearlyMap[year];
            categoryByPeriodData[year] = Object.entries(categories).map(([category, amount]) => ({
              category,
              amount,
              percentage: yearTotal ? (amount / yearTotal) * 100 : 0
            })).sort((a, b) => b.amount - a.amount);
          });
          setCategoryByPeriod(categoryByPeriodData);
          
          // Overall category totals for reference
          const categoryMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; category?: { name: string } }) => {
            const cat = t.category?.name || "Uncategorized";
            categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
          });
          const categories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total ? (amount / total) * 100 : 0
          }));
          categories.sort((a, b) => b.amount - a.amount);
          setExpensesByCategory(categories);
          
        } else {
          // For custom range, use overall category data
          const categoryMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; category?: { name: string } }) => {
            const cat = t.category?.name || "Uncategorized";
            categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
          });
          const categories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total ? (amount / total) * 100 : 0
          }));
          categories.sort((a, b) => b.amount - a.amount);
          setExpensesByCategory(categories);
          setExpensesByPeriod([]);
          setCategoryByPeriod({});
        }

      } catch (err: unknown) {
        setError((err as Error).message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [timeRange, startDate, endDate]); // Add custom date dependencies

  // Calculate the total amount and max for charts
  const totalAmount = timeRange === 'custom' 
    ? (expensesByCategory || []).reduce((sum, item) => sum + (item?.amount || 0), 0)
    : (expensesByPeriod || []).reduce((sum, item) => sum + (item?.amount || 0), 0);
    
  const maxAmount = timeRange === 'custom'
    ? ((expensesByCategory || []).length > 0 ? Math.max(...(expensesByCategory || []).map(c => c?.amount || 0), 1) : 4000)
    : ((expensesByPeriod || []).length > 0 ? Math.max(...(expensesByPeriod || []).map(p => p?.amount || 0), 1) : 4000);

  // Calculate average for periods
  const averageAmount = (expensesByPeriod || []).length > 0 
    ? (expensesByPeriod || []).reduce((sum, item) => sum + (item?.amount || 0), 0) / (expensesByPeriod || []).length 
    : 0;

  // Debug logging
  console.log('Time range:', timeRange);
  console.log('Expenses by category:', expensesByCategory);
  console.log('Expenses by period:', expensesByPeriod);
  console.log('Max amount:', maxAmount);
  console.log('Total amount:', totalAmount);

  const hasData = (expensesByCategory || []).length > 0 || (expensesByPeriod || []).length > 0;

  const togglePeriodExpansion = (period: string) => {
    const newExpandedPeriods = new Set(expandedPeriods);
    if (newExpandedPeriods.has(period)) {
      newExpandedPeriods.delete(period);
    } else {
      newExpandedPeriods.add(period);
    }
    setExpandedPeriods(newExpandedPeriods);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {loading ? (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-18" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="md:col-span-2 bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full relative">
                  <div className="h-full w-full flex">
                    <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2" style={{ height: "320px", paddingBottom: "64px" }}>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="flex-1 relative">
                      <div className="flex items-end relative" style={{ height: "320px", justifyContent: "space-around" }}>
                        <div className="absolute bottom-16 left-0 right-0 h-px bg-border"></div>
                        {[...Array(8)].map((_, i) => {
                          // Deterministic heights for each bar to avoid hydration mismatch
                          const heights = [180, 120, 200, 90, 160, 140, 220, 100];
                          return (
                            <div key={i} className="flex flex-col items-center" style={{ height: "320px", justifyContent: "flex-end" }}>
                              <Skeleton className="h-4 w-16 mb-1" />
                              <Skeleton className="w-9 mb-2" style={{ height: `${heights[i]}px` }} />
                              <div className="h-16 flex flex-col items-center justify-start shrink-0">
                                <Skeleton className="h-3 w-12 mt-2" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Stats skeleton */}
                <div className="grid grid-cols-4 gap-4 border-t border-border">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      
                      <Skeleton className="h-3 w-full rounded-full mb-3" />
                      
                      <div className="space-y-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-2 h-2 rounded-full" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-12" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2 text-red-500">Error Loading Reports</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : !hasData ? (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={timeRange === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={timeRange === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("yearly")}
              >
                Yearly
              </Button>
              <Button
                variant={timeRange === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("custom")}
              >
                Custom
              </Button>
            </div>
            
            {/* Custom Date Range Fields */}
            {timeRange === "custom" && (
              <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center py-12">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              No transactions found for the selected time period. Try adjusting the date range above or add some transactions.
            </p>
            <Button variant="outline">Add Transactions</Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={timeRange === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={timeRange === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("yearly")}
              >
                Yearly
              </Button>
              <Button
                variant={timeRange === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("custom")}
              >
                Custom
              </Button>
            </div>
            
            {/* Custom Date Range Fields */}
            {timeRange === "custom" && (
              <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="md:col-span-2 bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle>
                  {timeRange === 'monthly' ? 'Expenses by Month' : 
                   timeRange === 'yearly' ? 'Expenses by Year' : 
                   'Expenses by Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full relative">
                  <div className="h-full w-full flex">
                    <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2" style={{ height: "320px", paddingBottom: "64px" }}>
                      <span>{formatCurrency(maxAmount)}</span>
                      <span>{formatCurrency(maxAmount * 0.75)}</span>
                      <span>{formatCurrency(maxAmount * 0.5)}</span>
                      <span>{formatCurrency(maxAmount * 0.25)}</span>
                      <span>0</span>
                    </div>
                    <div className="flex-1 relative">
                      {/* Show toggle for categories when there are many */}
                      {timeRange === 'custom' && (expensesByCategory || []).length > 10 && (
                        <div className="absolute top-0 right-0 z-20">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowAllCategories(!showAllCategories)}
                          >
                            {showAllCategories ? "Show Top 10" : `Show All ${(expensesByCategory || []).length}`}
                          </Button>
                        </div>
                      )}
                      
                      <div className={`${
                        timeRange === 'custom' && (expensesByCategory || []).length > 10 && showAllCategories 
                          ? "overflow-x-auto" 
                          : ""
                      }`}>
                        <div 
                          className="flex items-end relative" 
                          style={{ 
                            height: "320px",
                            width: timeRange === 'custom' && (expensesByCategory || []).length > 10 && showAllCategories 
                              ? `${Math.max((expensesByCategory || []).length * 60, 800)}px` 
                              : "100%",
                            justifyContent: timeRange === 'custom' && (expensesByCategory || []).length > 10 && showAllCategories 
                              ? "flex-start" 
                              : "space-around"
                          }}
                        >
                          <div className="absolute bottom-16 left-0 right-0 h-px bg-border"></div>
                          {(timeRange === 'custom' 
                            ? (showAllCategories ? (expensesByCategory || []) : (expensesByCategory || []).slice(0, 10))
                            : (expensesByPeriod || [])
                          ).map((item, index) => {
                            const availableHeight = 320 - 64; // 320px container - 64px for labels
                            const barHeight = Math.max(((item?.amount || 0) / maxAmount) * availableHeight, 4);
                            const label = timeRange === 'custom' ? ((item as ExpenseData).category || 'Unknown') : 
                                         timeRange === 'monthly' ? ((item as MonthlyData).month || 'Unknown') : 
                                         ((item as YearlyData).year || 'Unknown');
                            const color = "rgb(139, 92, 246)"; // Violet color for all bars
                            
                            return (
                              <div 
                                key={index} 
                                className="flex flex-col items-center"
                                style={{
                                  margin: timeRange === 'custom' && (expensesByCategory || []).length > 10 && showAllCategories 
                                    ? "0 8px" 
                                    : "0",
                                  height: "320px",
                                  justifyContent: "flex-end"
                                }}
                              >
                                <div className="flex flex-col items-center" style={{ marginBottom: "2px" }}>
                                  <span className="text-xs font-medium text-foreground">
                                    {formatCurrency(item?.amount || 0)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    height: `${barHeight}px`,
                                    backgroundColor: color,
                                    width: "36px",
                                    borderRadius: "3px 3px 0 0",
                                    minHeight: "4px",
                                    border: "2px solid hsl(var(--border))",
                                    position: "relative",
                                    zIndex: 10,
                                    boxShadow: "0 0 4px hsl(var(--ring) / 0.3)"
                                  }}
                                ></div>
                                <div className="h-16 flex flex-col items-center justify-start shrink-0">
                                  <span 
                                    className="text-xs mt-2 text-muted-foreground"
                                    style={{
                                      transform: (label && label.length > 8) ? "rotate(45deg) translateX(12px)" : "none",
                                      transformOrigin: "top left",
                                      whiteSpace: "nowrap",
                                      maxWidth: "80px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Stats at bottom */}
                <div className="grid grid-cols-4 gap-4 border-t border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Total Expenses</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  {timeRange !== 'custom' && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        Average per {timeRange === 'monthly' ? 'Month' : 'Year'}
                      </span>
                      <span className="text-xl font-bold">{formatCurrency(averageAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {timeRange === 'monthly' ? 'Top Month' : 
                       timeRange === 'yearly' ? 'Top Year' : 'Top Category'}
                    </span>
                    <span className="text-lg font-bold">
                      {timeRange === 'custom' 
                        ? (expensesByCategory || [])[0]?.category || "N/A"
                        : timeRange === 'monthly' 
                          ? ((expensesByPeriod || [])[0] as MonthlyData)?.month || "N/A"
                          : ((expensesByPeriod || [])[0] as YearlyData)?.year || "N/A"
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {timeRange === 'monthly' ? 'Months' : 
                       timeRange === 'yearly' ? 'Years' : 'Categories'}
                    </span>
                    <span className="text-xl font-bold">
                      {timeRange === 'custom' ? (expensesByCategory || []).length : (expensesByPeriod || []).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {timeRange === 'custom' ? (
                  // For custom range, show overall category breakdown
                  (expensesByCategory || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No category data available.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Overall Distribution</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Visual breakdown showing how your expenses are distributed across different categories for the selected period.
                        </p>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-4">
                          {(expensesByCategory || []).map((item, index) => {
                            const percentage = totalAmount > 0 ? ((item?.amount || 0) / totalAmount) * 100 : 0;
                            const colors = [
                              "bg-blue-500", "bg-red-500", "bg-green-500", 
                              "bg-yellow-500", "bg-purple-500", "bg-pink-500",
                              "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
                            ];
                            return (
                              <div
                                key={item?.category || 'unknown'}
                                className={`h-full ${colors[index % colors.length]} inline-block`}
                                style={{ width: `${percentage}%` }}
                              />
                            );
                          })}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {(expensesByCategory || []).slice(0, 8).map((item, index) => (
                            <div key={item.category} className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-blue-500" :
                                  index === 1 ? "bg-red-500" :
                                  index === 2 ? "bg-green-500" :
                                  index === 3 ? "bg-yellow-500" :
                                  index === 4 ? "bg-purple-500" :
                                  index === 5 ? "bg-pink-500" :
                                  index === 6 ? "bg-indigo-500" :
                                  "bg-teal-500"
                                }`} 
                              />
                              <span className="text-xs flex-1">{item?.category || 'Unknown'}</span>
                              <span className="text-xs font-medium">{formatCurrency(item?.amount || 0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between">
                          <span className="font-medium">Total</span>
                          <span className="font-bold">{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  // For monthly/yearly, show period-specific breakdowns
                  Object.keys(categoryByPeriod || {}).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No category data available.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {Object.entries(categoryByPeriod || {}).map(([period, categories]) => {
                        const safeCategories = categories || [];
                        const periodTotal = safeCategories.reduce((sum, cat) => sum + (cat?.amount || 0), 0);
                        return (
                          <div key={period} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium">{period}</h4>
                              <span className="text-sm font-bold">{formatCurrency(periodTotal)}</span>
                            </div>
                            
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-3">
                              {safeCategories.map((item, index) => {
                                const percentage = periodTotal > 0 ? ((item?.amount || 0) / periodTotal) * 100 : 0;
                                const colors = [
                                  "bg-blue-500", "bg-red-500", "bg-green-500", 
                                  "bg-yellow-500", "bg-purple-500", "bg-pink-500",
                                  "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
                                ];
                                return (
                                  <div
                                    key={item?.category || 'unknown'}
                                    className={`h-full ${colors[index % colors.length]} inline-block`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                );
                              })}
                            </div>
                            
                            <div className="space-y-1">
                              {(expandedPeriods.has(period) ? safeCategories : safeCategories.slice(0, 5)).map((item, index) => (
                                <div key={item.category} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className={`w-2 h-2 rounded-full ${
                                        index === 0 ? "bg-blue-500" :
                                        index === 1 ? "bg-red-500" :
                                        index === 2 ? "bg-green-500" :
                                        index === 3 ? "bg-yellow-500" :
                                        index === 4 ? "bg-purple-500" :
                                        index === 5 ? "bg-pink-500" :
                                        index === 6 ? "bg-indigo-500" :
                                        index === 7 ? "bg-teal-500" :
                                        "bg-orange-500"
                                      }`} 
                                    />
                                    <span className="text-xs">{item?.category || 'Unknown'}</span>
                                  </div>
                                  <span className="text-xs font-medium">{formatCurrency(item?.amount || 0)}</span>
                                </div>
                              ))}
                              {safeCategories.length > 5 && (
                                <button 
                                  onClick={() => togglePeriodExpansion(period)}
                                  className="text-xs text-blue-500 hover:text-blue-700 text-center pt-1 w-full cursor-pointer"
                                >
                                  {expandedPeriods.has(period) 
                                    ? "Show less" 
                                    : `+${safeCategories.length - 5} more categories`
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}
    </div>
  );
} 