"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { stackClientApp } from "../stack.client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (!user) {
          // Redirect to home if not authenticated
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Redirect to home on error
        router.push('/');
      }
    };

    fetchUser();
  }, [router]);

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
            <p className="text-3xl font-bold text-primary animate-shimmer">$12,580.00</p>
            <p className="text-sm text-muted-foreground mt-1">+5.2% from last month</p>
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
            <p className="text-3xl font-bold text-emerald-400 animate-shimmer">$4,850.00</p>
            <p className="text-sm text-muted-foreground mt-1">May 2025</p>
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
            <p className="text-3xl font-bold text-rose-400 animate-shimmer">$2,135.00</p>
            <p className="text-sm text-muted-foreground mt-1">May 2025</p>
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
              {[
                { name: 'Grocery Store', amount: -85.32, date: 'May 4, 2025', category: 'Food' },
                { name: 'Salary Deposit', amount: 2400.00, date: 'May 1, 2025', category: 'Income' },
                { name: 'Electric Bill', amount: -124.79, date: 'Apr 28, 2025', category: 'Utilities' },
                { name: 'Restaurant', amount: -52.45, date: 'Apr 25, 2025', category: 'Food' },
              ].map((transaction, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 
                        ? 'bg-emerald-900/30 text-emerald-400 animate-pulse-slow' 
                        : 'bg-rose-900/30 text-rose-400 animate-pulse-slow'
                    }`}>
                      {transaction.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date} • {transaction.category}</p>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    transaction.amount > 0 
                      ? 'text-emerald-400' 
                      : 'text-rose-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
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
              {[
                { category: 'Housing', spent: 1200, budget: 1200, percentage: 100 },
                { category: 'Food', spent: 380, budget: 500, percentage: 76 },
                { category: 'Transportation', spent: 120, budget: 200, percentage: 60 },
                { category: 'Entertainment', spent: 85, budget: 150, percentage: 57 },
                { category: 'Savings', spent: 500, budget: 800, percentage: 63 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm">
                      <span className="font-medium">${item.spent}</span>
                      <span className="text-muted-foreground"> / ${item.budget}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden animate-shimmer">
                    <div 
                      className={`h-full rounded-full ${
                        item.percentage > 90 ? 'bg-rose-500' : 
                        item.percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Spent</span>
                <span className="font-bold text-lg">$2,285.00</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Monthly budget</span>
                <span className="text-sm text-muted-foreground">$2,850.00</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 