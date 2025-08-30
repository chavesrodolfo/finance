"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter, Upload, Download, FileText, Info } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
  const [progress, setProgress] = useState<number | null>(null);
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
  setProgress(0);
  setImportSummary(null);
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
        setProgress(Math.round((uploadedTransactions.length + skippedTransactions.length) / csvData.length * 100));
      }

      // Send to API
      console.log('Sending transactions to API:', uploadedTransactions);
      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: uploadedTransactions }),
      });

      const responseData = await response.json();
      console.log('API response:', response.status, responseData);

      const toastDescription = `Successfully imported ${responseData.count} transactions.`;
      const reasons = skippedTransactions.map((skipped, idx) => `${idx + 1}. ${skipped.reason}`);
      setImportSummary({
        created: responseData.count,
        skipped: skippedTransactions.length,
        reasons,
      });
      setProgress(null);
      if (response.ok) {
        toast({
          title: "Upload successful",
          description: toastDescription,
        });
        fetchTransactions();
      } else {
        throw new Error(responseData.error || 'Failed to upload transactions');
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
  setProgress(null);
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
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            disabled={uploading}
            onClick={handleButtonClick}
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Import CSV'}
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Template
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/dashboard/transactions/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Progress and Import Summary */}
      {progress !== null && (
        <div className="w-full flex flex-col items-center my-4">
          <div className="w-1/2 bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="mt-2 text-sm text-gray-700">Importing CSV... {progress}%</span>
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

      {/* CSV Import/Export Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">CSV Import/Export</h4>
            <p className="text-blue-700 dark:text-blue-300 mb-2">
              Use CSV files to bulk import or export your transactions. Download the template to see the required format.
            </p>
            <div className="text-blue-600 dark:text-blue-400">
              <strong>Required columns:</strong> Date (YYYY-MM-DD), Description, Amount (negative for expenses), Type (EXPENSE/INCOME/EXPENSE_SAVINGS/RETURN), Category
            </div>
          </div>
        </div>
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
      <Card className="flex flex-col">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
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
          </div>
        )}
      </Card>
    </div>
  );
} 