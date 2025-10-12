"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssetAllocation {
  id: string;
  assetName: string;
  idealAllocationPercent: number;
  currentAllocationAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface RebalanceAction {
  assetName: string;
  currentAmount: number;
  idealAmount: number;
  difference: number;
  action: "buy" | "sell" | "hold";
}

interface Transfer {
  from: string;
  to: string;
  amount: number;
}

interface RebalanceDialogProps {
  allocations: AssetAllocation[];
  totalInvestments: number;
}

export function RebalanceDialog({ allocations, totalInvestments }: RebalanceDialogProps) {
  const [open, setOpen] = useState(false);

  // Calculate rebalance actions
  const rebalanceActions: RebalanceAction[] = allocations.map((allocation) => {
    const idealAmount = (allocation.idealAllocationPercent / 100) * totalInvestments;
    const difference = allocation.currentAllocationAmount - idealAmount;

    return {
      assetName: allocation.assetName,
      currentAmount: allocation.currentAllocationAmount,
      idealAmount: idealAmount,
      difference: difference,
      action: difference > 0.01 ? "sell" : difference < -0.01 ? "buy" : "hold",
    };
  });

  // Calculate transfers (from over-allocated to under-allocated)
  const calculateTransfers = (): Transfer[] => {
    const transfers: Transfer[] = [];
    const overAllocated = rebalanceActions.filter((a) => a.action === "sell").sort((a, b) => b.difference - a.difference);
    const underAllocated = rebalanceActions.filter((a) => a.action === "buy").sort((a, b) => a.difference - b.difference);

    let i = 0;
    let j = 0;

    while (i < overAllocated.length && j < underAllocated.length) {
      const from = overAllocated[i];
      const to = underAllocated[j];
      const amountToTransfer = Math.min(from.difference, Math.abs(to.difference));

      if (amountToTransfer > 0.01) {
        transfers.push({
          from: from.assetName,
          to: to.assetName,
          amount: amountToTransfer,
        });

        from.difference -= amountToTransfer;
        to.difference += amountToTransfer;
      }

      if (Math.abs(from.difference) < 0.01) i++;
      if (Math.abs(to.difference) < 0.01) j++;
    }

    return transfers;
  };

  const transfers = calculateTransfers();
  const hasRebalancing = transfers.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Rebalance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Portfolio Rebalancing Plan</DialogTitle>
          <DialogDescription>
            Transfer amounts between assets to match your ideal allocation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current vs Ideal Summary */}
          <div>
            <h3 className="font-medium mb-3">Asset Status</h3>
            <div className="space-y-2">
              {rebalanceActions.map((action) => (
                <Card key={action.assetName} className={`${
                  action.action === "hold"
                    ? "border-green-500/20 bg-green-500/5"
                    : action.action === "sell"
                    ? "border-orange-500/20 bg-orange-500/5"
                    : "border-blue-500/20 bg-blue-500/5"
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{action.assetName}</p>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="flex justify-between">
                            <span>Current:</span>
                            <span>${action.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ideal:</span>
                            <span>${action.idealAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {action.action === "hold" ? (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Balanced
                          </span>
                        ) : action.action === "sell" ? (
                          <div>
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                              Sell
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${Math.abs(action.difference).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Buy
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${Math.abs(action.difference).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Transfer Instructions */}
          {hasRebalancing ? (
            <div>
              <h3 className="font-medium mb-3">Recommended Transfers</h3>
              <div className="space-y-3">
                {transfers.map((transfer, index) => (
                  <Card key={index} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{transfer.from}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{transfer.to}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Transfer to rebalance portfolio
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ${transfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> These are suggestions based on your ideal allocation.
                  Execute these transfers in your actual investment accounts to rebalance your portfolio.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Portfolio is Balanced!</h3>
              <p className="text-sm text-muted-foreground">
                Your current allocation matches your ideal allocation. No rebalancing needed.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
