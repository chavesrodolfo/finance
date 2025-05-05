"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, TrendingUp, CircleDollarSign, Eye, EyeOff, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample investment accounts data
const investmentAccounts = [
  { 
    id: 1, 
    account: "TFSA (Wealthsimple)", 
    amount: 38250.00, 
    currency: "CAD",
    returns: {
      monthly: 1.2,
      annually: 7.8
    },
    type: "Tax-Free",
    allocation: {
      stocks: 80,
      bonds: 15,
      cash: 5
    }
  },
  { 
    id: 2, 
    account: "RRSP (TD Bank)", 
    amount: 65430.00, 
    currency: "CAD",
    returns: {
      monthly: 0.8,
      annually: 6.4
    },
    type: "Retirement",
    allocation: {
      stocks: 70,
      bonds: 25,
      cash: 5
    }
  },
  { 
    id: 3, 
    account: "Personal Investment (Questrade)", 
    amount: 28750.00, 
    currency: "CAD",
    returns: {
      monthly: 1.5,
      annually: 9.2
    },
    type: "Taxable",
    allocation: {
      stocks: 90,
      bonds: 5,
      cash: 5
    }
  },
  { 
    id: 4, 
    account: "Cryptocurrency Wallet", 
    amount: 12500.00, 
    currency: "CAD",
    returns: {
      monthly: 3.2,
      annually: 24.5
    },
    type: "Alternative",
    allocation: {
      crypto: 100
    }
  },
  { 
    id: 5, 
    account: "Company Stock Options", 
    amount: 18500.00, 
    currency: "CAD",
    returns: {
      monthly: 1.0,
      annually: 8.5
    },
    type: "Equity",
    allocation: {
      stocks: 100
    }
  }
];

// Performance over time data
const performanceData = [
  { month: "Jan", value: 155000 },
  { month: "Feb", value: 157500 },
  { month: "Mar", value: 156200 },
  { month: "Apr", value: 159800 },
  { month: "May", value: 163430 },
  { month: "Jun", value: 163430 + (163430 * 0.012) },
];

export default function InvestmentsPage() {
  const [showValues, setShowValues] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  
  // Calculate totals
  const totalInvestments = investmentAccounts.reduce((sum, account) => sum + account.amount, 0);
  const projectedAnnualReturn = investmentAccounts.reduce(
    (sum, account) => sum + (account.amount * (account.returns.annually / 100)), 
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investments</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showValues ? "Hide Values" : "Show Values"}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient-blue card-glass-effect card-with-glow card-blue-glow rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <CircleDollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
              <span className="text-sm text-muted-foreground">Total Investments</span>
              {showValues ? (
                <span className="text-3xl font-bold mt-1">CA${totalInvestments.toFixed(2)}</span>
              ) : (
                <span className="text-3xl font-bold mt-1">••••••</span>
              )}
              <span className="text-sm text-emerald-500 mt-1">+3.6% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient-green card-glass-effect card-with-glow card-green-glow rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-4" />
              <span className="text-sm text-muted-foreground">Projected Annual Return</span>
              {showValues ? (
                <span className="text-3xl font-bold mt-1">CA${projectedAnnualReturn.toFixed(2)}</span>
              ) : (
                <span className="text-3xl font-bold mt-1">••••••</span>
              )}
              <span className="text-sm text-emerald-500 mt-1">
                {(projectedAnnualReturn / totalInvestments * 100).toFixed(1)}% avg. return rate
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient-purple card-glass-effect card-with-glow card-purple-glow rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">Portfolio Mix</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stocks</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bonds</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Other</span>
                    <span>7%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "7%" }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="card-glass-effect rounded-xl border border-gray-200/10">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Investment Accounts</CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="tax-free">Tax-Free</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="taxable">Taxable</SelectItem>
              <SelectItem value="alternative">Alternative</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Monthly Return</TableHead>
                <TableHead className="text-right">Annual Return</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell className="text-right">
                    {showValues ? (
                      `${account.currency}$${account.amount.toFixed(2)}`
                    ) : (
                      "••••••"
                    )}
                  </TableCell>
                  <TableCell className="text-right text-emerald-500">
                    +{account.returns.monthly}%
                  </TableCell>
                  <TableCell className="text-right text-emerald-500">
                    +{account.returns.annually}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-bold">
                  {showValues ? (
                    `CAD$${totalInvestments.toFixed(2)}`
                  ) : (
                    "••••••"
                  )}
                </TableCell>
                <TableCell className="text-right text-emerald-500 font-medium">
                  +{(investmentAccounts.reduce((sum, acc) => sum + (acc.amount * acc.returns.monthly), 0) / totalInvestments * 100).toFixed(2)}%
                </TableCell>
                <TableCell className="text-right text-emerald-500 font-medium">
                  +{(projectedAnnualReturn / totalInvestments * 100).toFixed(2)}%
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="card-glass-effect card-with-glow rounded-xl border border-gray-200/10 mt-6">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Portfolio Performance</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="5years">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {/* Simulated chart for portfolio performance */}
            <div className="relative h-full w-full">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border" />
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
              
              {/* Y-axis labels */}
              <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground py-6">
                <span>$170K</span>
                <span>$165K</span>
                <span>$160K</span>
                <span>$155K</span>
                <span>$150K</span>
              </div>
              
              {/* Chart area */}
              <div className="absolute left-12 right-4 top-4 bottom-8">
                {/* Line chart */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 600 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,400 L100,380 L200,390 L300,350 L400,300 L500,200 L600,190"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M0,400 L100,380 L200,390 L300,350 L400,300 L500,200 L600,190 L600,400 L0,400"
                    fill="url(#area-gradient)"
                    opacity="0.2"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#8b5cf680" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Data points */}
                <div className="absolute inset-0 flex justify-between items-end pointer-events-none">
                  {performanceData.map((point, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        className="w-3 h-3 rounded-full bg-primary border-2 border-white"
                        style={{ 
                          marginBottom: `${((point.value - 150000) / 25000) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute left-12 right-4 bottom-0 flex justify-between text-xs text-muted-foreground">
                {performanceData.map((point, i) => (
                  <span key={i}>{point.month}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Starting Value</div>
              <div className="text-lg font-bold mt-1">
                {showValues ? `CA$${performanceData[0].value.toFixed(2)}` : "••••••"}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Current Value</div>
              <div className="text-lg font-bold mt-1">
                {showValues ? `CA$${performanceData[performanceData.length - 1].value.toFixed(2)}` : "••••••"}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Growth</div>
              <div className="text-lg font-bold text-emerald-500 mt-1">
                +{((performanceData[performanceData.length - 1].value - performanceData[0].value) / performanceData[0].value * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 