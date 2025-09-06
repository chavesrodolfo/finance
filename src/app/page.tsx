"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { stackClientApp } from "./stack.client";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (user) {
          // Redirect to dashboard if authenticated
          router.push('/dashboard');
        } else {
          // Redirect to intro if not authenticated
          router.push('/intro');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Redirect to intro on error
        router.push('/intro');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Loading state while checking authentication
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo with improved animation */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl animate-pulse opacity-20"></div>
          <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            FinanceTrack
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* Loading indicator */}
        <div className="space-y-3">
          <div className="flex justify-center items-center space-x-1">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          <p className="text-lg font-medium text-foreground">
            {isLoading ? "Loading your workspace" : "Redirecting..."}
          </p>
          
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isLoading 
              ? "Setting up your financial dashboard and preparing your data..." 
              : "You will be redirected to the appropriate page shortly."
            }
          </p>
        </div>

        {/* Progress bar simulation */}
        {isLoading && (
          <div className="w-64 mx-auto">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
