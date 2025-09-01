"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { stackClientApp } from "../stack.client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetricCardSkeleton, TransactionListSkeleton, BudgetCardSkeleton } from "@/components/dashboard/skeletons";
import { formatCurrency } from "@/lib/utils";
import { iconMap } from "@/lib/category-icons";

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

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (!user) {
          router.push('/');
          return;
        }
        
        // Fetch transactions and budget data after user is confirmed
        await Promise.all([fetchTransactions(), fetchBudget()]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push('/');
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const fetchBudget = async () => {
      try {
        const response = await fetch('/api/budget');
        
        if (response.ok) {
          const data = await response.json();
          setBudgetItems(data);
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    };

    fetchUser();
  }, [router]);


  // Calculate summary data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenseSavings = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE_SAVINGS')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses - totalExpenseSavings;

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate budget summary
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const topBudgetItems = [...budgetItems]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Month indicator */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
          </h2>
        </div>
        
        {/* Key metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        
        {/* Transactions and budget skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionListSkeleton />
          <BudgetCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Month indicator */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
        </h2>
      </div>

      {/* Key metrics section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Total Balance</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">${balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Current balance</p>
          </div>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Income</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400">${totalIncome.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Expenses</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Expense Savings</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-400">${totalExpenseSavings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </Card>
      </div>
    
      {/* Transactions and budget section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground">Recent Transactions</h3>
            </div>
            <div className="space-y-3 flex-grow">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-3 text-muted-foreground">No recent transactions</div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent = iconMap[transaction.category.icon || "Tag"];
                        return (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'INCOME'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {transaction.category.name}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === 'INCOME'
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/transactions" className="block w-full mt-6 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium py-2 border border-border/30 rounded-md hover:bg-muted/10">
              View all transactions →
            </Link>
          </div>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-4 flex flex-col h-full">
            <div className="mb-4">
              <h3 className="text-base font-medium text-foreground">Monthly Budget</h3>
            </div>
            <div className="space-y-3 flex-grow">
              {budgetItems.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium mb-2">No Budget Set Up</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create your monthly budget to track spending and financial goals.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(totalBudget)}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-border/30">
                    <h4 className="text-base font-medium mb-3 text-foreground">Top Expenses</h4>
                    <div className="space-y-3">
                      {topBudgetItems.map((item, index) => (
                        <div key={item.id} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <span className="text-muted-foreground">{((item.amount / totalBudget) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full h-4 bg-muted/30 rounded-md overflow-hidden">
                              <div 
                                className={`h-full rounded-md ${
                                  index === 0 ? "bg-blue-500" :
                                  index === 1 ? "bg-emerald-500" :
                                  index === 2 ? "bg-amber-500" :
                                  "bg-purple-500"
                                }`}
                                style={{ width: `${(item.amount / totalBudget) * 100}%` }}
                              >
                                <span className="text-xs text-white font-medium ml-2 flex items-center h-full">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {budgetItems.length > 0 && (
                    <div className="pt-3 border-t border-border/30">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Total Spent</span>
                        <span className="font-bold text-lg text-foreground">${totalExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">Budget: {formatCurrency(totalBudget)}</span>
                        <span className="text-sm text-muted-foreground">
                          {((totalExpenses / totalBudget) * 100).toFixed(0)}% used
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link href="/dashboard/budget" className="block w-full mt-6 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium py-2 border border-border/30 rounded-md hover:bg-muted/10">
              {budgetItems.length === 0 ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2">
                    <path d="M12 5v14m-7-7h14"/>
                  </svg>
                  Set Up Budget
                </>
              ) : (
                "View Full Budget →"
              )}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 