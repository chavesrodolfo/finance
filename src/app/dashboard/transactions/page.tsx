"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter, Upload, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { TransactionActions } from "@/components/transactions/actions-dropdown";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { iconMap } from "@/lib/category-icons";
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

interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

const transactionTypeLabels = {
  "EXPENSE": "Expense",
  "INCOME": "Income",
  "EXPENSE_SAVINGS": "Expense Savings",
  "RETURN": "Return"
};

export default function TransactionsPage() {
  const [importPhase, setImportPhase] = useState<'uploading' | 'processing' | null>(null);
  const [progressDetails, setProgressDetails] = useState<{ processed: number; total: number; created: number; skipped: number } | null>(null);
  const [importSummary, setImportSummary] = useState<null | { created: number; skipped: number; reasons: string[]; lineNumbers: number[] }>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { apiFetch } = useAccountAwareApi();
  const { currentAccount } = useAccountContext();
  
  // Edit and delete state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch('/api/transactions');

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
  }, [apiFetch]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiFetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [apiFetch]);

  // Only fetch data when account context is ready and available
  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
      fetchCategories();
    }
  }, [currentAccount, fetchTransactions, fetchCategories]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    try {
      const response = await apiFetch(`/api/transactions/${deletingTransaction.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
        fetchTransactions();
        setDeletingTransaction(null);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleTransactionUpdated = () => {
    fetchTransactions();
  };

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
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Helper function to parse CSV line handling quoted values
    const parseCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result.map(val => val.replace(/^"|"$/g, ''));
    };
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        if (values[index] && values[index].trim() !== '') {
          row[header] = values[index];
        }
      });
      
      // Only add rows that have meaningful data
      if (Object.keys(row).length > 0) {
        data.push(row);
      }
    }
    
    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

  setUploading(true);
  setImportSummary(null);
  setImportPhase('uploading');
  setProgressDetails(null);
    try {
      const text = await file.text();
      console.log('File content:', text.substring(0, 500) + '...');
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        toast({
          title: "Empty file",
          description: "The CSV file appears to be empty or invalid.",
          variant: "destructive",
        });
        return;
      }

      setImportPhase('processing');

      // Process each row and create transactions
      const uploadedTransactions = [];
      const skippedTransactions: { row: Record<string, string>; reason: string; lineNumber: number }[] = [];

      // Function to map CSV transaction types to database types
      const mapTransactionType = (csvType: string): string => {
        const normalizedType = csvType.trim().toLowerCase();

        // Map various CSV type formats to database types
        const typeMap: { [key: string]: string } = {
          // Standard formats
          'expense': 'EXPENSE',
          'expenses': 'EXPENSE',
          'income': 'INCOME',
          'return': 'RETURN',

          // Expense Savings variations
          'expense savings': 'EXPENSE_SAVINGS',
          'expense_savings': 'EXPENSE_SAVINGS',
          'expensesavings': 'EXPENSE_SAVINGS',
          'savings': 'EXPENSE_SAVINGS',
          'saving': 'EXPENSE_SAVINGS',

          // Common variations
          'spend': 'EXPENSE',
          'spending': 'EXPENSE',
          'payment': 'EXPENSE',
          'debit': 'EXPENSE',
          'credit': 'INCOME',
          'deposit': 'INCOME',
          'refund': 'RETURN',
          'reimbursement': 'RETURN'
        };

        return typeMap[normalizedType] || 'EXPENSE'; // Default to EXPENSE if not found
      };

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        // Match the provided template format exactly
        const cleanAmount = (val: string) => {
          if (!val) return 0;
          // Remove currency symbols and commas
          return parseFloat(val.replace(/[^\d.-]/g, ''));
        };
        const transaction = {
          amount: cleanAmount(row['Amount'] || row['amount'] || ''),
          description: row['Description'] || row['description'] || '',
          notes: row['Details'] || row['details'] || '',
          date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
          type: mapTransactionType(row['Type'] || row['type'] || 'EXPENSE'),
          categoryName: row['Category'] || row['category'] || 'Other'
        };
        // Collect reasons for skipping
        let skipReason = '';
        if (transaction.amount === 0) {
          skipReason += 'Amount is zero or missing. ';
        }
        // Description is now optional
        if (skipReason) {
          // CSV line number is i + 2 (accounting for 0-index and header row)
          skippedTransactions.push({ row, reason: skipReason, lineNumber: i + 2 });
        } else {
          uploadedTransactions.push(transaction);
        }
        // Update progress details during local processing
        setProgressDetails({
          processed: uploadedTransactions.length + skippedTransactions.length,
          total: csvData.length,
          created: uploadedTransactions.length,
          skipped: skippedTransactions.length
        });
      }

      // Generate unique job ID
      const jobId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Send to API with job ID
      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: uploadedTransactions, jobId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start import process');
      }

      // Start polling for progress
      let completed = false;
      const startTime = Date.now();
      const maxWaitTime = 5 * 60 * 1000; // 5 minutes timeout

      while (!completed && (Date.now() - startTime) < maxWaitTime) {
        try {
          const progressResponse = await fetch(`/api/transactions/bulk?jobId=${jobId}`);
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            
            // Update progress details from API
            
            setProgressDetails({
              processed: progressData.processed,
              total: progressData.total,
              created: progressData.created,
              skipped: progressData.skipped
            });
            
            if (progressData.completed) {
              completed = true;

              const reasons = skippedTransactions.map((skipped) => `Line ${skipped.lineNumber}: ${skipped.reason}`);
              const lineNumbers = skippedTransactions.map((skipped) => skipped.lineNumber);
              setImportSummary({
                created: progressData.created,
                skipped: progressData.skipped + skippedTransactions.length,
                reasons,
                lineNumbers,
              });
              
              const toastDescription = `Successfully imported ${progressData.created} transactions.`;
              toast({
                title: "Import successful",
                description: toastDescription,
              });
              
              fetchTransactions();
            } else if (progressData.error) {
              throw new Error(progressData.error);
            }
          }
        } catch (pollError) {
          console.error('Error polling progress:', pollError);
          // Continue polling unless it's a critical error
        }
        
        // Wait before next poll
        if (!completed) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
        }
      }
      
      if (!completed) {
        throw new Error('Import process timed out');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your CSV file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setImportPhase(null);
      setProgressDetails(null);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Notes'];
    const csvData = filteredTransactions.map(transaction => [
      transaction.date,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category.name,
      transaction.notes || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(currentDate, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `Exported ${filteredTransactions.length} transactions for ${format(currentDate, 'MMMM yyyy')}.`,
    });
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Notes'];
    const templateData = [
      ['2025-08-30', 'Grocery Shopping', '-75.50', 'EXPENSE', 'Food', 'Weekly groceries'],
      ['2025-08-30', 'Freelance Payment', '500.00', 'INCOME', 'Work', 'Web development project'],
      ['2025-08-30', 'Emergency Fund', '-100.00', 'EXPENSE_SAVINGS', 'Savings', 'Monthly savings contribution'],
      ['2025-08-30', 'Store Refund', '25.99', 'RETURN', 'Shopping', 'Returned defective item'],
      ['2025-08-29', 'Coffee Shop', '-4.50', 'Expense', 'Food', 'Morning coffee'],
      ['2025-08-29', 'Investment Transfer', '-200.00', 'Expense Savings', 'Investment', 'Monthly investment'],
      ['2025-08-29', 'Salary Deposit', '3000.00', 'Income', 'Work', 'Monthly salary']
    ];

    const csvContent = [
      templateHeaders.join(','),
      ...templateData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template downloaded",
      description: "CSV template shows supported transaction types: Expense, Income, Expense Savings, and Return.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Month controller skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-10" />
          </CardHeader>
        </Card>
        
        {/* Month summary skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50/10">
            <CardContent className="p-6">
              <div className="flex flex-col">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50/10">
            <CardContent className="p-6">
              <div className="flex flex-col">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50/10">
            <CardContent className="p-6">
              <div className="flex flex-col">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        
        {/* Transactions list skeleton */}
        <Card className="flex flex-col">
          <div className="divide-y">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
          {uploading ? (
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              disabled={true}
            >
              <Upload className="h-4 w-4" />
              {importPhase === 'uploading' ? 'Processing...' : 'Importing...'}
            </Button>
          ) : (
            <TransactionActions 
              onImportCSV={handleButtonClick}
              onExportCSV={handleExportCSV}
              onDownloadTemplate={handleDownloadTemplate}
            />
          )}
        </div>
      </div>
      
      {/* Import Status */}
      {uploading && (
        <div className="w-full flex justify-center items-center my-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div className="text-sm">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                {importPhase === 'uploading' ? 'Processing CSV file...' : 
                 importPhase === 'processing' && progressDetails ? `Saving ${progressDetails.total} transactions to database...` : 'Importing...'}
              </div>
            </div>
          </div>
        </div>
      )}
      {importSummary && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-foreground">CSV Import Summary</h2>
            <div className="space-y-2 mb-4">
              <p className="text-foreground">
                Created: <span className="font-mono font-semibold text-emerald-500">{importSummary.created}</span>
              </p>
              <p className="text-foreground">
                Skipped: <span className="font-mono font-semibold text-amber-500">{importSummary.skipped}</span>
              </p>
            </div>
            {importSummary.reasons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="font-semibold mb-3 text-foreground">Skipped rows (CSV line numbers):</p>
                <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
                  {importSummary.reasons.slice(0, 10).map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                  {importSummary.reasons.length > 10 && (
                    <li className="text-amber-500">...and {importSummary.reasons.length - 10} more skipped rows.</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      
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
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Income</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400">+{formatCurrency(totalIncome)}</p>
            <p className="text-sm text-muted-foreground mt-1">{format(currentDate, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Expenses</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">-{formatCurrency(totalExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">{format(currentDate, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Balance</h3>
              <div className="bg-muted/30 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(balance))}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Current balance</p>
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
      <Card className="flex flex-col">
        {loading ? (
          <div className="divide-y">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <div>
            {filteredTransactions.length > 0 ? (
              <div className="divide-y">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-4 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {(() => {
                          const IconComponent = iconMap[transaction.category.icon || "Tag"];
                          return <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
                        })()}
                        <div className="flex-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd/MM/yyyy")} • {transaction.category.name} • {transactionTypeLabels[transaction.type]}
                          </div>
                          {transaction.notes && (
                            <div className="text-xs text-gray-400 mt-1">{transaction.notes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className={`font-medium ${
                            transaction.type === 'INCOME' 
                              ? 'text-emerald-500' 
                              : 'text-rose-500'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingTransaction(transaction)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
          </div>
        )}
      </Card>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
        categories={categories}
        onTransactionUpdated={handleTransactionUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        title="Delete Transaction"
        description={`Are you sure you want to delete the transaction "${deletingTransaction?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTransaction}
        isDestructive={true}
        isLoading={false}
      />
    </div>
  );
} 