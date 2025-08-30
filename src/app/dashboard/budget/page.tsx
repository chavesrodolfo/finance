"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, UploadCloud, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
}

export default function BudgetPage() {
  const [items] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // TODO: Fetch budget items from API
    setLoading(false);
  }, []);
  
  // Calculate total
  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);

  // Get top expense categories
  const topExpenses = [...items]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calculate percentages for top expenses
  const maxAmount = Math.max(...topExpenses.map(item => item.amount), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Budget</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading budget...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button className="flex items-center gap-2">
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
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Budget Item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Category</TableHead>
                    <TableHead className="text-right">Amount (CA$)</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">CA${item.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">CA${totalBudget.toFixed(2)}</TableCell>
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
                  <p className="text-3xl font-bold">CA${totalBudget.toFixed(2)}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Top 3 Categories</h3>
                  <div className="space-y-3">
                    {topExpenses.slice(0, 3).map((item) => (
                      <div key={item.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span className="font-medium">CA${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Budget Analysis Available</h3>
              <p className="text-muted-foreground">
                Add budget items to see detailed analysis and distribution.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Top Expenses</h3>
                <div className="space-y-4">
                  {topExpenses.map((item, index) => (
                    <div key={item.id} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.category}</span>
                        <span>{((item.amount / totalBudget) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full h-8 bg-muted rounded-md overflow-hidden group-hover:h-9 transition-all">
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
                              CA${item.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Budget Distribution</h3>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-4">
                  {items
                    .sort((a, b) => b.amount - a.amount)
                    .map((item, index) => {
                      const percentage = (item.amount / totalBudget) * 100;
                      // Choose different colors for each item (simplified)
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
                        <span className="text-xs truncate">{item.category}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <p className="text-xl font-medium">{items.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Average</span>
                      <p className="text-xl font-medium">CA${(totalBudget / items.length).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 