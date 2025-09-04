"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { stackClientApp } from "../stack.client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetricCardSkeleton, TransactionListSkeleton, BudgetCardSkeleton } from "@/components/dashboard/skeletons";
import { formatCurrency } from "@/lib/utils";
import { iconMap } from "@/lib/category-icons";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp, CircleDollarSign } from "lucide-react";
import { useHideValues } from "@/hooks/use-hide-values";
import { convertToCAD } from "@/lib/currency";
import { useExchangeRates } from "@/hooks/use-exchange-rates";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  type: 'EXPENSE' | 'INCOME' | 'EXPENSE_SAVINGS' | 'RETURN';
  category: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
}

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
}

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

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { hideValues, toggleHideValues, formatValue, isLoaded } = useHideValues();
  const { rates } = useExchangeRates();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (!user) {
          router.push('/');
          return;
        }
        
        // Fetch all data in parallel
        await Promise.all([
          fetchTransactions(),
          fetchBudgetItems(),
          fetchInvestmentAccounts()
        ]);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBudgetItems = async () => {
    try {
      const response = await fetch('/api/budget');
      if (response.ok) {
        const data = await response.json();
        setBudgetItems(data);
      }
    } catch (error) {
      console.error('Error fetching budget items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestmentAccounts = async () => {
    try {
      const response = await fetch('/api/investment-accounts');
      if (response.ok) {
        const data = await response.json();
        setInvestmentAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching investment accounts:', error);
    }
  };

  // Calculate totals for investments
  const totalInvestments = investmentAccounts.reduce((sum, account) => {
    const convertedValue = convertToCAD(account.currentValue, account.currency, rates);
    return sum + convertedValue;
  }, 0);

  const averageMonthlyReturn = investmentAccounts.length > 0 
    ? investmentAccounts.reduce((sum, account) => sum + account.monthlyReturnPercent, 0) / investmentAccounts.length
    : 0;

  const averageAnnualReturn = investmentAccounts.length > 0 
    ? investmentAccounts.reduce((sum, account) => sum + account.annualReturnPercent, 0) / investmentAccounts.length
    : 0;

  // Calculate totals for dashboard cards
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  if (loading || !isLoaded) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={toggleHideValues} variant="outline" size="sm">
            {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TransactionListSkeleton />
          </div>
          <div className="lg:col-span-1">
            <BudgetCardSkeleton />
          </div>
          <div className="lg:col-span-1">
            <BudgetCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={toggleHideValues} variant="outline" size="sm">
          {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold text-green-400">
                {formatValue(formatCurrency(monthlyIncome))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <CircleDollarSign className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-400">
                {formatValue(formatCurrency(monthlyExpenses))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Investments</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatValue(formatCurrency(totalInvestments))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CircleDollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatValue(formatCurrency(totalBudget))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <Link href="/dashboard/transactions" className="block">
            <Card className="p-6 glassmorphism hover:bg-purple-500/5 transition-colors cursor-pointer h-[450px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <span className="text-sm text-purple-400 hover:text-purple-300">View All →</span>
              </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => {
                const IconComponent = transaction.category.icon ? iconMap[transaction.category.icon] : null;
                return (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        {IconComponent && <IconComponent className="h-4 w-4 text-purple-400" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-400">{transaction.category.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatValue(formatCurrency(transaction.amount))}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            </Card>
          </Link>
        </div>

        {/* Monthly Budget */}
        <div className="lg:col-span-1">
          <Link href="/dashboard/budget" className="block">
            <Card className="p-6 glassmorphism hover:bg-purple-500/5 transition-colors cursor-pointer h-[450px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Monthly Budget</h2>
                <span className="text-sm text-purple-400 hover:text-purple-300">View All →</span>
              </div>
            
            {budgetItems.length > 0 ? (
              <div className="space-y-4">
                {/* Total Budget */}
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-gray-400">Total Budget</p>
                  <p className="text-lg font-bold text-blue-400">
                    {formatValue(formatCurrency(totalBudget))}
                  </p>
                </div>

                {/* Top Budget Items with Progress Bars */}
                <div className="space-y-3">
                  {budgetItems
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 4)
                    .map((item, index) => {
                      const percentage = totalBudget > 0 ? (item.amount / totalBudget) * 100 : 0;
                      const colors = [
                        "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"
                      ];
                      return (
                        <div key={item.id} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full h-4 bg-gray-700/50 rounded-md overflow-hidden">
                              <div 
                                className={`h-full rounded-md ${colors[index]}`}
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-xs text-white font-medium ml-2 flex items-center h-full">
                                  {formatValue(formatCurrency(item.amount))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CircleDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No budget items yet</p>
                <p className="text-sm text-gray-500">Start budgeting to track your monthly expenses</p>
              </div>
            )}
            </Card>
          </Link>
        </div>

        {/* Investments */}
        <div className="lg:col-span-1">
          <Link href="/dashboard/investments" className="block">
            <Card className="p-6 glassmorphism hover:bg-purple-500/5 transition-colors cursor-pointer h-[450px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Investments</h2>
                <span className="text-sm text-purple-400 hover:text-purple-300">View All →</span>
              </div>
            
            {investmentAccounts.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Value</p>
                      <p className="text-lg font-bold text-purple-400">
                        {formatValue(formatCurrency(totalInvestments))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Avg. Annual Return</p>
                      <p className="text-lg font-bold text-green-400">
                        {hideValues ? "••••%" : `${averageAnnualReturn.toFixed(2)}%`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Accounts */}
                <div className="space-y-3">
                  {investmentAccounts.slice(0, 3).map((account) => {
                    const convertedValue = convertToCAD(account.currentValue, account.currency, rates);
                    return (
                      <div key={account.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-400">{account.accountType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-400">
                            {formatValue(formatCurrency(convertedValue))}
                          </p>
                          <p className="text-sm text-green-400">
                            {hideValues ? "••••%" : `+${account.monthlyReturnPercent.toFixed(2)}%`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No investment accounts yet</p>
                <p className="text-sm text-gray-500">Start tracking your investments to see your portfolio performance</p>
              </div>
            )}
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
