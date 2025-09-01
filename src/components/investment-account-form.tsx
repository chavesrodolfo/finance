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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface InvestmentAccountFormProps {
  onAccountChanged: () => void;
  account?: InvestmentAccount;
  trigger?: React.ReactNode;
}

const ACCOUNT_TYPES = [
  "TFSA",
  "RRSP",
  "FHSA", 
  "Savings",
  "Taxable",
  "RESP",
  "Crypto",
  "Other"
];

const CURRENCIES = [
  { value: "CAD", label: "CAD ($)" },
  { value: "USD", label: "USD ($)" },
  { value: "BRL", label: "BRL (R$)" },
];

export function InvestmentAccountForm({ onAccountChanged, account, trigger }: InvestmentAccountFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(account?.name || "");
  const [accountType, setAccountType] = useState(account?.accountType || "");
  const [currentValue, setCurrentValue] = useState(account?.currentValue?.toString() || "");
  const [currency, setCurrency] = useState(account?.currency || "CAD");
  const [monthlyReturnPercent, setMonthlyReturnPercent] = useState(account?.monthlyReturnPercent?.toString() || "");
  const [annualReturnPercent, setAnnualReturnPercent] = useState(account?.annualReturnPercent?.toString() || "");
  const { toast } = useToast();
  
  const isEditing = !!account;

  const resetForm = () => {
    if (account) {
      // Reset to original values for editing
      setName(account.name);
      setAccountType(account.accountType);
      setCurrentValue(account.currentValue.toString());
      setCurrency(account.currency);
      setMonthlyReturnPercent(account.monthlyReturnPercent.toString());
      setAnnualReturnPercent(account.annualReturnPercent.toString());
    } else {
      // Reset to empty values for adding
      setName("");
      setAccountType("");
      setCurrentValue("");
      setCurrency("CAD");
      setMonthlyReturnPercent("");
      setAnnualReturnPercent("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        name,
        accountType,
        currentValue: parseFloat(currentValue),
        currency,
        monthlyReturnPercent: monthlyReturnPercent ? parseFloat(monthlyReturnPercent) : 0,
        annualReturnPercent: annualReturnPercent ? parseFloat(annualReturnPercent) : 0,
      };

      const url = isEditing ? `/api/investment-accounts/${account.id}` : "/api/investment-accounts";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} investment account`);
      }

      if (!isEditing) {
        resetForm();
      }
      setOpen(false);
      onAccountChanged();
      
      toast({
        variant: "success",
        title: "Success!",
        description: `Investment account ${isEditing ? 'updated' : 'added'} successfully!`,
      });
    } catch (error) {
      console.error("Error creating investment account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create investment account",
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
            Add Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Investment Account' : 'Add Investment Account'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your investment account details.' 
              : 'Add a new investment account to track your portfolio.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g. Questrade TFSA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={accountType} onValueChange={setAccountType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyReturn">Monthly Return (%)</Label>
              <Input
                id="monthlyReturn"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={monthlyReturnPercent}
                onChange={(e) => setMonthlyReturnPercent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualReturn">Annual Return (%)</Label>
              <Input
                id="annualReturn"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={annualReturnPercent}
                onChange={(e) => setAnnualReturnPercent(e.target.value)}
              />
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
                : (isEditing ? "Update Account" : "Add Account")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}