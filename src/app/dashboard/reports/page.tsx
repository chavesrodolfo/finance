"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, PieChart, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

// Color mapping for categories with index signature
const categoryColors: { [key: string]: string } = {
  "Housing": "#ef4444",       // red-500
  "Food": "#f97316",          // orange-500
  "Childcare": "#84cc16",     // lime-500
  "Utilities": "#22c55e",     // green-500
  "Personal": "#06b6d4",      // cyan-500
  "Transportation": "#3b82f6", // blue-500
  "Household": "#8b5cf6",     // violet-500
  "Online": "#d946ef",        // fuchsia-500
  "Miscellaneous": "#ec4899"  // pink-500
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseData[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyData[]>([]);

  useEffect(() => {
    // TODO: Fetch real data from API
    setLoading(false);
  }, []);
  
  // Calculate the total amount
  const totalAmount = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);

  // Generate pie chart slices
  const generatePieChartSlices = () => {
    let currentAngle = 0;
    const paths = [];

    for (let i = 0; i < expensesByCategory.length; i++) {
      const category = expensesByCategory[i];
      const startAngle = currentAngle;
      const sliceAngle = (category.percentage / 100) * 360;
      const endAngle = startAngle + sliceAngle;
      
      // Calculate the SVG arc path
      const startX = 50 + 45 * Math.cos((startAngle - 90) * (Math.PI / 180));
      const startY = 50 + 45 * Math.sin((startAngle - 90) * (Math.PI / 180));
      const endX = 50 + 45 * Math.cos((endAngle - 90) * (Math.PI / 180));
      const endY = 50 + 45 * Math.sin((endAngle - 90) * (Math.PI / 180));
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${startX} ${startY}`,
        `A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `Z`
      ].join(' ');
      
      paths.push(
        <path
          key={i}
          d={pathData}
          fill={categoryColors[category.category] || `hsl(${i * 40 % 360}, 70%, 50%)`}
          stroke="#111"
          strokeWidth="0.5"
        />
      );
      
      currentAngle = endAngle;
    }

    return paths;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading reports...</div>
        </div>
      ) : expensesByCategory.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Add some transactions to generate reports and analytics.
          </p>
          <Button variant="outline">Add Transactions</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-4 w-4" />
                Bar Chart
              </Button>
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setChartType("pie")}
              >
                <PieChart className="h-4 w-4" />
                Pie Chart
              </Button>
            </div>
          </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-black/95 text-white">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart area */}
            <div className="h-80 w-full relative">
              {chartType === "bar" ? (
                <div className="h-full w-full flex pt-4 pb-6">
                  <div className="flex flex-col justify-between text-xs text-gray-400 pr-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{((4 - i) * 1000).toFixed(0)}</span>
                    ))}
                    <span>0</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-end justify-around h-full relative">
                      {/* X-axis line */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                      
                      {/* Bars */}
                      {expensesByCategory.map((category, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            style={{
                              height: `${(category.amount / 4000) * 100}%`,
                              backgroundColor: categoryColors[category.category] || `hsl(${index * 40 % 360}, 70%, 50%)`,
                              width: "36px",
                              borderRadius: "3px 3px 0 0"
                            }}
                          ></div>
                          <div className="h-16 flex flex-col items-center">
                            <span className="text-xs mt-2 text-gray-400 rotate-45 origin-top-left translate-x-6">
                              {category.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex justify-center items-center">
                  <div className="relative h-60 w-60">
                    {/* Pie chart visualization */}
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {generatePieChartSlices()}
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats at bottom */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Total Expenses</span>
                <span className="text-2xl font-bold mt-1">CA${totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Top Category</span>
                <span className="text-lg font-bold mt-1">{expensesByCategory[0].category}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Categories</span>
                <span className="text-xl font-bold mt-1">{expensesByCategory.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      
        <Card className="bg-black/95 text-white">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.category}</span>
                    <span className="font-medium">CA${category.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: categoryColors[category.category] || `hsl(${index * 40 % 360}, 70%, 50%)` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">CA${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Monthly Expense Trend</CardTitle>
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {/* Simplified area chart for monthly expense trends */}
            <div className="relative h-full w-full">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border" />
              <div className="flex items-end justify-around h-full pt-6 pb-8">
                {monthlyExpenses.map((month, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-14 rounded-t-md bg-primary/80"
                      style={{ 
                        height: `${(month.amount / 10000) * 100}%`,
                        background: `linear-gradient(to top, hsl(217, 91%, 60%), hsl(217, 91%, 75%))` 
                      }}
                    />
                    <span className="text-xs mt-2">{month.month}</span>
                    <span className="text-xs text-muted-foreground">
                      CA${month.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Average</div>
              <div>CA${(
                monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / 
                monthlyExpenses.length
              ).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Min</div>
              <div>CA${Math.min(...monthlyExpenses.map(m => m.amount)).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Max</div>
              <div>CA${Math.max(...monthlyExpenses.map(m => m.amount)).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
} 