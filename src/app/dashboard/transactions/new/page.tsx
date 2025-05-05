"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Transaction types
const transactionTypes = [
  "Expense",
  "Income",
  "Expense Savings",
  "Return"
];

// Transaction categories
const transactionCategories = [
  "Food",
  "Health/medical",
  "Home",
  "Home purchase",
  "Car",
  "Travel",
  "Payroll",
  "Other",
  "Recreation",
  "Government",
  "Gifts",
  "House Supply",
  "Basement",
  "Services"
];

// Transaction descriptions
const transactionDescriptions = [
  "Home Insurance",
  "Utilities",
  "Groceries",
  "Internet",
  "Mobile phone",
  "Car (gas)",
  "Car (insurance)",
  "Car (loan)",
  "Car (other costs)",
  "Restaurants",
  "Coffee",
  "Delivery/To go",
  "Recreation",
  "Pharmacy",
  "Clothing",
  "Housekeeper",
  "House stuff",
  "Mortgage",
  "Property tax",
  "Reimbursement",
  "Services",
  "Salary (Bi-weekly)",
  "Bonus",
  "Personal Stuff",
  "Other",
  "Child Benefit",
  "Tax Return",
  "Daycare",
  "Gifts",
  "Gym",
  "Renovation",
  "Toiletries",
  "Vitamin",
  "Liquor Store",
  "Dentist"
];

export default function NewTransactionPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would add code to submit the transaction data to your backend
      console.log({
        date,
        amount: parseFloat(amount),
        description,
        category,
        type,
        details
      });

      // Reset the form after successful submission
      setAmount("");
      setDescription("");
      setCategory("");
      setType("");
      setDetails("");

      // Show success message
      alert("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Transaction</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date field */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Amount field */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Select value={description} onValueChange={setDescription} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select description" />
                </SelectTrigger>
                <SelectContent>
                  {transactionDescriptions.map((desc) => (
                    <SelectItem key={desc} value={desc}>
                      {desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Additional Details */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                placeholder="Enter any additional details about this transaction..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 