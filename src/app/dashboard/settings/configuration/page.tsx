"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { iconMap, getTransactionTypeIcon } from "@/lib/category-icons";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@stackframe/stack";

// Transaction types (static)
const transactionTypes = [
  "Expense",
  "Income",
  "Expense Savings",
  "Return"
];

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface Description {
  id: string;
  name: string;
  icon?: string;
}


export default function SettingsPage() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  
  // State for each configuration type
  const [types] = useState(transactionTypes);
  const [categories, setCategories] = useState<Category[]>([]);
  const [descriptions, setDescriptions] = useState<Description[]>([]);

  // Fetch categories and descriptions from API
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [categoriesResponse, descriptionsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/descriptions')
        ]);
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        } else {
          toast({ title: "Error", description: "Failed to load categories" });
        }
        
        if (descriptionsResponse.ok) {
          const descriptionsData = await descriptionsResponse.json();
          setDescriptions(descriptionsData);
        } else {
          toast({ title: "Error", description: "Failed to load descriptions" });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ title: "Error", description: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // New item states
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Tag");
  const [newDescription, setNewDescription] = useState("");
  const [newDescriptionIcon, setNewDescriptionIcon] = useState("Tag");
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [editingDescription, setEditingDescription] = useState<{ id: string; name: string; icon: string } | null>(null);
  
  // Category handlers
  const handleAddCategory = async () => {
    if (newCategory.trim() === "") return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCategory.trim(),
          icon: newCategoryIcon 
        })
      });
      
      if (response.ok) {
        const newCat = await response.json();
        setCategories([...categories, newCat]);
        setNewCategory("");
        setNewCategoryIcon("Tag");
        toast({ title: "Success", description: "Category added successfully" });
      } else {
        toast({ title: "Error", description: "Failed to add category" });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ title: "Error", description: "Failed to add category" });
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        toast({ title: "Success", description: "Category deleted successfully" });
      } else {
        toast({ title: "Error", description: "Failed to delete category" });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: "Error", description: "Failed to delete category" });
    }
  };
  
  const handleStartEditCategory = (category: Category) => {
    setEditingCategory({ id: category.id, name: category.name, icon: category.icon || "Tag" });
  };

  // Description handlers
  const handleAddDescription = async () => {
    if (newDescription.trim() === "") return;
    
    try {
      const response = await fetch('/api/descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newDescription.trim(),
          icon: newDescriptionIcon 
        })
      });
      
      if (response.ok) {
        const newDesc = await response.json();
        setDescriptions([...descriptions, newDesc]);
        setNewDescription("");
        setNewDescriptionIcon("Tag");
        toast({ title: "Success", description: "Description added successfully" });
      } else {
        toast({ title: "Error", description: "Failed to add description" });
      }
    } catch (error) {
      console.error('Error adding description:', error);
      toast({ title: "Error", description: "Failed to add description" });
    }
  };

  const handleDeleteDescription = async (descriptionId: string) => {
    try {
      const response = await fetch(`/api/descriptions/${descriptionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDescriptions(descriptions.filter(desc => desc.id !== descriptionId));
        toast({ title: "Success", description: "Description deleted successfully" });
      } else {
        toast({ title: "Error", description: "Failed to delete description" });
      }
    } catch (error) {
      console.error('Error deleting description:', error);
      toast({ title: "Error", description: "Failed to delete description" });
    }
  };

  const handleStartEditDescription = (description: Description) => {
    setEditingDescription({ id: description.id, name: description.name, icon: description.icon || "Tag" });
  };

  const handleSaveEditDescription = async () => {
    if (!editingDescription || editingDescription.name.trim() === "") return;
    
    try {
      const response = await fetch(`/api/descriptions/${editingDescription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingDescription.name.trim(),
          icon: editingDescription.icon 
        })
      });
      
      if (response.ok) {
        const updatedDescription = await response.json();
        setDescriptions(descriptions.map(desc => 
          desc.id === editingDescription.id ? updatedDescription : desc
        ));
        setEditingDescription(null);
        toast({ title: "Success", description: "Description updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update description" });
      }
    } catch (error) {
      console.error('Error updating description:', error);
      toast({ title: "Error", description: "Failed to update description" });
    }
  };
  
  const handleSaveEditCategory = async () => {
    if (!editingCategory || editingCategory.name.trim() === "") return;
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingCategory.name.trim(),
          icon: editingCategory.icon 
        })
      });
      
      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update category" });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({ title: "Error", description: "Failed to update category" });
    }
  };
  
  // User data deletion handlers
  const [deletingData, setDeletingData] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    dataType: 'transactions' | 'categories' | 'budgets' | 'descriptions' | 'all' | null;
    title: string;
    description: string;
  }>({
    open: false,
    dataType: null,
    title: '',
    description: ''
  });

  const showDeleteConfirmation = (dataType: 'transactions' | 'categories' | 'budgets' | 'descriptions' | 'all') => {
    const configs = {
      transactions: {
        title: 'Delete All Transactions',
        description: 'This will permanently delete all your transaction records. Your categories and budgets will remain intact. This action cannot be undone.'
      },
      categories: {
        title: 'Delete All Categories',
        description: 'This will permanently delete all your categories and their associated transactions and budgets. This action cannot be undone.'
      },
      budgets: {
        title: 'Delete All Budgets',
        description: 'This will permanently delete all your budget entries. Your transactions and categories will remain intact. This action cannot be undone.'
      },
      descriptions: {
        title: 'Delete All Descriptions',
        description: 'This will permanently delete all your saved transaction descriptions. This action cannot be undone.'
      },
      all: {
        title: 'Delete All Data',
        description: 'This will permanently delete ALL your data including transactions, categories, budgets, and descriptions. This action cannot be undone and will essentially reset your account.'
      }
    };

    const config = configs[dataType];
    setConfirmationDialog({
      open: true,
      dataType,
      title: config.title,
      description: config.description
    });
  };
  
  const handleDeleteUserData = async () => {
    const { dataType } = confirmationDialog;
    if (!user || !dataType) return;
    
    setDeletingData(dataType);
    
    try {
      const response = await fetch(`/api/user-data?type=${dataType}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({ 
          title: "Success", 
          description: result.message 
        });
        
        // Refresh data based on what was deleted
        if (dataType === 'categories' || dataType === 'all') {
          setCategories([]);
        }
        if (dataType === 'descriptions' || dataType === 'all') {
          setDescriptions([]);
        }
        
        // If all data was deleted, we might want to redirect or refresh the page
        if (dataType === 'all') {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        toast({ 
          title: "Error", 
          description: error.error || "Failed to delete data" 
        });
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete data" 
      });
    } finally {
      setDeletingData(null);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-9 w-32 mb-6" />
        
        <div className="w-full">
          <div className="grid grid-cols-4 mb-6">
            <Skeleton className="h-10 w-full" />
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
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="types">Transaction Types</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
          <TabsTrigger value="user-data">User Data</TabsTrigger>
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
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Transaction types are predefined and cannot be modified.
                </p>
              </div>
              
              <div className="space-y-2">
                {types.map((type, index) => {
                  const iconName = getTransactionTypeIcon(type.toUpperCase().replace(' ', '_'));
                  const IconComponent = iconMap[iconName];
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <span>{type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">System Type</div>
                    </div>
                  );
                })}
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
                Manage the available transaction categories with custom icons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Add new category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <IconPicker 
                  selectedIcon={newCategoryIcon}
                  onIconSelect={setNewCategoryIcon}
                />
                <Button onClick={handleAddCategory}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon || "Tag"];
                  const isEditing = editingCategory?.id === category.id;
                  
                  return (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isEditing ? (
                          <>
                            <IconPicker 
                              selectedIcon={editingCategory.icon}
                              onIconSelect={(icon) => setEditingCategory({...editingCategory, icon})}
                            />
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              autoFocus
                              className="flex-1"
                            />
                          </>
                        ) : (
                          <>
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                            <span>{category.name}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isEditing ? (
                          <Button size="sm" onClick={handleSaveEditCategory}>
                            Save
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleStartEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
                Manage the available transaction descriptions with custom icons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Add new description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <IconPicker 
                  selectedIcon={newDescriptionIcon}
                  onIconSelect={setNewDescriptionIcon}
                />
                <Button onClick={handleAddDescription}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Description
                </Button>
              </div>
              
              <div className="space-y-2">
                {descriptions.map((description) => {
                  const IconComponent = iconMap[description.icon || "Tag"];
                  const isEditing = editingDescription?.id === description.id;
                  
                  return (
                    <div 
                      key={description.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isEditing ? (
                          <>
                            <IconPicker 
                              selectedIcon={editingDescription.icon}
                              onIconSelect={(icon) => setEditingDescription({...editingDescription, icon})}
                            />
                            <Input
                              value={editingDescription.name}
                              onChange={(e) => setEditingDescription({ ...editingDescription, name: e.target.value })}
                              autoFocus
                              className="flex-1"
                            />
                          </>
                        ) : (
                          <>
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                            <span>{description.name}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isEditing ? (
                          <Button size="sm" onClick={handleSaveEditDescription}>
                            Save
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleStartEditDescription(description)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteDescription(description.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Data Tab */}
        <TabsContent value="user-data">
          <Card>
            <CardHeader>
              <CardTitle>User Data Management</CardTitle>
              <CardDescription>
                Delete specific types of data or all your data. These actions cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    ⚠️ Warning: Data Deletion
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    All deletion actions are permanent and cannot be undone. Please make sure you have backups if needed.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {/* Delete Transactions */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Delete All Transactions</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove all transaction records while keeping categories and budgets.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => showDeleteConfirmation('transactions')}
                      disabled={deletingData === 'transactions'}
                    >
                      {deletingData === 'transactions' ? 'Deleting...' : 'Delete Transactions'}
                    </Button>
                  </div>
                  
                  {/* Delete Categories */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Delete All Categories</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove all categories and their associated transactions.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => showDeleteConfirmation('categories')}
                      disabled={deletingData === 'categories'}
                    >
                      {deletingData === 'categories' ? 'Deleting...' : 'Delete Categories'}
                    </Button>
                  </div>
                  
                  {/* Delete Budgets */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Delete All Budgets</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove all budget records and settings.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => showDeleteConfirmation('budgets')}
                      disabled={deletingData === 'budgets'}
                    >
                      {deletingData === 'budgets' ? 'Deleting...' : 'Delete Budgets'}
                    </Button>
                  </div>
                  
                  {/* Delete Descriptions */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Delete All Descriptions</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove all custom transaction descriptions.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => showDeleteConfirmation('descriptions')}
                      disabled={deletingData === 'descriptions'}
                    >
                      {deletingData === 'descriptions' ? 'Deleting...' : 'Delete Descriptions'}
                    </Button>
                  </div>
                  
                  {/* Delete All Data */}
                  <div className="mt-8 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Delete All Data</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Permanently remove ALL your data including transactions, categories, budgets, and descriptions.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => showDeleteConfirmation('all')}
                        disabled={deletingData === 'all'}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deletingData === 'all' ? 'Deleting...' : 'Delete All Data'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteUserData}
        isDestructive={true}
        isLoading={!!deletingData}
      />
    </div>
  );
} 