import {
  Home,
  Car,
  Utensils,
  ShoppingCart,
  Gamepad2,
  Plane,
  Heart,
  DollarSign,
  Gift,
  Settings,
  Coffee,
  Fuel,
  Building,
  Baby,
  Tag,
  Stethoscope,
  GraduationCap,
  Shirt,
  Zap,
  Wifi,
  Phone,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Briefcase,
  MapPin,
  Music,
  Camera,
  Book,
  Dumbbell,
  Scissors,
  Wrench,
  Palette,
  TreePine,
  type LucideIcon
} from "lucide-react";

// Map of icon names to Lucide components
export const iconMap: Record<string, LucideIcon> = {
  // Home & Living
  Home,
  Building,
  Zap, // Utilities
  Wifi,
  Phone,
  
  // Food & Dining
  Utensils, // Restaurants
  Coffee,
  ShoppingCart, // Groceries
  
  // Transportation
  Car,
  Fuel,
  Plane, // Travel
  MapPin,
  
  // Health & Medical
  Heart, // Health/medical
  Stethoscope,
  
  // Finance
  DollarSign, // Payroll
  CreditCard,
  PiggyBank, // Savings
  TrendingUp, // Investments
  TrendingDown, // Expenses
  RotateCcw, // Returns
  Briefcase,
  
  // Personal & Lifestyle
  Shirt, // Clothing
  Scissors, // Personal care
  Dumbbell, // Gym
  Camera,
  Music,
  Book,
  Gamepad2, // Recreation
  
  // Family & Kids
  Baby, // Daycare
  GraduationCap, // Education
  
  // Gifts & Others
  Gift,
  Settings, // Services
  Wrench, // House stuff/renovation
  Palette, // House supply
  TreePine, // Basement (storage)
  Tag, // Other/default
};

// Default icon mappings for common category names
export const defaultCategoryIcons: Record<string, string> = {
  // Exact matches (case insensitive)
  "food": "Utensils",
  "health/medical": "Heart",
  "health": "Heart",
  "medical": "Stethoscope",
  "home": "Home",
  "house": "Home",
  "car": "Car",
  "vehicle": "Car",
  "travel": "Plane",
  "payroll": "DollarSign",
  "salary": "DollarSign",
  "income": "TrendingUp",
  "other": "Tag",
  "recreation": "Gamepad2",
  "entertainment": "Gamepad2",
  "government": "Building",
  "gifts": "Gift",
  "house supply": "Palette",
  "basement": "TreePine",
  "services": "Settings",
  "restaurants": "Utensils",
  "dining": "Utensils",
  "coffee": "Coffee",
  "groceries": "ShoppingCart",
  "shopping": "ShoppingCart",
  "utilities": "Zap",
  "internet": "Wifi",
  "phone": "Phone",
  "mobile": "Phone",
  "gas": "Fuel",
  "fuel": "Fuel",
  "insurance": "CreditCard",
  "loan": "CreditCard",
  "mortgage": "Home",
  "rent": "Home",
  "clothing": "Shirt",
  "clothes": "Shirt",
  "gym": "Dumbbell",
  "fitness": "Dumbbell",
  "daycare": "Baby",
  "childcare": "Baby",
  "education": "GraduationCap",
  "school": "GraduationCap",
  "renovation": "Wrench",
  "repair": "Wrench",
  "maintenance": "Wrench",
  "savings": "PiggyBank",
  "investment": "TrendingUp",
  "business": "Briefcase",
  "work": "Briefcase",
};

// Function to get the appropriate icon for a category name
export function getCategoryIcon(categoryName: string, savedIcon?: string): string {
  // If there's a saved icon, use it
  if (savedIcon && iconMap[savedIcon]) {
    return savedIcon;
  }
  
  // Try to match the category name to a default icon
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Direct match
  if (defaultCategoryIcons[normalizedName]) {
    return defaultCategoryIcons[normalizedName];
  }
  
  // Partial matches
  for (const [key, icon] of Object.entries(defaultCategoryIcons)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }
  
  // Default fallback
  return "Tag";
}

// Transaction type icon mapping
export const transactionTypeIcons: Record<string, string> = {
  "EXPENSE": "TrendingDown",
  "INCOME": "TrendingUp", 
  "EXPENSE_SAVINGS": "PiggyBank",
  "RETURN": "RotateCcw"
};

// Get icon for transaction type
export function getTransactionTypeIcon(type: string): string {
  return transactionTypeIcons[type.toUpperCase()] || "Tag";
}

// Default description icon mappings
export const defaultDescriptionIcons: Record<string, string> = {
  // Insurance
  "home insurance": "Home",
  "car insurance": "Car", 
  "health insurance": "Heart",
  "insurance": "CreditCard",
  
  // Utilities
  "utilities": "Zap",
  "electric bill": "Zap",
  "gas bill": "Fuel",
  "water bill": "Zap",
  "internet": "Wifi",
  "mobile phone": "Phone",
  "phone": "Phone",
  
  // Food & Dining
  "groceries": "ShoppingCart",
  "restaurant": "Utensils",
  "coffee": "Coffee",
  "liquor store": "Coffee",
  
  // Transportation
  "car (gas)": "Fuel",
  "fuel": "Fuel",
  "parking": "Car",
  "taxi/uber": "Car",
  "public transport": "Car",
  "transportation": "Car",
  "flight": "Plane",
  
  // Housing
  "mortgage": "Home",
  "rent": "Home",
  "hotel": "Building",
  
  // Health & Medical
  "pharmacy": "Stethoscope",
  "dental care": "Stethoscope",
  "eye care": "Stethoscope",
  
  // Personal & Lifestyle
  "clothing": "Shirt",
  "gym": "Dumbbell",
  "entertainment": "Gamepad2",
  "shopping": "ShoppingCart",
  "vacation": "Plane",
  
  // Financial
  "bank fee": "CreditCard",
  "investment": "TrendingUp",
  "savings": "PiggyBank",
  "salary": "DollarSign",
  "bonus": "DollarSign",
  "freelance": "Briefcase",
  "business income": "Briefcase",
  "interest": "TrendingUp",
  "dividend": "TrendingUp",
  "refund": "RotateCcw",
  "cashback": "TrendingUp",
  
  // Others
  "gift": "Gift",
  "donation": "Gift",
  "tax": "Building",
  "subscription": "CreditCard",
  "other income": "TrendingUp"
};

// Function to get the appropriate icon for a description
export function getDescriptionIcon(description: string, savedIcon?: string): string {
  // If there's a saved icon, use it
  if (savedIcon && iconMap[savedIcon]) {
    return savedIcon;
  }
  
  // Try to match the description to a default icon
  const normalizedDesc = description.toLowerCase().trim();
  
  // Direct match
  if (defaultDescriptionIcons[normalizedDesc]) {
    return defaultDescriptionIcons[normalizedDesc];
  }
  
  // Partial matches
  for (const [key, icon] of Object.entries(defaultDescriptionIcons)) {
    if (normalizedDesc.includes(key) || key.includes(normalizedDesc)) {
      return icon;
    }
  }
  
  // Default fallback
  return "Tag";
}

// Get available icons for selection
export function getAvailableIcons(): Array<{ name: string; icon: LucideIcon; category: string }> {
  return [
    // Home & Living
    { name: "Home", icon: Home, category: "Home & Living" },
    { name: "Building", icon: Building, category: "Home & Living" },
    { name: "Zap", icon: Zap, category: "Home & Living" },
    { name: "Wifi", icon: Wifi, category: "Home & Living" },
    { name: "Phone", icon: Phone, category: "Home & Living" },
    
    // Food & Dining
    { name: "Utensils", icon: Utensils, category: "Food & Dining" },
    { name: "Coffee", icon: Coffee, category: "Food & Dining" },
    { name: "ShoppingCart", icon: ShoppingCart, category: "Food & Dining" },
    
    // Transportation
    { name: "Car", icon: Car, category: "Transportation" },
    { name: "Fuel", icon: Fuel, category: "Transportation" },
    { name: "Plane", icon: Plane, category: "Transportation" },
    { name: "MapPin", icon: MapPin, category: "Transportation" },
    
    // Health & Medical
    { name: "Heart", icon: Heart, category: "Health & Medical" },
    { name: "Stethoscope", icon: Stethoscope, category: "Health & Medical" },
    
    // Finance
    { name: "DollarSign", icon: DollarSign, category: "Finance" },
    { name: "CreditCard", icon: CreditCard, category: "Finance" },
    { name: "PiggyBank", icon: PiggyBank, category: "Finance" },
    { name: "TrendingUp", icon: TrendingUp, category: "Finance" },
    { name: "TrendingDown", icon: TrendingDown, category: "Finance" },
    { name: "RotateCcw", icon: RotateCcw, category: "Finance" },
    { name: "Briefcase", icon: Briefcase, category: "Finance" },
    
    // Personal & Lifestyle
    { name: "Shirt", icon: Shirt, category: "Personal & Lifestyle" },
    { name: "Scissors", icon: Scissors, category: "Personal & Lifestyle" },
    { name: "Dumbbell", icon: Dumbbell, category: "Personal & Lifestyle" },
    { name: "Camera", icon: Camera, category: "Personal & Lifestyle" },
    { name: "Music", icon: Music, category: "Personal & Lifestyle" },
    { name: "Book", icon: Book, category: "Personal & Lifestyle" },
    { name: "Gamepad2", icon: Gamepad2, category: "Personal & Lifestyle" },
    
    // Family & Kids
    { name: "Baby", icon: Baby, category: "Family & Kids" },
    { name: "GraduationCap", icon: GraduationCap, category: "Family & Kids" },
    
    // Others
    { name: "Gift", icon: Gift, category: "Others" },
    { name: "Settings", icon: Settings, category: "Others" },
    { name: "Wrench", icon: Wrench, category: "Others" },
    { name: "Palette", icon: Palette, category: "Others" },
    { name: "TreePine", icon: TreePine, category: "Others" },
    { name: "Tag", icon: Tag, category: "Others" },
  ];
}