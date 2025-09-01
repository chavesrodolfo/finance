"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, MoreHorizontal } from "lucide-react";
import { InvestmentAccountDrawer } from "@/components/investment-account-drawer";
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

interface InvestmentAccountCardProps {
  account: InvestmentAccount;
  showAmounts: boolean;
  onAccountChanged: () => void;
}

export function InvestmentAccountCard({ account, showAmounts, onAccountChanged }: InvestmentAccountCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const monthlyReturn = (account.currentValue * (account.monthlyReturnPercent / 100));
  const annualReturn = (account.currentValue * (account.annualReturnPercent / 100));
  
  // Calculate CAD equivalent if not already in CAD
  const cadValue = convertToCAD(account.currentValue, account.currency);
  const showCADConversion = account.currency !== 'CAD';

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

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDrawerOpen(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-none">{account.name}</h3>
              <Badge variant="secondary" className={`text-xs ${getAccountTypeColor(account.accountType)}`}>
                {account.accountType}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Current Value */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current Value</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {showAmounts ? formatCurrency(account.currentValue, account.currency) : "••••••"}
                </p>
                {showAmounts && showCADConversion && (
                  <p className="text-sm text-muted-foreground">
                    ≈ CAD${cadValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            {/* Returns */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Monthly</span>
                </div>
                <p className="text-sm font-medium text-emerald-500">
                  +{account.monthlyReturnPercent.toFixed(2)}%
                </p>
                {showAmounts && (
                  <p className="text-xs text-muted-foreground">
                    +${monthlyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div className="text-center border-l pl-4">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Annual</span>
                </div>
                <p className="text-sm font-medium text-emerald-500">
                  +{account.annualReturnPercent.toFixed(2)}%
                </p>
                {showAmounts && (
                  <p className="text-xs text-muted-foreground">
                    +${annualReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Account Drawer */}
      <InvestmentAccountDrawer
        account={account}
        showAmounts={showAmounts}
        onAccountChanged={onAccountChanged}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}