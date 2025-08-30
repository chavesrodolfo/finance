"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, TrendingUp, CircleDollarSign, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvestmentAccount {
  id: string;
  account: string;
  amount: number;
  currency: string;
  returns: {
    monthly: number;
    annually: number;
  };
  type: string;
}

export default function InvestmentsPage() {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);

  useEffect(() => {
    // TODO: Fetch investment data from API
    setLoading(false);
  }, []);

  // Calculate totals
  const totalInvestments = accounts.reduce((sum, account) => sum + account.amount, 0);
  const projectedAnnualReturn = accounts.reduce(
    (sum, account) => sum + (account.amount * (account.returns.annually / 100)), 
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Investments</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading investments...</div>
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
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Your First Investment Account
          </Button>
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
                  {showAmounts ? `CA$${totalInvestments.toFixed(2)}` : "••••••"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Across all accounts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Projected Annual Return</h3>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-emerald-400">
                  {showAmounts ? `CA$${projectedAnnualReturn.toFixed(2)}` : "••••••"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Based on current allocation</p>
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
          
          <Card>
            <CardHeader>
              <CardTitle>Investment Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Monthly Return</TableHead>
                    <TableHead className="text-right">Annual Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right">
                        {showAmounts ? `${account.currency}$${account.amount.toFixed(2)}` : "••••••"}
                      </TableCell>
                      <TableCell className="text-right text-emerald-500">
                        +{account.returns.monthly}%
                      </TableCell>
                      <TableCell className="text-right text-emerald-500">
                        +{account.returns.annually}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}