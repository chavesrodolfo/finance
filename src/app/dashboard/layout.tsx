"use client";

import { AuthButton } from "@/components/auth/AuthButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Glassmorphism header with animation */}
      <header className="sticky top-0 z-10 glass backdrop-blur-md py-4 px-6 animate-fade-in">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 text-primary-foreground p-2 rounded-xl animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">FinanceTrack</h1>
          </div>
          <AuthButton />
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto py-8 px-6">
        {children}
      </main>
      
      {/* Modern footer with subtle gradient */}
      <footer className="mt-24 glass-light">
        <div className="container mx-auto max-w-7xl py-10 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="bg-primary/20 text-primary p-2 rounded-xl animate-pulse-slow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="font-semibold">FinanceTrack</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 FinanceTrack. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              Made with <span className="text-rose-400 animate-pulse-slow">♥</span> for a better financial future
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 