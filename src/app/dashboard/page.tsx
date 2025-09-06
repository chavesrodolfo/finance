"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { stackClientApp } from "../stack.client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetricCardSkeleton, TransactionListSkeleton, BudgetCardSkeleton, InvestmentCardSkeleton } from "@/components/dashboard/skeletons";
import { formatCurrency } from "@/lib/utils";
import { iconMap } from "@/lib/category-icons";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp, CircleDollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useHideValues } from "@/hooks/use-hide-values";
import { convertToCAD } from "@/lib/currency";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";
import { useAccountContext } from "@/hooks/useAccountContext";

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
  const { apiFetch } = useAccountAwareApi();
  const { currentAccount } = useAccountContext();

  // State for card flip functionality
  const [flippedCards, setFlippedCards] = useState<{income: boolean, expenses: boolean}>({
    income: false,
    expenses: false
  });
  const [selectedMonths, setSelectedMonths] = useState<{income: Date, expenses: Date}>({
    income: new Date(),
    expenses: new Date()
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (!user) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [router]);

  // Only fetch data when account context is ready and available
  useEffect(() => {
    if (currentAccount) {
      setLoading(true);
      Promise.all([
        fetchTransactions(),
        fetchBudgetItems(),
        fetchInvestmentAccounts()
      ]).finally(() => setLoading(false));
    }
  }, [currentAccount]);

  const fetchTransactions = async () => {
    try {
      const response = await apiFetch('/api/transactions');
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
      const response = await apiFetch('/api/budget');
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
      const response = await apiFetch('/api/investment-accounts');
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
    const convertedValue = convertToCAD(account.currentValue, account.currency);
    return sum + convertedValue;
  }, 0);

  const averageAnnualReturn = investmentAccounts.length > 0 
    ? investmentAccounts.reduce((sum, account) => sum + account.annualReturnPercent, 0) / investmentAccounts.length
    : 0;

  // Helper functions for card flip functionality
  const calculateMonthlyAmount = (month: Date, type: 'INCOME' | 'EXPENSE') => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month.getMonth() && 
             transactionDate.getFullYear() === month.getFullYear();
    });

    return monthTransactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleCardClick = (cardType: 'income' | 'expenses') => {
    setFlippedCards(prev => ({
      ...prev,
      [cardType]: !prev[cardType]
    }));
  };

  const handleMonthChange = (cardType: 'income' | 'expenses', direction: 'prev' | 'next') => {
    setSelectedMonths(prev => {
      const currentMonth = new Date(prev[cardType]);
      const newMonth = new Date(currentMonth);
      
      if (direction === 'prev') {
        newMonth.setMonth(currentMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      return {
        ...prev,
        [cardType]: newMonth
      };
    });
    
    // Auto-flip back to front after changing month
    setTimeout(() => {
      setFlippedCards(prev => ({
        ...prev,
        [cardType]: false
      }));
    }, 300);
  };

  // Calculate totals for dashboard cards
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  // Calculate income and expenses based on whether a custom month is selected
  const hasCustomIncomeMonth = selectedMonths.income.getMonth() !== new Date().getMonth() || 
                               selectedMonths.income.getFullYear() !== new Date().getFullYear();
  const hasCustomExpensesMonth = selectedMonths.expenses.getMonth() !== new Date().getMonth() || 
                                selectedMonths.expenses.getFullYear() !== new Date().getFullYear();

  const monthlyIncome = hasCustomIncomeMonth
    ? calculateMonthlyAmount(selectedMonths.income, 'INCOME')
    : currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = hasCustomExpensesMonth
    ? calculateMonthlyAmount(selectedMonths.expenses, 'EXPENSE')
    : currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // Get the display month for each card
  const getDisplayMonth = (cardType: 'income' | 'expenses') => {
    if (cardType === 'income' && hasCustomIncomeMonth) {
      return selectedMonths.income;
    }
    if (cardType === 'expenses' && hasCustomExpensesMonth) {
      return selectedMonths.expenses;
    }
    return new Date();
  };

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
            <InvestmentCardSkeleton />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Income Card with Flip */}
        <div className={`flip-card ${flippedCards.income ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* Front Side */}
            <Card className="p-6 glassmorphism flip-card-front cursor-pointer h-full" onClick={() => handleCardClick('income')}>
              <div className="flex items-center space-x-4 min-h-[120px]">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {getDisplayMonth('income').toLocaleDateString('en-US', { month: 'long', year: hasCustomIncomeMonth ? 'numeric' : undefined })} Income
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatValue(formatCurrency(monthlyIncome))}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Back Side - Month Selector */}
            <Card className="p-6 glassmorphism flip-card-back h-full cursor-pointer" onClick={() => handleCardClick('income')}>
              <div className="flex flex-col h-full justify-center space-y-4">
                <h3 className="text-lg font-semibold">Select Month</h3>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMonthChange('income', 'prev');
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {selectedMonths.income.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMonthChange('income', 'next');
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Expenses Card with Flip */}
        <div className={`flip-card ${flippedCards.expenses ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* Front Side */}
            <Card className="p-6 glassmorphism flip-card-front cursor-pointer h-full" onClick={() => handleCardClick('expenses')}>
              <div className="flex items-center space-x-4 min-h-[120px]">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <CircleDollarSign className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {getDisplayMonth('expenses').toLocaleDateString('en-US', { month: 'long', year: hasCustomExpensesMonth ? 'numeric' : undefined })} Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatValue(formatCurrency(monthlyExpenses))}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Back Side - Month Selector */}
            <Card className="p-6 glassmorphism flip-card-back h-full cursor-pointer" onClick={() => handleCardClick('expenses')}>
              <div className="flex flex-col h-full justify-center space-y-4">
                <h3 className="text-lg font-semibold">Select Month</h3>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMonthChange('expenses', 'prev');
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {selectedMonths.expenses.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMonthChange('expenses', 'next');
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Total Budget Card */}
        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4 min-h-[120px]">
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

        {/* Total Investments Card */}
        <Card className="p-6 glassmorphism">
          <div className="flex items-center space-x-4 min-h-[120px]">
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
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => {
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
                })
              ) : (
                <div className="text-center py-8">
                  <CircleDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No transactions yet</p>
                  <p className="text-sm text-gray-500">Start adding transactions to track your expenses and income</p>
                </div>
              )}
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

                {/* Top Accounts by Balance */}
                <div className="space-y-3">
                  {investmentAccounts
                    .map(account => ({
                      ...account,
                      convertedValue: convertToCAD(account.currentValue, account.currency)
                    }))
                    .sort((a, b) => b.convertedValue - a.convertedValue)
                    .slice(0, 3)
                    .map((account) => {
                      return (
                        <div key={account.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-gray-400">{account.accountType}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-400">
                              {formatValue(formatCurrency(account.convertedValue))}
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
