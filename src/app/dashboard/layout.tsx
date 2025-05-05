"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Home, Settings, Clock, DollarSign, PieChart, TrendingUp } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Transactions", href: "/dashboard/transactions", icon: <Clock className="h-5 w-5" /> },
    { name: "New Transaction", href: "/dashboard/transactions/new", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Reports", href: "/dashboard/reports", icon: <BarChart className="h-5 w-5" /> },
    { name: "Budget", href: "/dashboard/budget", icon: <PieChart className="h-5 w-5" /> },
    { name: "Investments", href: "/dashboard/investments", icon: <TrendingUp className="h-5 w-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Helper to check if a menu item should be active
  const isActiveMenuItem = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r hidden md:block">
        <div className="h-16 border-b flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2.5 rounded-xl shadow-md shadow-purple-500/20 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">FinanceTrack</h1>
          </Link>
        </div>
        <nav className="py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActiveMenuItem(item.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Glassmorphism header with animation */}
        <header className="sticky top-0 z-10 glass backdrop-blur-md py-4 px-6 animate-fade-in">
          <div className="container max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3 md:hidden transition-transform hover:scale-105">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2.5 rounded-xl shadow-md shadow-purple-500/20 animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">FinanceTrack</h1>
            </Link>
            <div className="md:ml-auto">
              <AuthButton />
            </div>
          </div>
        </header>
        
        <main className="container max-w-7xl mx-auto py-8 px-6 flex-1">
          {children}
        </main>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-10">
          <div className="grid grid-cols-5 gap-1 p-2">
            {navItems.slice(0, 5).map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors ${
                  isActiveMenuItem(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Modern footer with subtle gradient */}
        <footer className="glass-light mt-auto hidden md:block">
          <div className="container mx-auto max-w-7xl py-6 px-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2025 FinanceTrack. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Made with <span className="text-rose-400 animate-pulse-slow">♥</span> for a better financial future
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 