"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { TransactionActions } from "@/components/transactions/actions-dropdown";

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
  const [importPhase, setImportPhase] = useState<'uploading' | 'processing' | null>(null);
  const [progressDetails, setProgressDetails] = useState<{ processed: number; total: number; created: number; skipped: number } | null>(null);
  const [importSummary, setImportSummary] = useState<null | { created: number; skipped: number; reasons: string[] }>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    console.log('Button clicked');
    if (fileInputRef.current) {
      console.log('File input found, triggering click');
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

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

  useEffect(() => {
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
    console.log('handleFileUpload called', event.target.files);
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type);

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
      console.log('Parsed CSV data:', csvData);
      console.log('CSV headers found:', csvData.length > 0 ? Object.keys(csvData[0]) : 'No data');
      
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
      const skippedTransactions = [];
      for (const row of csvData) {
        console.log('Processing CSV row:', row);
        // Get all available keys to help with debugging
        const availableKeys = Object.keys(row);
        console.log('Available CSV columns:', availableKeys);
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
          type: (row['Type'] || row['type'] || 'EXPENSE').toUpperCase(),
          categoryName: row['Category'] || row['category'] || 'Other'
        };
        console.log('Mapped transaction:', transaction);
        // Collect reasons for skipping
        let skipReason = '';
        if (transaction.amount === 0) {
          skipReason += 'Amount is zero or missing. ';
        }
        // Description is now optional
        if (skipReason) {
          skippedTransactions.push({ row, reason: skipReason });
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
      console.log('Sending transactions to API:', uploadedTransactions.length, 'transactions with jobId:', jobId);
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
            console.log('Progress data:', progressData);
            
            // Update progress details from API
            
            setProgressDetails({
              processed: progressData.processed,
              total: progressData.total,
              created: progressData.created,
              skipped: progressData.skipped
            });
            
            if (progressData.completed) {
              completed = true;
              
              const reasons = skippedTransactions.map((skipped, idx) => `${idx + 1}. ${skipped.reason}`);
              setImportSummary({
                created: progressData.created,
                skipped: progressData.skipped + skippedTransactions.length,
                reasons,
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
      ['2025-08-30', 'Sample Expense', '-50.00', 'EXPENSE', 'Food', 'Lunch at restaurant'],
      ['2025-08-30', 'Sample Income', '100.00', 'INCOME', 'Payroll', 'Freelance payment'],
      ['2025-08-30', 'Sample Savings', '-25.00', 'EXPENSE_SAVINGS', 'Savings', 'Emergency fund']
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
      description: "CSV template with sample data has been downloaded.",
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
        <div className="w-full flex flex-col items-center my-4 p-4 bg-white border rounded shadow">
          <h2 className="text-lg font-bold mb-2">CSV Import Summary</h2>
          <p className="mb-1">Created: <span className="font-mono">{importSummary.created}</span></p>
          <p className="mb-1">Skipped: <span className="font-mono">{importSummary.skipped}</span></p>
          {importSummary.reasons.length > 0 && (
            <div className="mt-2 text-left w-full">
              <p className="font-semibold">Reasons for skipped transactions:</p>
              <ul className="list-disc ml-6 text-sm">
                {importSummary.reasons.slice(0, 10).map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
                {importSummary.reasons.length > 10 && (
                  <li>...and {importSummary.reasons.length - 10} more.</li>
                )}
              </ul>
            </div>
          )}
        </div>
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
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Income</span>
              <span className="text-2xl font-bold text-emerald-500">+{formatCurrency(totalIncome)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="text-2xl font-bold text-rose-500">-{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {balance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(balance))}
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
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
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
    </div>
  );
} 