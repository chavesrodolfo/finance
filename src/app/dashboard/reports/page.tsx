"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsSkeleton } from "@/components/dashboard/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";
import { useAccountContext } from "@/hooks/useAccountContext";

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

interface TransactionData {
  id: string;
  date: string;
  amount: number;
  description: string;
  notes?: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface RawTransactionData {
  id: string;
  date: string;
  amount: number;
  description?: string;
  notes?: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const { apiFetch } = useAccountAwareApi();
  const { currentAccount } = useAccountContext();
  const [activeTab, setActiveTab] = useState("expenses");
  const [timeRange, setTimeRange] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDescriptions, setSelectedDescriptions] = useState<string[]>([]);
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [pendingDescriptions, setPendingDescriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseData[]>([]);
  const [expensesByPeriod, setExpensesByPeriod] = useState<MonthlyData[] | YearlyData[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<ExpenseData[]>([]);
  const [incomeByPeriod, setIncomeByPeriod] = useState<MonthlyData[] | YearlyData[]>([]);
  const [categoryByPeriod, setCategoryByPeriod] = useState<{[period: string]: ExpenseData[]}>({});
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allDescriptions, setAllDescriptions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [filteredExpenseTransactions, setFilteredExpenseTransactions] = useState<TransactionData[]>([]);
  const [filteredIncomeTransactions, setFilteredIncomeTransactions] = useState<TransactionData[]>([]);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  
  // Multi-select dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [descriptionDropdownOpen, setDescriptionDropdownOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
        
        // Extract available years, categories, and descriptions from all transaction data
        const yearsSet = new Set<number>();
        const categoriesSet = new Set<string>();
        const descriptionsSet = new Set<string>();
        
        data.forEach((t: { date: string; category?: { name: string }; description: string }) => {
          const year = new Date(t.date).getFullYear();
          yearsSet.add(year);
          
          const categoryName = t.category?.name || "Uncategorized";
          const description = t.description || "No Description";
          categoriesSet.add(categoryName);
          descriptionsSet.add(description);
        });
        
        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // Most recent first
        const sortedCategories = Array.from(categoriesSet).sort();
        const sortedDescriptions = Array.from(descriptionsSet).sort();
        
        setAvailableYears(sortedYears);
        setAllCategories(sortedCategories);
        setAllDescriptions(sortedDescriptions);
        
        // Always initialize with all categories and descriptions selected on first load
        // Check if this is the initial load (when selectedCategories is empty)
        if (selectedCategories.length === 0 && sortedCategories.length > 0) {
          setSelectedCategories(sortedCategories);
          setPendingCategories(sortedCategories);
        } else if (selectedCategories.length > 0 && pendingCategories.length === 0) {
          // Ensure pending categories are synced if they weren't set
          setPendingCategories(selectedCategories);
        }
        
        if (selectedDescriptions.length === 0 && sortedDescriptions.length > 0) {
          setSelectedDescriptions(sortedDescriptions);
          setPendingDescriptions(sortedDescriptions);
        } else if (selectedDescriptions.length > 0 && pendingDescriptions.length === 0) {
          // Ensure pending descriptions are synced if they weren't set
          setPendingDescriptions(selectedDescriptions);
        }
        
        // If selected year doesn't have data, default to the most recent year with data
        if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
          setSelectedYear(sortedYears[0]);
          return; // Will re-trigger useEffect with new selectedYear
        }
        
        // Filter data based on time range
        let now = new Date();
        let filterStartDate: Date;
        
        switch (timeRange) {
          case "monthly":
            // Selected year for monthly grouping
            filterStartDate = new Date(selectedYear, 0, 1);
            now = new Date(selectedYear, 11, 31, 23, 59, 59);
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
        let filteredData = data.filter((t: { date: string }) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= filterStartDate && transactionDate <= now;
        });

        // Filter by selected categories and descriptions
        filteredData = filteredData.filter((t: { category?: { name: string }; description: string }) => {
          const categoryName = t.category?.name || "Uncategorized";
          const description = t.description || "No Description";
          
          const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(categoryName);
          const descriptionMatch = selectedDescriptions.length === 0 || selectedDescriptions.includes(description);
          
          return categoryMatch && descriptionMatch;
        });

        // Store filtered transactions for the table
        const mappedTransactions = filteredData.map((t: RawTransactionData) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          description: t.description || "No Description",
          notes: t.notes,
          category: t.category,
          type: t.type,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        }));
        
        setFilteredTransactions(mappedTransactions);
        
        // Separate expense and income transactions for individual tabs
        setFilteredExpenseTransactions(mappedTransactions.filter((t: TransactionData) => t.type === "EXPENSE" || t.type === "EXPENSE_SAVINGS"));
        setFilteredIncomeTransactions(mappedTransactions.filter((t: TransactionData) => t.type === "INCOME"));

        // Process analytics with filtered data
        const expenses = filteredData.filter((t: { type: string }) => t.type === "EXPENSE" || t.type === "EXPENSE_SAVINGS");
        const income = filteredData.filter((t: { type: string }) => t.type === "INCOME");
        const total = expenses.reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);
        const incomeTotal = income.reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);
        
        if (timeRange === "monthly") {
          // Group expenses by month and category
          const monthlyMap: { [key: string]: number } = {};
          const categoryByMonthMap: { [month: string]: { [category: string]: number } } = {};
          
          expenses.forEach((t: { amount: number; date: string; category?: { name: string }; description: string }) => {
            const date = new Date(t.date);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const categoryName = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by month
            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount;
            
            // Category by month
            if (!categoryByMonthMap[monthKey]) categoryByMonthMap[monthKey] = {};
            categoryByMonthMap[monthKey][categoryName] = (categoryByMonthMap[monthKey][categoryName] || 0) + amount;
          });
          
          const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
          monthlyData.sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
          setExpensesByPeriod(monthlyData);

          // Group income by month and category
          const incomeMonthlyMap: { [key: string]: number } = {};
          const incomeCategoryByMonthMap: { [month: string]: { [category: string]: number } } = {};
          
          income.forEach((t: { amount: number; date: string; category?: { name: string }; description: string }) => {
            const date = new Date(t.date);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const categoryName = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by month
            incomeMonthlyMap[monthKey] = (incomeMonthlyMap[monthKey] || 0) + amount;
            
            // Category by month
            if (!incomeCategoryByMonthMap[monthKey]) incomeCategoryByMonthMap[monthKey] = {};
            incomeCategoryByMonthMap[monthKey][categoryName] = (incomeCategoryByMonthMap[monthKey][categoryName] || 0) + amount;
          });
          
          const incomeMonthlyData = Object.entries(incomeMonthlyMap).map(([month, amount]) => ({ month, amount }));
          incomeMonthlyData.sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
          setIncomeByPeriod(incomeMonthlyData);
          
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
          
          // Overall category totals for expenses
          const categoryMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + Math.abs(t.amount);
          });
          const categories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total ? (amount / total) * 100 : 0
          }));
          categories.sort((a, b) => b.amount - a.amount);
          setExpensesByCategory(categories);

          // Overall category totals for income
          const incomeCategoryMap: { [key: string]: number } = {};
          income.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            incomeCategoryMap[categoryName] = (incomeCategoryMap[categoryName] || 0) + Math.abs(t.amount);
          });
          const incomeCategories = Object.entries(incomeCategoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: incomeTotal ? (amount / incomeTotal) * 100 : 0
          }));
          incomeCategories.sort((a, b) => b.amount - a.amount);
          setIncomeByCategory(incomeCategories);
          
        } else if (timeRange === "yearly") {
          // Group by year and category
          const yearlyMap: { [key: string]: number } = {};
          const categoryByYearMap: { [year: string]: { [category: string]: number } } = {};
          
          expenses.forEach((t: { amount: number; date: string; category?: { name: string }; description: string }) => {
            const date = new Date(t.date);
            const year = date.getFullYear().toString();
            const categoryName = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by year
            yearlyMap[year] = (yearlyMap[year] || 0) + amount;
            
            // Category by year
            if (!categoryByYearMap[year]) categoryByYearMap[year] = {};
            categoryByYearMap[year][categoryName] = (categoryByYearMap[year][categoryName] || 0) + amount;
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
          expenses.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + Math.abs(t.amount);
          });
          const categories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total ? (amount / total) * 100 : 0
          }));
          categories.sort((a, b) => b.amount - a.amount);
          setExpensesByCategory(categories);

          // Group income by year and category
          const incomeYearlyMap: { [key: string]: number } = {};
          const incomeCategoryByYearMap: { [year: string]: { [category: string]: number } } = {};
          
          income.forEach((t: { amount: number; date: string; category?: { name: string }; description: string }) => {
            const date = new Date(t.date);
            const year = date.getFullYear().toString();
            const categoryName = t.category?.name || "Uncategorized";
            const amount = Math.abs(t.amount);
            
            // Total by year
            incomeYearlyMap[year] = (incomeYearlyMap[year] || 0) + amount;
            
            // Category by year
            if (!incomeCategoryByYearMap[year]) incomeCategoryByYearMap[year] = {};
            incomeCategoryByYearMap[year][categoryName] = (incomeCategoryByYearMap[year][categoryName] || 0) + amount;
          });
          
          const incomeYearlyData = Object.entries(incomeYearlyMap).map(([year, amount]) => ({ year, amount }));
          incomeYearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
          setIncomeByPeriod(incomeYearlyData);

          // Overall category totals for income (yearly)
          const incomeYearlyCategoryMap: { [key: string]: number } = {};
          income.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            incomeYearlyCategoryMap[categoryName] = (incomeYearlyCategoryMap[categoryName] || 0) + Math.abs(t.amount);
          });
          const incomeYearlyCategories = Object.entries(incomeYearlyCategoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: incomeTotal ? (amount / incomeTotal) * 100 : 0
          }));
          incomeYearlyCategories.sort((a, b) => b.amount - a.amount);
          setIncomeByCategory(incomeYearlyCategories);
          
        } else {
          // For custom range, use overall category data
          const categoryMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + Math.abs(t.amount);
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

          // For custom range, use overall income category data
          const incomeCategoryMap: { [key: string]: number } = {};
          income.forEach((t: { amount: number; category?: { name: string }; description: string }) => {
            const categoryName = t.category?.name || "Uncategorized";
            incomeCategoryMap[categoryName] = (incomeCategoryMap[categoryName] || 0) + Math.abs(t.amount);
          });
          const incomeCategories = Object.entries(incomeCategoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: incomeTotal ? (amount / incomeTotal) * 100 : 0
          }));
          incomeCategories.sort((a, b) => b.amount - a.amount);
          setIncomeByCategory(incomeCategories);
          setIncomeByPeriod([]);
        }

    } catch (err: unknown) {
      setError((err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, timeRange, selectedYear, selectedCategories, selectedDescriptions, startDate, endDate, pendingCategories.length, pendingDescriptions.length]);

  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
    }
  }, [timeRange, selectedYear, selectedCategories, selectedDescriptions, startDate, endDate, currentAccount, fetchTransactions]);

  // Reset selections when account changes to trigger "select all" behavior
  useEffect(() => {
    if (currentAccount) {
      setSelectedCategories([]);
      setSelectedDescriptions([]);
      setPendingCategories([]);
      setPendingDescriptions([]);
    }
  }, [currentAccount]);

  // Function to apply pending selections
  const applyFilters = () => {
    setSelectedCategories(pendingCategories);
    setSelectedDescriptions(pendingDescriptions);
  };

  // Function to toggle transaction expansion
  const toggleTransactionExpansion = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  // Check if there are pending changes
  const hasPendingChanges = 
    JSON.stringify(selectedCategories.sort()) !== JSON.stringify(pendingCategories.sort()) ||
    JSON.stringify(selectedDescriptions.sort()) !== JSON.stringify(pendingDescriptions.sort());

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
        <ReportsSkeleton />
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
            <div className="flex gap-4 items-center flex-wrap">
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
              
              {/* Year Selector for Monthly Reports */}
              {timeRange === "monthly" && availableYears.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="year-selector-no-data" className="text-sm font-medium whitespace-nowrap">
                    Year:
                  </Label>
                  <Select value={selectedYear.toString()} onValueChange={(year) => setSelectedYear(parseInt(year))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Category Multi-Select */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Categories:
                </Label>
                <div className="relative">
                  <button 
                    className="flex h-10 w-60 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  >
                    <span className="truncate">
                      {selectedCategories.length === 0 
                        ? "Select categories..."
                        : selectedCategories.length === allCategories.length
                        ? "All categories"
                        : `${selectedCategories.length} categories selected`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {categoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-popover border rounded-md shadow-md z-50 p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Categories</label>
                          <div className="flex gap-1">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingCategories(allCategories)}
                            >
                              All
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingCategories([])}
                            >
                              None
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setCategoryDropdownOpen(false)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {allCategories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                              onClick={() => {
                                const isSelected = pendingCategories.includes(category);
                                if (isSelected) {
                                  setPendingCategories(pendingCategories.filter(c => c !== category));
                                } else {
                                  setPendingCategories([...pendingCategories, category]);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={pendingCategories.includes(category)}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm truncate flex-1">{category}</span>
                            </div>
                          ))}
                        </div>
                        
                        {hasPendingChanges && (
                          <div className="flex gap-2 pt-2 border-t">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 flex-1"
                              onClick={() => {
                                applyFilters();
                                setCategoryDropdownOpen(false);
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4 flex-1"
                              onClick={() => {
                                setPendingCategories(selectedCategories);
                                setPendingDescriptions(selectedDescriptions);
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description Multi-Select */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Descriptions:
                </Label>
                <div className="relative">
                  <button 
                    className="flex h-10 w-60 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setDescriptionDropdownOpen(!descriptionDropdownOpen)}
                  >
                    <span className="truncate">
                      {selectedDescriptions.length === 0 
                        ? "Select descriptions..."
                        : selectedDescriptions.length === allDescriptions.length
                        ? "All descriptions"
                        : `${selectedDescriptions.length} descriptions selected`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {descriptionDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-popover border rounded-md shadow-md z-50 p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Descriptions</label>
                          <div className="flex gap-1">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingDescriptions(allDescriptions)}
                            >
                              All
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingDescriptions([])}
                            >
                              None
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setDescriptionDropdownOpen(false)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {allDescriptions.map((description) => (
                            <div
                              key={description}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                              onClick={() => {
                                const isSelected = pendingDescriptions.includes(description);
                                if (isSelected) {
                                  setPendingDescriptions(pendingDescriptions.filter(d => d !== description));
                                } else {
                                  setPendingDescriptions([...pendingDescriptions, description]);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={pendingDescriptions.includes(description)}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm truncate flex-1">{description}</span>
                            </div>
                          ))}
                        </div>
                        
                        {hasPendingChanges && (
                          <div className="flex gap-2 pt-2 border-t">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 flex-1"
                              onClick={() => {
                                applyFilters();
                                setDescriptionDropdownOpen(false);
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4 flex-1"
                              onClick={() => {
                                setPendingCategories(selectedCategories);
                                setPendingDescriptions(selectedDescriptions);
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="space-y-6">
            <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 items-center flex-wrap">
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
              
              {/* Year Selector for Monthly Reports */}
              {timeRange === "monthly" && availableYears.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="year-selector" className="text-sm font-medium whitespace-nowrap">
                    Year:
                  </Label>
                  <Select value={selectedYear.toString()} onValueChange={(year) => setSelectedYear(parseInt(year))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Category Multi-Select */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Categories:
                </Label>
                <div className="relative">
                  <button 
                    className="flex h-10 w-60 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  >
                    <span className="truncate">
                      {selectedCategories.length === 0 
                        ? "Select categories..."
                        : selectedCategories.length === allCategories.length
                        ? "All categories"
                        : `${selectedCategories.length} categories selected`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {categoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-popover border rounded-md shadow-md z-50 p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Categories</label>
                          <div className="flex gap-1">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingCategories(allCategories)}
                            >
                              All
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingCategories([])}
                            >
                              None
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setCategoryDropdownOpen(false)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {allCategories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                              onClick={() => {
                                const isSelected = pendingCategories.includes(category);
                                if (isSelected) {
                                  setPendingCategories(pendingCategories.filter(c => c !== category));
                                } else {
                                  setPendingCategories([...pendingCategories, category]);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={pendingCategories.includes(category)}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm truncate flex-1">{category}</span>
                            </div>
                          ))}
                        </div>
                        
                        {hasPendingChanges && (
                          <div className="flex gap-2 pt-2 border-t">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 flex-1"
                              onClick={() => {
                                applyFilters();
                                setCategoryDropdownOpen(false);
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4 flex-1"
                              onClick={() => {
                                setPendingCategories(selectedCategories);
                                setPendingDescriptions(selectedDescriptions);
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description Multi-Select */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Descriptions:
                </Label>
                <div className="relative">
                  <button 
                    className="flex h-10 w-60 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setDescriptionDropdownOpen(!descriptionDropdownOpen)}
                  >
                    <span className="truncate">
                      {selectedDescriptions.length === 0 
                        ? "Select descriptions..."
                        : selectedDescriptions.length === allDescriptions.length
                        ? "All descriptions"
                        : `${selectedDescriptions.length} descriptions selected`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {descriptionDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-popover border rounded-md shadow-md z-50 p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Descriptions</label>
                          <div className="flex gap-1">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingDescriptions(allDescriptions)}
                            >
                              All
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setPendingDescriptions([])}
                            >
                              None
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
                              onClick={() => setDescriptionDropdownOpen(false)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {allDescriptions.map((description) => (
                            <div
                              key={description}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                              onClick={() => {
                                const isSelected = pendingDescriptions.includes(description);
                                if (isSelected) {
                                  setPendingDescriptions(pendingDescriptions.filter(d => d !== description));
                                } else {
                                  setPendingDescriptions([...pendingDescriptions, description]);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={pendingDescriptions.includes(description)}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span className="text-sm truncate flex-1">{description}</span>
                            </div>
                          ))}
                        </div>
                        
                        {hasPendingChanges && (
                          <div className="flex gap-2 pt-2 border-t">
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 flex-1"
                              onClick={() => {
                                applyFilters();
                                setDescriptionDropdownOpen(false);
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4 flex-1"
                              onClick={() => {
                                setPendingCategories(selectedCategories);
                                setPendingDescriptions(selectedDescriptions);
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 mt-6">
            <Card className="md:col-span-3 lg:col-span-2 bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle>
                  {timeRange === 'monthly' ? 'Expenses by Month' : 
                   timeRange === 'yearly' ? 'Expenses by Year' : 
                   'Expenses by Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  {/* Show toggle for categories when there are many */}
                  {timeRange === 'custom' && (expensesByCategory || []).length > 10 && (
                    <div className="flex justify-end mb-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowAllCategories(!showAllCategories)}
                      >
                        {showAllCategories ? "Show Top 10" : `Show All ${(expensesByCategory || []).length}`}
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {(timeRange === 'custom' 
                      ? (showAllCategories ? (expensesByCategory || []) : (expensesByCategory || []).slice(0, 10))
                      : (expensesByPeriod || [])
                    ).map((item, index) => {
                      const barWidth = Math.max(((item?.amount || 0) / maxAmount) * 100, 1);
                      const label = timeRange === 'custom' ? ((item as ExpenseData).category || 'Unknown') : 
                                   timeRange === 'monthly' ? ((item as MonthlyData).month || 'Unknown') : 
                                   ((item as YearlyData).year || 'Unknown');
                      const colorClass = "bg-violet-500";
                      
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-20 sm:w-24 text-right">
                            <span className="text-xs sm:text-sm font-medium text-foreground truncate block">
                              {label.length > 12 ? `${label.substring(0, 12)}...` : label}
                            </span>
                          </div>
                          
                          <div className="flex-1 relative">
                            <div className="w-full bg-muted rounded-full h-6 sm:h-8 relative overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out relative`}
                                style={{ width: `${barWidth}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                              </div>
                            </div>
                            
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <span className="text-xs font-medium text-white drop-shadow-sm">
                                {formatCurrency(item?.amount || 0)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 w-12 sm:w-16 text-left">
                            <span className="text-xs text-muted-foreground">
                              {((item?.amount || 0) / totalAmount * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-end text-sm">
                      <span className="text-muted-foreground">Max: {formatCurrency(maxAmount)}</span>
                    </div>
                  </div>
                </div>
                {/* Stats at bottom */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-border pt-2 mt-2">
                  <div className="flex flex-col items-center p-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center">Total Expenses</span>
                    <span className="text-lg sm:text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  {timeRange !== 'custom' && (
                    <div className="flex flex-col items-center p-1">
                      <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                        Average per {timeRange === 'monthly' ? 'Month' : 'Year'}
                      </span>
                      <span className="text-sm sm:text-xl font-bold">{formatCurrency(averageAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center p-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      {timeRange === 'monthly' ? 'Top Month' : 
                       timeRange === 'yearly' ? 'Top Year' : 'Top Category'}
                    </span>
                    <span className="text-sm sm:text-lg font-bold text-center">
                      {timeRange === 'custom' 
                        ? (expensesByCategory || [])[0]?.category || "N/A"
                        : timeRange === 'monthly' 
                          ? ((expensesByPeriod || [])[0] as MonthlyData)?.month || "N/A"
                          : ((expensesByPeriod || [])[0] as YearlyData)?.year || "N/A"
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      {timeRange === 'monthly' ? 'Months' : 
                       timeRange === 'yearly' ? 'Years' : 'Categories'}
                    </span>
                    <span className="text-sm sm:text-xl font-bold">
                      {timeRange === 'custom' ? (expensesByCategory || []).length : (expensesByPeriod || []).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-card-foreground border h-full max-h-[600px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                {timeRange === 'custom' ? (
                  // For custom range, show overall category breakdown
                  (expensesByCategory || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No category data available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 h-full">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Overall Distribution</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Visual breakdown showing how your expenses are distributed across the selected categories and descriptions for the selected period.
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
                          {(expensesByCategory || []).map((item, index) => (
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
                                  index === 7 ? "bg-teal-500" :
                                  index === 8 ? "bg-orange-500" :
                                  "bg-cyan-500"
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
                    <div className="space-y-6 h-full overflow-y-auto">
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

          {/* Transactions Data Table */}
          {filteredExpenseTransactions.length > 0 && (
            <Card className="bg-card text-card-foreground border mt-6">
              <CardHeader>
                <CardTitle>
                  Expense Transaction Details ({filteredExpenseTransactions.length} transactions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenseTransactions.map((transaction) => (
                        <React.Fragment key={transaction.id}>
                          <TableRow>
                            <TableCell>
                              <button
                                onClick={() => toggleTransactionExpansion(transaction.id)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform ${
                                    expandedTransactions.has(transaction.id) ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString('en-US', { 
                                    weekday: 'short' 
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span 
                                className="inline-block px-2 py-1 text-xs font-medium rounded-md"
                                style={{
                                  backgroundColor: transaction.category?.color 
                                    ? `${transaction.category.color}20` 
                                    : 'rgb(var(--muted))',
                                  color: transaction.category?.color || 'rgb(var(--muted-foreground))',
                                  borderColor: transaction.category?.color || 'rgb(var(--border))'
                                }}
                              >
                                {transaction.category?.name || "Uncategorized"}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="font-medium truncate" title={transaction.description}>
                                {transaction.description.length > 30 
                                  ? `${transaction.description.substring(0, 30)}...`
                                  : transaction.description
                                }
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {transaction.notes ? (
                                <div className="text-sm text-muted-foreground truncate" title={transaction.notes}>
                                  {transaction.notes.length > 25 
                                    ? `${transaction.notes.substring(0, 25)}...`
                                    : transaction.notes
                                  }
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No notes</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${
                                transaction.type === "EXPENSE" || transaction.type === "EXPENSE_SAVINGS"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : transaction.type === "INCOME"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}>
                                {transaction.type.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              <span className={
                                transaction.type === "EXPENSE" || transaction.type === "EXPENSE_SAVINGS"
                                  ? "text-red-600 dark:text-red-400"
                                  : transaction.type === "INCOME"
                                  ? "text-green-600 dark:text-green-400"
                                  : ""
                              }>
                                {transaction.type === "EXPENSE" || transaction.type === "EXPENSE_SAVINGS"
                                  ? `-${formatCurrency(Math.abs(transaction.amount))}`
                                  : formatCurrency(Math.abs(transaction.amount))
                                }
                              </span>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded row with full details */}
                          {expandedTransactions.has(transaction.id) && (
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell colSpan={6}>
                                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">Transaction Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">ID:</span>
                                          <span className="ml-2 font-mono text-xs">{transaction.id}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Full Description:</span>
                                          <p className="ml-2 mt-1">{transaction.description}</p>
                                        </div>
                                        {transaction.notes && (
                                          <div>
                                            <span className="text-muted-foreground">Notes:</span>
                                            <p className="ml-2 mt-1">{transaction.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">Timestamps</h4>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">Transaction Date:</span>
                                          <div className="ml-2">
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Created:</span>
                                          <div className="ml-2">
                                            {new Date(transaction.createdAt).toLocaleString('en-US', {
                                              weekday: 'short',
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Last Updated:</span>
                                          <div className="ml-2">
                                            {new Date(transaction.updatedAt).toLocaleString('en-US', {
                                              weekday: 'short',
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {transaction.category && (
                                    <div className="pt-3 border-t border-border/50">
                                      <h4 className="font-medium text-sm mb-2">Category Information</h4>
                                      <div className="flex items-center gap-3">
                                        <span 
                                          className="px-3 py-1 text-sm font-medium rounded-md"
                                          style={{
                                            backgroundColor: transaction.category.color 
                                              ? `${transaction.category.color}30` 
                                              : 'rgb(var(--muted))',
                                            color: transaction.category.color || 'rgb(var(--muted-foreground))'
                                          }}
                                        >
                                          {transaction.category.icon && (
                                            <span className="mr-2">{transaction.category.icon}</span>
                                          )}
                                          {transaction.category.name}
                                        </span>
                                        {transaction.category.color && (
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div 
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: transaction.category.color }}
                                            ></div>
                                            <span>{transaction.category.color}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Summary row */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total Expenses: {filteredExpenseTransactions.length} transactions
                    </span>
                    <span className="font-medium text-lg">
                      {formatCurrency(
                        filteredExpenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          </TabsContent>
          
          <TabsContent value="income" className="space-y-6">
            <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 items-center flex-wrap">
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
              
              {/* Year Selector for Monthly Reports */}
              {timeRange === "monthly" && availableYears.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="year-selector-income" className="text-sm font-medium whitespace-nowrap">
                    Year:
                  </Label>
                  <Select value={selectedYear.toString()} onValueChange={(year) => setSelectedYear(parseInt(year))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Custom Date Range Pickers */}
              {timeRange === "custom" && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date-income" className="text-sm font-medium whitespace-nowrap">
                      From:
                    </Label>
                    <Input
                      id="start-date-income"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date-income" className="text-sm font-medium whitespace-nowrap">
                      To:
                    </Label>
                    <Input
                      id="end-date-income"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </>
              )}
            </div>
            </div>
            
            {/* Income Charts */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 mt-6">
              <Card className="md:col-span-3 lg:col-span-2 bg-card text-card-foreground border">
                <CardHeader>
                  <CardTitle>
                    Income by {timeRange === 'monthly' ? 'Month' : timeRange === 'yearly' ? 'Year' : 'Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-full">
                    {(activeTab === 'income' ? incomeByPeriod : []).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No income data available for selected filters.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {(timeRange === 'custom' 
                            ? (showAllCategories ? (incomeByCategory || []) : (incomeByCategory || []).slice(0, 10))
                            : (incomeByPeriod || [])
                          ).map((item, index) => {
                            const maxAmount = Math.max(...(activeTab === 'income' ? incomeByPeriod : []).map((d: MonthlyData | YearlyData) => d?.amount || 0));
                            const barWidth = Math.max(((item?.amount || 0) / maxAmount) * 100, 1);
                            const label = timeRange === 'custom' ? ((item as ExpenseData).category || 'Unknown') : 
                                         timeRange === 'monthly' ? ((item as MonthlyData).month || 'Unknown') : 
                                         ((item as YearlyData).year || 'Unknown');
                            const colorClass = "bg-green-500";
                            
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-20 sm:w-24 text-right">
                                  <span className="text-xs sm:text-sm font-medium text-foreground truncate block">
                                    {label.length > 12 ? `${label.substring(0, 12)}...` : label}
                                  </span>
                                </div>
                                
                                <div className="flex-1 relative">
                                  <div className="w-full bg-muted rounded-full h-6 sm:h-8 relative overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out relative`}
                                      style={{ width: `${barWidth}%` }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <span className="text-xs font-medium text-white drop-shadow-sm">
                                      {formatCurrency(item?.amount || 0)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex-shrink-0 w-12 sm:w-16 text-left">
                                  <span className="text-xs text-muted-foreground">
                                    {((item?.amount || 0) / (incomeByPeriod || []).reduce((sum: number, d: MonthlyData | YearlyData) => sum + (d?.amount || 0), 0) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-3 pt-2 border-t border-border">
                          <div className="flex items-center justify-end text-sm">
                            <span className="text-muted-foreground">Max: {formatCurrency(Math.max(...(incomeByPeriod || []).map((d: MonthlyData | YearlyData) => d?.amount || 0)))}</span>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Stats at bottom */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-border pt-2 mt-2">
                      <div className="flex flex-col items-center p-1">
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center">Total Income</span>
                        <span className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency((incomeByPeriod || []).reduce((sum: number, d: MonthlyData | YearlyData) => sum + (d?.amount || 0), 0))}</span>
                      </div>
                      
                      {timeRange !== 'custom' && (
                        <div className="flex flex-col items-center p-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                            Average per {timeRange === 'monthly' ? 'Month' : 'Year'}
                          </span>
                          <span className="text-sm sm:text-xl font-bold text-green-600">
                            {formatCurrency((incomeByPeriod || []).length > 0 ? (incomeByPeriod || []).reduce((sum: number, d: MonthlyData | YearlyData) => sum + (d?.amount || 0), 0) / (incomeByPeriod || []).length : 0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center p-1">
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                          {timeRange === 'monthly' ? 'Top Month' : 
                           timeRange === 'yearly' ? 'Top Year' : 'Top Category'}
                        </span>
                        <span className="text-sm sm:text-lg font-bold text-center text-green-600">
                          {timeRange === 'custom' 
                            ? (incomeByCategory || [])[0]?.category || "N/A"
                            : timeRange === 'monthly' 
                              ? ((incomeByPeriod || [])[0] as MonthlyData)?.month || "N/A"
                              : ((incomeByPeriod || [])[0] as YearlyData)?.year || "N/A"
                          }
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center p-1">
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center">
                          {timeRange === 'monthly' ? 'Months' : 
                           timeRange === 'yearly' ? 'Years' : 'Categories'}
                        </span>
                        <span className="text-sm sm:text-xl font-bold text-green-600">
                          {timeRange === 'custom' ? (incomeByCategory || []).length : (incomeByPeriod || []).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card text-card-foreground border h-full max-h-[600px] overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle>Income Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-y-auto">
                  {(incomeByCategory || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No income category data available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 h-full">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Visual breakdown showing how your income is distributed across different categories.
                        </p>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-4">
                          {(incomeByCategory || []).map((item, index) => {
                            const incomeTotal = (incomeByCategory || []).reduce((sum: number, d: ExpenseData) => sum + (d?.amount || 0), 0);
                            const percentage = incomeTotal > 0 ? ((item?.amount || 0) / incomeTotal) * 100 : 0;
                            const colors = [
                              "bg-green-500", "bg-emerald-500", "bg-teal-500", 
                              "bg-lime-500", "bg-green-600", "bg-emerald-600",
                              "bg-teal-600", "bg-lime-600", "bg-green-700", "bg-emerald-700"
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
                          {(incomeByCategory || []).map((item, index) => {
                            const incomeTotal = (incomeByCategory || []).reduce((sum: number, d: ExpenseData) => sum + (d?.amount || 0), 0);
                            return (
                              <div key={item.category} className="flex items-center gap-2">
                                <div 
                                  className={`w-3 h-3 rounded-full ${
                                    index === 0 ? "bg-green-500" :
                                    index === 1 ? "bg-emerald-500" :
                                    index === 2 ? "bg-teal-500" :
                                    index === 3 ? "bg-lime-500" :
                                    index === 4 ? "bg-green-600" :
                                    index === 5 ? "bg-emerald-600" :
                                    index === 6 ? "bg-teal-600" :
                                    index === 7 ? "bg-lime-600" :
                                    index === 8 ? "bg-green-700" :
                                    "bg-emerald-700"
                                  }`} 
                                />
                                <span className="text-xs flex-1">{item?.category || 'Unknown'}</span>
                                <span className="text-xs font-medium">{formatCurrency(item?.amount || 0)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {incomeTotal > 0 ? ((item?.amount || 0) / incomeTotal * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Income Transactions Data Table */}
            {filteredIncomeTransactions.length > 0 && (
              <Card className="bg-card text-card-foreground border mt-6">
                <CardHeader>
                  <CardTitle>
                    Income Transaction Details ({filteredIncomeTransactions.length} transactions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncomeTransactions.map((transaction) => (
                          <React.Fragment key={transaction.id}>
                            <TableRow>
                              <TableCell>
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedTransactions);
                                    if (newExpanded.has(transaction.id)) {
                                      newExpanded.delete(transaction.id);
                                    } else {
                                      newExpanded.add(transaction.id);
                                    }
                                    setExpandedTransactions(newExpanded);
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <ChevronDown 
                                    className={`h-4 w-4 transition-transform ${
                                      expandedTransactions.has(transaction.id) ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              </TableCell>
                              <TableCell>
                                {new Date(transaction.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {transaction.category?.color && (
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: transaction.category.color }}
                                    />
                                  )}
                                  <span className="truncate max-w-32">
                                    {transaction.category?.name || "Uncategorized"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-48 truncate">
                                {transaction.description}
                              </TableCell>
                              <TableCell className="max-w-32 truncate">
                                {transaction.notes || "-"}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {transaction.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                <span className="text-green-600 font-medium">
                                  +{formatCurrency(Math.abs(transaction.amount))}
                                </span>
                              </TableCell>
                            </TableRow>
                            {expandedTransactions.has(transaction.id) && (
                              <TableRow>
                                <TableCell></TableCell>
                                <TableCell colSpan={6}>
                                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Transaction Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">ID:</span>
                                            <span className="ml-2 font-mono text-xs">{transaction.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Type:</span>
                                            <span className="ml-2">{transaction.type}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="ml-2 font-mono text-green-600 font-medium">
                                              +{formatCurrency(Math.abs(transaction.amount))}
                                            </span>
                                          </div>
                                          {transaction.category && (
                                            <div>
                                              <span className="text-muted-foreground">Category:</span>
                                              <div className="ml-2 flex items-center gap-2 mt-1">
                                                {transaction.category.color && (
                                                  <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: transaction.category.color }}
                                                  />
                                                )}
                                                <span>{transaction.category.name}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-sm mb-2">Additional Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">Description:</span>
                                            <p className="ml-2 text-wrap break-words">{transaction.description || "No description provided"}</p>
                                          </div>
                                          {transaction.notes && (
                                            <div>
                                              <span className="text-muted-foreground">Notes:</span>
                                              <p className="ml-2 text-wrap break-words">{transaction.notes}</p>
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-muted-foreground">Date:</span>
                                            <span className="ml-2">{new Date(transaction.date).toLocaleDateString('en-US', { 
                                              weekday: 'long', 
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                            })}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Created:</span>
                                            <span className="ml-2 text-xs">{new Date(transaction.createdAt).toLocaleString()}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Updated:</span>
                                            <span className="ml-2 text-xs">{new Date(transaction.updatedAt).toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Summary row */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Total Income: {filteredIncomeTransactions.length} transactions
                      </span>
                      <span className="font-medium text-lg text-green-600">
                        +{formatCurrency(
                          filteredIncomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 