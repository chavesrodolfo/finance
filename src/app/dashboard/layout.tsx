"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Home, Settings, Clock, DollarSign, PieChart, TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { 
      name: "Transactions", 
      href: "/dashboard/transactions", 
      icon: <Clock className="h-4 w-4" />,
      children: [
        { name: "New", href: "/dashboard/transactions/new", icon: <DollarSign className="h-4 w-4" /> }
      ]
    },
    { name: "Reports", href: "/dashboard/reports", icon: <BarChart className="h-4 w-4" /> },
    { name: "Budget", href: "/dashboard/budget", icon: <PieChart className="h-4 w-4" /> },
    { name: "Investments", href: "/dashboard/investments", icon: <TrendingUp className="h-4 w-4" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
  ];

  // Helper to check if a menu item should be active
  const isActiveMenuItem = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href;
  };

  // Helper to check if a parent item should be expanded (has active child)
  const hasActiveChild = (item: { children?: { href: string }[] }) => {
    if (!item.children) return false;
    return item.children.some((child: { href: string }) => pathname === child.href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border",
          sidebarOpen ? "w-64" : "w-16",
          "hidden md:block"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-sidebar-border flex items-center px-4">
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-xl shadow-md shadow-purple-500/20 animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                FinanceTrack
              </h1>
            </Link>
          ) : (
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-xl shadow-md shadow-purple-500/20 animate-pulse-slow mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                      isActiveMenuItem(item.href) || hasActiveChild(item)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground",
                      !sidebarOpen && "justify-center px-2"
                    )}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                  {/* Render children if they exist and sidebar is open */}
                  {item.children && sidebarOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child: { name: string; href: string; icon: React.ReactNode }) => (
                        <Link 
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                            isActiveMenuItem(child.href)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                          )}
                        >
                          {child.icon}
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4 backdrop-blur-md bg-background/95 border-b border-border">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex -ml-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          
          {/* Mobile Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 md:hidden transition-transform hover:scale-105">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-xl shadow-md shadow-purple-500/20 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              FinanceTrack
            </h1>
          </Link>
          
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1">
          <div className="container max-w-7xl mx-auto py-8 px-6">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
          <div className="grid grid-cols-5 gap-1 p-2">
            {navItems.slice(0, 4).map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors",
                  isActiveMenuItem(item.href) || hasActiveChild(item)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
            {/* Add the "New" item directly for mobile */}
            <Link 
              href="/dashboard/transactions/new"
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors",
                isActiveMenuItem("/dashboard/transactions/new")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-xs mt-1">New</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}