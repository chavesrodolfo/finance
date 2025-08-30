"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categoryColors: { [key: string]: string } = {
    "Housing": "hsl(var(--destructive))",
    "Food": "hsl(var(--chart-4))",
    "Childcare": "hsl(var(--chart-2))",
    "Utilities": "hsl(var(--chart-2))",
    "Personal": "hsl(var(--chart-1))",
    "Transportation": "hsl(var(--primary))",
    "Household": "hsl(var(--primary))",
    "Online": "hsl(var(--chart-5))",
    "Miscellaneous": "hsl(var(--chart-5))"
  };

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
        
        if (timeRange === "monthly") {
          // Group by month
          const monthlyMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; date: string }) => {
            const date = new Date(t.date);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Math.abs(t.amount);
          });
          const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
          monthlyData.sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
          setExpensesByPeriod(monthlyData);
          setExpensesByCategory([]); // Clear category data
        } else if (timeRange === "yearly") {
          // Group by year
          const yearlyMap: { [key: string]: number } = {};
          expenses.forEach((t: { amount: number; date: string }) => {
            const date = new Date(t.date);
            const year = date.getFullYear().toString();
            yearlyMap[year] = (yearlyMap[year] || 0) + Math.abs(t.amount);
          });
          const yearlyData = Object.entries(yearlyMap).map(([year, amount]) => ({ year, amount }));
          yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
          setExpensesByPeriod(yearlyData);
          setExpensesByCategory([]); // Clear category data
        } else {
          // For custom range, keep category breakdown
          const total = expenses.reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);
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
          setExpensesByPeriod([]); // Clear period data
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
    ? expensesByCategory.reduce((sum, item) => sum + item.amount, 0)
    : expensesByPeriod.reduce((sum, item) => sum + item.amount, 0);
    
  const maxAmount = timeRange === 'custom'
    ? (expensesByCategory.length > 0 ? Math.max(...expensesByCategory.map(c => c.amount)) : 4000)
    : (expensesByPeriod.length > 0 ? Math.max(...expensesByPeriod.map(p => p.amount)) : 4000);

  // Debug logging
  console.log('Time range:', timeRange);
  console.log('Expenses by category:', expensesByCategory);
  console.log('Expenses by period:', expensesByPeriod);
  console.log('Max amount:', maxAmount);
  console.log('Total amount:', totalAmount);

  const hasData = timeRange === 'custom' ? expensesByCategory.length > 0 : expensesByPeriod.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading reports...</div>
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
                <div className="h-80 w-full relative">
                  <div className="h-full w-full flex pt-4 pb-6">
                    <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{((4 - i) * (maxAmount / 4)).toFixed(0)}</span>
                      ))}
                      <span>0</span>
                    </div>
                    <div className="flex-1 relative">
                      <div className="flex items-end justify-around h-full relative" style={{ minHeight: "200px" }}>
                        <div className="absolute bottom-16 left-0 right-0 h-px bg-border"></div>
                        {(timeRange === 'custom' ? expensesByCategory : expensesByPeriod).map((item, index) => {
                          const availableHeight = 100 - (16 / 200 * 100);
                          const barHeight = Math.max((item.amount / maxAmount) * availableHeight, 1);
                          const label = timeRange === 'custom' ? (item as ExpenseData).category : 
                                       timeRange === 'monthly' ? (item as MonthlyData).month : 
                                       (item as YearlyData).year;
                          const color = timeRange === 'custom' ? 
                                       categoryColors[(item as ExpenseData).category] || `hsl(${index * 40 % 360}, 70%, 50%)` :
                                       `hsl(${index * 40 % 360}, 70%, 50%)`;
                          
                          return (
                            <div key={index} className="flex flex-col items-center h-full justify-end">
                              <div
                                style={{
                                  height: `${barHeight}%`,
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
                              <div className="h-16 flex flex-col items-center shrink-0">
                                <span className="text-xs mt-2 text-muted-foreground rotate-45 origin-top-left translate-x-6">
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
                
                {/* Stats at bottom */}
                <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Total Expenses</span>
                    <span className="text-2xl font-bold mt-1">CA${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {timeRange === 'monthly' ? 'Top Month' : 
                       timeRange === 'yearly' ? 'Top Year' : 'Top Category'}
                    </span>
                    <span className="text-lg font-bold mt-1">
                      {timeRange === 'custom' 
                        ? expensesByCategory[0]?.category || "N/A"
                        : timeRange === 'monthly' 
                          ? (expensesByPeriod[0] as MonthlyData)?.month || "N/A"
                          : (expensesByPeriod[0] as YearlyData)?.year || "N/A"
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {timeRange === 'monthly' ? 'Months' : 
                       timeRange === 'yearly' ? 'Years' : 'Categories'}
                    </span>
                    <span className="text-xl font-bold mt-1">
                      {timeRange === 'custom' ? expensesByCategory.length : expensesByPeriod.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-card-foreground border">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(timeRange === 'custom' ? expensesByCategory : expensesByPeriod).map((item, index) => {
                    const label = timeRange === 'custom' ? (item as ExpenseData).category : 
                                 timeRange === 'monthly' ? (item as MonthlyData).month : 
                                 (item as YearlyData).year;
                    const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                    const color = timeRange === 'custom' ? 
                                 categoryColors[(item as ExpenseData).category] || `hsl(${index * 40 % 360}, 70%, 50%)` :
                                 `hsl(${index * 40 % 360}, 70%, 50%)`;
                                 
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span className="font-medium">CA${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">CA${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}
    </div>
  );
} 