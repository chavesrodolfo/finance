"use client";

import { AuthButton } from "@/components/auth/AuthButton";

export default function IntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-violet-950/20 dark:to-purple-950/20 relative">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-violet-600/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-violet-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Glassmorphism header with animation */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border-b border-violet-200/20 dark:border-violet-800/20 py-4 px-6">
          <div className="container max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-violet-500/25">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">FinanceTrack</h1>
            </div>
            <AuthButton />
          </div>
        </header>
        
        <main>
          {children}
        </main>
        
        {/* Modern footer with subtle gradient */}
        <footer className="mt-24 backdrop-blur-md bg-white/20 dark:bg-gray-900/20 border-t border-violet-200/20 dark:border-violet-800/20">
          <div className="container mx-auto max-w-7xl py-10 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-violet-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">FinanceTrack</span>
              </div>
              <div className="flex gap-8">
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Terms</a>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy</a>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Help</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 