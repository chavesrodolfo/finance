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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccountAwareApi } from "@/hooks/useAccountAwareApi";

interface AssetAllocation {
  id: string;
  assetName: string;
  idealAllocationPercent: number;
  currentAllocationAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface AssetAllocationFormProps {
  onAllocationChanged: () => void;
  allocation?: AssetAllocation;
  trigger?: React.ReactNode;
  allAllocations?: AssetAllocation[];
}

export function AssetAllocationForm({ onAllocationChanged, allocation, trigger, allAllocations = [] }: AssetAllocationFormProps) {
  const { apiFetch } = useAccountAwareApi();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetName, setAssetName] = useState(allocation?.assetName || "");
  const [idealAllocationPercent, setIdealAllocationPercent] = useState(allocation?.idealAllocationPercent?.toString() || "");
  const [currentAllocationAmount, setCurrentAllocationAmount] = useState(allocation?.currentAllocationAmount?.toString() || "");
  const { toast } = useToast();

  const isEditing = !!allocation;

  // Calculate total allocation percentage (excluding current allocation if editing)
  const totalAllocated = allAllocations
    .filter(a => !isEditing || a.id !== allocation.id)
    .reduce((sum, a) => sum + a.idealAllocationPercent, 0);

  const remainingAllocation = 100 - totalAllocated;

  // Calculate how much the user can still allocate
  const currentInputValue = parseFloat(idealAllocationPercent) || 0;
  const maxAllowedInput = remainingAllocation;
  const remainingAfterInput = remainingAllocation - currentInputValue;

  const resetForm = () => {
    if (allocation) {
      // Reset to original values for editing
      setAssetName(allocation.assetName);
      setIdealAllocationPercent(allocation.idealAllocationPercent.toString());
      setCurrentAllocationAmount(allocation.currentAllocationAmount.toString());
    } else {
      // Reset to empty values for adding
      setAssetName("");
      setIdealAllocationPercent("");
      setCurrentAllocationAmount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that total allocation doesn't exceed 100%
    const inputPercent = parseFloat(idealAllocationPercent);
    if (inputPercent > maxAllowedInput) {
      toast({
        variant: "destructive",
        title: "Invalid Allocation",
        description: `Total allocation cannot exceed 100%. You can only allocate up to ${maxAllowedInput.toFixed(2)}%.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        assetName,
        idealAllocationPercent: inputPercent,
        currentAllocationAmount: parseFloat(currentAllocationAmount),
      };

      const url = isEditing ? `/api/asset-allocations/${allocation.id}` : "/api/asset-allocations";
      const method = isEditing ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} asset allocation`);
      }

      if (!isEditing) {
        resetForm();
      }
      setOpen(false);
      onAllocationChanged();

      toast({
        variant: "success",
        title: "Success!",
        description: `Asset allocation ${isEditing ? 'updated' : 'added'} successfully!`,
      });
    } catch (error) {
      console.error("Error creating asset allocation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create asset allocation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Asset Allocation' : 'Add Asset Allocation'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your asset allocation details.'
              : 'Add a new asset to track your ideal vs current allocation.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input
              id="assetName"
              placeholder="e.g. Stocks, Bonds, Real Estate"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              required
            />
          </div>

          {/* Allocation Summary */}
          <div className={`p-3 rounded-lg ${
            remainingAfterInput < 0
              ? 'bg-destructive/10 border border-destructive/20'
              : remainingAfterInput === 0
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-muted/50 border border-muted'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total Allocated:</span>
              <span className={remainingAfterInput < 0 ? 'text-destructive font-semibold' : ''}>
                {(totalAllocated + currentInputValue).toFixed(2)}% / 100%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-medium">Remaining:</span>
              <span className={`font-semibold ${
                remainingAfterInput < 0
                  ? 'text-destructive'
                  : remainingAfterInput === 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              }`}>
                {remainingAfterInput.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idealAllocation">Ideal Allocation (%)</Label>
              <div className="relative">
                <Input
                  id="idealAllocation"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxAllowedInput}
                  placeholder="0.00"
                  className="pr-8"
                  value={idealAllocationPercent}
                  onChange={(e) => setIdealAllocationPercent(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              {maxAllowedInput < 100 && (
                <p className="text-xs text-muted-foreground">
                  Max: {maxAllowedInput.toFixed(2)}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAllocation">Current Allocation Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="currentAllocation"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={currentAllocationAmount}
                  onChange={(e) => setCurrentAllocationAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditing ? "Updating..." : "Adding...")
                : (isEditing ? "Update Asset" : "Add Asset")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
