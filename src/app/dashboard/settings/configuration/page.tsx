"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Initial data
const initialTypes = [
  "Expense",
  "Income",
  "Expense Savings",
  "Return"
];

const initialCategories = [
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

const initialDescriptions = [
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
  "Climate incentive",
  "Child Benefit",
  "Tax Return",
  "Daycare",
  "Gifts",
  "Gym",
  "Renovation",
  "Toiletries",
  "Vitamin",
  "Liquor Store",
  "Dentist",
  "Doces"
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  
  // State for each configuration type
  const [types, setTypes] = useState(initialTypes);
  const [categories, setCategories] = useState(initialCategories);
  const [descriptions, setDescriptions] = useState(initialDescriptions);

  // Simulate loading (since this page uses static data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // New item states
  const [newType, setNewType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  
  // Edit states
  const [editingType, setEditingType] = useState<{ index: number; value: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ index: number; value: string } | null>(null);
  const [editingDescription, setEditingDescription] = useState<{ index: number; value: string } | null>(null);
  
  // Generic handlers
  const handleAdd = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (value.trim() === "") return;
    
    setItems([...items, value.trim()]);
    setValue("");
  };
  
  const handleDelete = (
    index: number,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  const handleStartEdit = (
    index: number,
    value: string,
    setEditing: React.Dispatch<React.SetStateAction<{ index: number; value: string } | null>>
  ) => {
    setEditing({ index, value });
  };
  
  const handleSaveEdit = (
    newValue: string,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    editingItem: { index: number; value: string } | null,
    setEditingItem: React.Dispatch<React.SetStateAction<{ index: number; value: string } | null>>
  ) => {
    if (!editingItem || newValue.trim() === "") return;
    
    const newItems = [...items];
    newItems[editingItem.index] = newValue.trim();
    setItems(newItems);
    setEditingItem(null);
  };
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-9 w-32 mb-6" />
        
        <div className="w-full">
          <div className="grid grid-cols-3 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
              </div>
              
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="types">Transaction Types</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
        </TabsList>
        
        {/* Transaction Types Tab */}
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Types</CardTitle>
              <CardDescription>
                Manage the available transaction types in your finance app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Add new transaction type..."
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleAdd(newType, setNewType, types, setTypes)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>
              
              <div className="space-y-2">
                {types.map((type, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20"
                  >
                    {editingType && editingType.index === index ? (
                      <Input
                        value={editingType.value}
                        onChange={(e) => setEditingType({ ...editingType, value: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <span>{type}</span>
                    )}
                    
                    <div className="flex gap-2">
                      {editingType && editingType.index === index ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(editingType.value, types, setTypes, editingType, setEditingType)}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleStartEdit(index, type, setEditingType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(index, types, setTypes)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage the available transaction categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Add new category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleAdd(newCategory, setNewCategory, categories, setCategories)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20"
                  >
                    {editingCategory && editingCategory.index === index ? (
                      <Input
                        value={editingCategory.value}
                        onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <span>{category}</span>
                    )}
                    
                    <div className="flex gap-2">
                      {editingCategory && editingCategory.index === index ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(
                            editingCategory.value, 
                            categories, 
                            setCategories, 
                            editingCategory, 
                            setEditingCategory
                          )}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleStartEdit(index, category, setEditingCategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(index, categories, setCategories)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Descriptions Tab */}
        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
              <CardDescription>
                Manage the available transaction descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Add new description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleAdd(newDescription, setNewDescription, descriptions, setDescriptions)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Description
                </Button>
              </div>
              
              <div className="space-y-2">
                {descriptions.map((description, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20"
                  >
                    {editingDescription && editingDescription.index === index ? (
                      <Input
                        value={editingDescription.value}
                        onChange={(e) => setEditingDescription({ ...editingDescription, value: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <span>{description}</span>
                    )}
                    
                    <div className="flex gap-2">
                      {editingDescription && editingDescription.index === index ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(
                            editingDescription.value, 
                            descriptions, 
                            setDescriptions, 
                            editingDescription, 
                            setEditingDescription
                          )}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleStartEdit(index, description, setEditingDescription)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(index, descriptions, setDescriptions)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 