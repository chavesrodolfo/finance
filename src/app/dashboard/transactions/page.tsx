"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
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

const transactionTypeLabels = {
  "EXPENSE": "Expense",
  "INCOME": "Income",
  "EXPENSE_SAVINGS": "Expense Savings",
  "RETURN": "Return"
};

export default function TransactionsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/transactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' || t.type === 'EXPENSE_SAVINGS')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link href="/dashboard/transactions/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>
      
      {/* Month controller */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
          
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
      
      {/* Month summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Income</span>
              <span className="text-2xl font-bold text-emerald-500">+${totalIncome.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="text-2xl font-bold text-rose-500">-${totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions List</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      {/* Transactions list */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <ScrollArea className="h-[600px]">
            {filteredTransactions.length > 0 ? (
              <div className="divide-y">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.category.color || '#6b7280' }}
                        />
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd/MM/yyyy")} • {transaction.category.name} • {transactionTypeLabels[transaction.type]}
                          </div>
                          {transaction.notes && (
                            <div className="text-xs text-gray-400 mt-1">{transaction.notes}</div>
                          )}
                        </div>
                      </div>
                      <div 
                        className={`font-medium ${
                          transaction.type === 'INCOME' 
                            ? 'text-emerald-500' 
                            : 'text-rose-500'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted/30 p-4 mb-4">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-4">
                  There are no transactions recorded for {format(currentDate, "MMMM yyyy")}.
                </p>
                <Link href="/dashboard/transactions/new">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add transaction
                  </Button>
                </Link>
              </div>
            )}
          </ScrollArea>
        )}
      </Card>
    </div>
  );
} 