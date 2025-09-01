"use client";

import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteInvestmentAccountDialogProps {
  accountId: string;
  accountName: string;
  onAccountDeleted: () => void;
  trigger?: React.ReactNode;
}

export function DeleteInvestmentAccountDialog({
  accountId,
  accountName,
  onAccountDeleted,
  trigger
}: DeleteInvestmentAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/investment-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete investment account");
      }

      onAccountDeleted();
      toast({
        variant: "success",
        title: "Success!",
        description: "Investment account deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting investment account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete investment account",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Investment Account"
        description={`Are you sure you want to delete "${accountName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}