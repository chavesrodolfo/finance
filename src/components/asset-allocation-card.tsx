"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { AssetAllocationForm } from "@/components/asset-allocation-form";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";

interface AssetAllocation {
  id: string;
  assetName: string;
  idealAllocationPercent: number;
  currentAllocationAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface AssetAllocationCardProps {
  allocation: AssetAllocation;
  onAllocationChanged: () => void;
  totalInvestments: number;
  allAllocations: AssetAllocation[];
}

export function AssetAllocationCard({ allocation, onAllocationChanged, totalInvestments, allAllocations }: AssetAllocationCardProps) {
  const { apiFetch } = useAccountAwareApi();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Calculate ideal amount from percentage and current percentage from amount
  const idealAmount = (allocation.idealAllocationPercent / 100) * totalInvestments;
  const currentPercent = totalInvestments > 0 ? (allocation.currentAllocationAmount / totalInvestments) * 100 : 0;
  const difference = currentPercent - allocation.idealAllocationPercent;
  const isOverAllocated = difference > 0;
  const isUnderAllocated = difference < 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await apiFetch(`/api/asset-allocations/${allocation.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset allocation");
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Asset allocation deleted successfully!",
      });

      onAllocationChanged();
    } catch (error) {
      console.error("Error deleting asset allocation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete asset allocation",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{allocation.assetName}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <AssetAllocationForm
                  allocation={allocation}
                  onAllocationChanged={onAllocationChanged}
                  allAllocations={allAllocations}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Ideal Allocation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Ideal Allocation</span>
                <div className="text-right">
                  <span className="text-sm font-medium">{allocation.idealAllocationPercent.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground ml-2">(${idealAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                </div>
              </div>
              <Progress value={allocation.idealAllocationPercent} className="h-2" />
            </div>

            {/* Current Allocation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Allocation</span>
                <div className="text-right">
                  <span className="text-sm font-medium">${allocation.currentAllocationAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-xs text-muted-foreground ml-2">({currentPercent.toFixed(1)}%)</span>
                </div>
              </div>
              <Progress
                value={currentPercent}
                className="h-2"
                indicatorClassName={isOverAllocated ? "bg-orange-500" : isUnderAllocated ? "bg-blue-500" : "bg-green-500"}
              />
            </div>

            {/* Difference Indicator */}
            {difference !== 0 && (
              <div className={`text-sm text-center p-2 rounded-md ${
                isOverAllocated
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              }`}>
                {isOverAllocated ? "Over" : "Under"} allocated by {Math.abs(difference).toFixed(2)}%
              </div>
            )}
            {difference === 0 && (
              <div className="text-sm text-center p-2 rounded-md bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Perfectly allocated
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset Allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{allocation.assetName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
