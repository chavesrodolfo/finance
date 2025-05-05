"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import Link from "next/link";

// Dados mock de transações para demonstração
const mockTransactions = [
  { id: 1, date: new Date(2025, 4, 4), amount: -85.32, description: "Grocery Store", category: "Food", type: "Expense" },
  { id: 2, date: new Date(2025, 4, 1), amount: 2400.00, description: "Salary Deposit", category: "Income", type: "Income" },
  { id: 3, date: new Date(2025, 3, 28), amount: -124.79, description: "Electric Bill", category: "Utilities", type: "Expense" },
  { id: 4, date: new Date(2025, 3, 25), amount: -52.45, description: "Restaurant", category: "Food", type: "Expense" },
  { id: 5, date: new Date(2025, 4, 10), amount: -35.99, description: "Internet", category: "Utilities", type: "Expense" },
  { id: 6, date: new Date(2025, 4, 15), amount: -67.50, description: "Car (gas)", category: "Car", type: "Expense" },
  { id: 7, date: new Date(2025, 4, 18), amount: -150.00, description: "Clothing", category: "Personal Stuff", type: "Expense" },
  { id: 8, date: new Date(2025, 4, 20), amount: -42.00, description: "Pharmacy", category: "Health/medical", type: "Expense" },
  { id: 9, date: new Date(2025, 4, 22), amount: -18.75, description: "Coffee", category: "Food", type: "Expense" },
  { id: 10, date: new Date(2025, 4, 5), amount: -1200.00, description: "Mortgage", category: "Home", type: "Expense" },
  { id: 11, date: new Date(2025, 4, 8), amount: 500.00, description: "Bonus", category: "Income", type: "Income" },
  { id: 12, date: new Date(2025, 4, 12), amount: -89.99, description: "Mobile phone", category: "Utilities", type: "Expense" },
  { id: 13, date: new Date(2025, 4, 25), amount: -60.00, description: "Gym", category: "Health/medical", type: "Expense" },
  { id: 14, date: new Date(2025, 4, 27), amount: -45.50, description: "Liquor Store", category: "Recreation", type: "Expense" },
  { id: 15, date: new Date(2025, 4, 30), amount: -22.99, description: "Groceries", category: "Food", type: "Expense" },
];

export default function TransactionsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Função para avançar para o próximo mês
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Função para voltar para o mês anterior
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Filtrar transações para o mês atual
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const transDate = new Date(transaction.date);
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    return transDate >= firstDay && transDate <= lastDay;
  });
  
  // Calcular totais para o mês
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const balance = totalIncome - totalExpense;

  return (
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
          
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          
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
              <span className="text-2xl font-bold text-rose-500">-${totalExpense.toFixed(2)}</span>
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
        <ScrollArea className="h-[600px]">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y">
              {filteredTransactions
                .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date (most recent first)
                .map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${transaction.amount > 0 
                            ? 'bg-emerald-900/30 text-emerald-400' 
                            : 'bg-rose-900/30 text-rose-400'
                          }`}
                      >
                        {transaction.amount > 0 ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(transaction.date, "dd/MM/yyyy")} • {transaction.category} • {transaction.type}
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`font-medium ${
                        transaction.amount > 0 
                          ? 'text-emerald-500' 
                          : 'text-rose-500'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
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
                There are no transactions recorded for {format(currentMonth, "MMMM yyyy")}.
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
      </Card>
    </div>
  );
} 