"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { EditBudgetDialog } from "@/components/budget/edit-budget-dialog";
import { formatCurrency } from "@/lib/utils";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";
import { useAccountContext } from "@/hooks/useAccountContext";

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
}

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const { apiFetch } = useAccountAwareApi();
  const { currentAccount } = useAccountContext();

  const fetchBudgetItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch('/api/budget');
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget items');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching budget items:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch budget items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  // Refetch data when account context changes
  useEffect(() => {
    if (currentAccount) {
      fetchBudgetItems();
    }
  }, [currentAccount]);
  
  // Calculate total
  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);

  // Get top expense categories
  const topExpenses = [...items]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleEditItem = (item: BudgetItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchBudgetItems();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]"><Skeleton className="h-4 w-12" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="w-[100px] text-right"><Skeleton className="h-4 w-12" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-40 mb-3" />
                  <Skeleton className="h-9 w-32" />
                </div>
                
                <div className="pt-4 border-t">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => {
                      const widths = [80, 65, 45, 30, 25]; // Deterministic widths
                      return (
                        <div key={i} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-10" />
                          </div>
                          <div className="flex items-center">
                            <div className="w-full h-6 bg-muted rounded-md overflow-hidden">
                              <Skeleton 
                                className="h-full rounded-md" 
                                style={{ width: `${widths[i]}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-4 w-full rounded-full mb-4" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Budget</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget</h1>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>Monthly Budget</CardTitle>
            <div className="text-sm text-muted-foreground">
              {items.length} items
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No Budget Items</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding budget categories to track your monthly spending.
                </p>
                <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Budget Item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="capitalize">{item.period.toLowerCase()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totalBudget)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No budget items to analyze.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Total Monthly Budget</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Top Expenses</h3>
                  <div className="space-y-4">
                    {topExpenses.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="group">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{item.name}</span>
                          <span>{((item.amount / totalBudget) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full h-6 bg-muted rounded-md overflow-hidden">
                            <div 
                              className={`h-full rounded-md ${
                                index === 0 ? "bg-blue-500" :
                                index === 1 ? "bg-emerald-500" :
                                index === 2 ? "bg-amber-500" :
                                index === 3 ? "bg-rose-500" :
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
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Budget Distribution</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Visual breakdown showing how your budget is allocated across different categories. Each color represents a budget item proportional to its amount.
                  </p>
                  <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-4">
                    {items
                      .sort((a, b) => b.amount - a.amount)
                      .map((item, index) => {
                        const percentage = (item.amount / totalBudget) * 100;
                        const colors = [
                          "bg-blue-500", "bg-red-500", "bg-green-500", 
                          "bg-yellow-500", "bg-purple-500", "bg-pink-500",
                          "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
                        ];
                        return (
                          <div
                            key={item.id}
                            className={`h-full ${colors[index % colors.length]} inline-block`}
                            style={{ width: `${percentage}%` }}
                          />
                        );
                      })}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {items
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 8)
                      .map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? "bg-blue-500" :
                              index === 1 ? "bg-red-500" :
                              index === 2 ? "bg-green-500" :
                              index === 3 ? "bg-yellow-500" :
                              index === 4 ? "bg-purple-500" :
                              index === 5 ? "bg-pink-500" :
                              index === 6 ? "bg-indigo-500" :
                              "bg-teal-500"
                            }`} 
                          />
                          <span className="text-xs truncate">{item.name}</span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <p className="text-xl font-medium">{items.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddBudgetDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSuccess={handleDialogSuccess}
      />
      
      <EditBudgetDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSuccess={handleDialogSuccess}
        budgetItem={selectedItem}
      />
    </div>
  );
} 