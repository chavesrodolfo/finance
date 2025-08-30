"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stackClientApp } from "../stack.client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (!user) {
          router.push('/');
          return;
        }
        
        // Fetch transactions after user is confirmed
        await fetchTransactions();
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
      } finally {
        setLoading(false);
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
    .filter(t => t.type === 'EXPENSE' || t.type === 'EXPENSE_SAVINGS')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Get recent transactions (last 4)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Key metrics section with animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient-blue card-glass-effect card-with-glow card-blue-glow rounded-xl overflow-hidden animate-slide-up delay-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Total Balance</h3>
              <div className="bg-primary/10 p-2 rounded-full animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary animate-shimmer">${balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Current balance</p>
          </div>
          <div className="h-2 w-full bg-primary/30"></div>
        </Card>
        
        <Card className="card-gradient-green card-glass-effect card-with-glow card-green-glow rounded-xl overflow-hidden animate-slide-up delay-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Income</h3>
              <div className="bg-emerald-900/30 p-2 rounded-full animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-400">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400 animate-shimmer">${totalIncome.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="h-2 w-full bg-emerald-500/30"></div>
        </Card>
        
        <Card className="card-gradient-rose card-glass-effect card-with-glow rounded-xl overflow-hidden animate-slide-up delay-300">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Expenses</h3>
              <div className="bg-rose-900/30 p-2 rounded-full animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-rose-400">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-400 animate-shimmer">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="h-2 w-full bg-rose-500/30"></div>
        </Card>
      </div>
    
      {/* Transactions and budget section with animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glass-effect card-with-glow rounded-xl border border-gray-200/10 shadow-md animate-slide-up delay-400">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
              <select className="text-sm glass-light rounded-md px-2 py-1 bg-transparent">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This month</option>
              </select>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading transactions...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No recent transactions</div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME'
                          ? 'bg-emerald-900/30 text-emerald-400 animate-pulse-slow' 
                          : 'bg-rose-900/30 text-rose-400 animate-pulse-slow'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {transaction.category.name}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === 'INCOME'
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/transactions">
              <button className="w-full mt-6 text-center text-sm text-primary hover:text-primary/90 transition-colors font-medium">
                View all transactions →
              </button>
            </Link>
          </div>
        </Card>
        
        <Card className="card-glass-effect card-with-glow rounded-xl border border-gray-200/10 shadow-md animate-slide-up delay-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Monthly Budget</h3>
              <Link href="/dashboard/settings">
                <button className="text-sm text-primary px-2 py-1 rounded-md hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              </Link>
            </div>
            <div className="space-y-5">
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No Budget Set Up</h3>
                <p className="text-muted-foreground mb-4">
                  Create your monthly budget to track spending and financial goals.
                </p>
                <Link href="/dashboard/budget">
                  <Button variant="outline" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14m-7-7h14"/>
                    </svg>
                    Set Up Budget
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Spent</span>
                <span className="font-bold text-lg">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">This month</span>
                <span className="text-sm text-muted-foreground">${totalIncome.toFixed(2)} income</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 