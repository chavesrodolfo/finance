"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Target,
  Calculator,
  PieChart,
} from "lucide-react";
import { InvestmentAccountForm } from "@/components/investment-account-form";
import { DeleteInvestmentAccountDialog } from "@/components/delete-investment-account-dialog";
import { format } from "date-fns";
import { convertToCAD, formatCurrency } from "@/lib/currency";

interface InvestmentAccount {
  id: string;
  name: string;
  accountType: string;
  currentValue: number;
  currency: string;
  monthlyReturnPercent: number;
  annualReturnPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface InvestmentAccountDrawerProps {
  account: InvestmentAccount;
  showAmounts: boolean;
  onAccountChanged: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentAccountDrawer({ 
  account, 
  showAmounts, 
  onAccountChanged, 
  open, 
  onOpenChange 
}: InvestmentAccountDrawerProps) {
  const monthlyReturn = (account.currentValue * (account.monthlyReturnPercent / 100));
  const annualReturn = (account.currentValue * (account.annualReturnPercent / 100));
  const projectedValue = account.currentValue + annualReturn;
  
  // Calculate CAD equivalents if not already in CAD
  const cadValue = convertToCAD(account.currentValue, account.currency);
  const showCADConversion = account.currency !== 'CAD';
  
  // Calculate some mock portfolio metrics for demonstration
  const portfolioAllocation = Math.min((account.currentValue / 100000) * 100, 100); // Mock total portfolio of 100k
  const riskLevel = account.accountType === 'TFSA' ? 'Conservative' : 
                   account.accountType === 'RRSP' ? 'Moderate' :
                   account.accountType === 'Savings' ? 'Conservative' :
                   account.accountType === 'Crypto' ? 'Aggressive' : 'Moderate';
  const timeHorizon = account.accountType === 'TFSA' ? '5-10 years' :
                     account.accountType === 'RRSP' ? '20+ years' :
                     account.accountType === 'Savings' ? '1-3 years' :
                     account.accountType === 'Crypto' ? '1-5 years' : '3-10 years';

  const getAccountTypeColor = (type: string) => {
    const colors = {
      'TFSA': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'RRSP': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'FHSA': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Savings': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Taxable': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'RESP': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'RDSP': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Crypto': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservative': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'Aggressive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="bottom" className="max-h-[85vh] sm:max-w-none">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="text-left pb-2">
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle className="text-xl">{account.name}</DrawerTitle>
                <DrawerDescription className="mt-2">
                  Detailed investment account information and performance metrics
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
              {/* Account Overview Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Account Overview</h3>
                    <Badge variant="secondary" className={getAccountTypeColor(account.accountType)}>
                      {account.accountType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="text-2xl font-bold">
                        {showAmounts ? formatCurrency(account.currentValue, account.currency) : "••••••"}
                      </p>
                      {showAmounts && showCADConversion && (
                        <p className="text-sm text-muted-foreground">
                          ≈ CAD${cadValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="text-lg font-medium">{account.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-medium">Performance</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Monthly</p>
                      <p className="text-lg font-bold text-emerald-500">
                        +{account.monthlyReturnPercent.toFixed(2)}%
                      </p>
                      {showAmounts && (
                        <p className="text-xs text-muted-foreground">
                          +${monthlyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Annual</p>
                      <p className="text-lg font-bold text-emerald-500">
                        +{account.annualReturnPercent.toFixed(2)}%
                      </p>
                      {showAmounts && (
                        <p className="text-xs text-muted-foreground">
                          +${annualReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {showAmounts && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Projected Year-End</span>
                        <span className="font-medium">${projectedValue.toLocaleString('en-US')}</span>
                      </div>
                      <Progress value={(annualReturn / account.currentValue) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Portfolio Analytics */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium">Portfolio Analytics</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Portfolio Allocation</span>
                      <span className="font-medium">{portfolioAllocation.toFixed(1)}%</span>
                    </div>
                    <Progress value={portfolioAllocation} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <p className={`text-sm font-medium ${getRiskColor(riskLevel)}`}>
                        {riskLevel}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Time Horizon</p>
                      <p className="text-sm font-medium">{timeHorizon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 mt-4">
              {/* Account Details */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium">Account Details</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">
                        {format(new Date(account.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm font-medium">
                        {format(new Date(account.updatedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account ID</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {account.id.slice(-8)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">Growth Rate</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {((account.annualReturnPercent / 12) * 12).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Annualized</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium">Next Milestone</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {showAmounts ? `$${(Math.ceil(account.currentValue / 10000) * 10000).toLocaleString('en-US')}` : "••••••"}
                </p>
                <p className="text-xs text-muted-foreground">Target Goal</p>
              </Card>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <div className="flex gap-2 w-full">
              <InvestmentAccountForm 
                account={account}
                onAccountChanged={() => {
                  onAccountChanged();
                  onOpenChange(false);
                }}
                trigger={
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                }
              />
              <DeleteInvestmentAccountDialog
                accountId={account.id}
                accountName={account.name}
                onAccountDeleted={() => {
                  onAccountChanged();
                  onOpenChange(false);
                }}
                trigger={
                  <Button variant="outline" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                }
              />
            </div>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}