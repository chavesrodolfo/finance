"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { stackClientApp } from "../stack.client";

export default function Intro() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await stackClientApp.getUser();
        if (user) {
          // Redirect to dashboard if authenticated
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <div className="mt-8 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-block glass-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Personal Finance Simplified
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent animate-slide-up">
            Take Control of Your Financial Future
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Track expenses, manage budgets, and achieve your financial goals with our intelligent financial management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
            <button 
              onClick={() => window.location.href = "/handler/sign-in"}
              className="px-8 py-3 bg-primary/90 text-primary-foreground rounded-lg hover:bg-primary transition-colors font-medium shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all animate-pulse-slow"
            >
              Get Started — It&apos;s Free
            </button>
            <button className="px-8 py-3 glass-light text-foreground rounded-lg hover:bg-secondary/20 transition-colors font-medium">
              View Demo
            </button>
          </div>
        </div>
        
        {/* Feature cards with animations and floating effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="group relative p-8 glass-light rounded-xl border-none shadow-md hover:shadow-lg transition-all animate-slide-up delay-300 animate-float">
            <div className="absolute -top-5 left-8 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:text-primary-foreground">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-5 mb-3">Smart Tracking</h3>
            <p className="text-muted-foreground">
              Automatically categorize transactions and get a clear view of your spending habits in real-time.
            </p>
          </div>
          
          <div className="group relative p-8 glass-light rounded-xl border-none shadow-md hover:shadow-lg transition-all animate-slide-up delay-400 animate-float" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -top-5 left-8 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:text-primary-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-5 mb-3">Budget Builder</h3>
            <p className="text-muted-foreground">
              Create customized budgets for different categories and get alerts when you&apos;re approaching your limits.
            </p>
          </div>
          
          <div className="group relative p-8 glass-light rounded-xl border-none shadow-md hover:shadow-lg transition-all animate-slide-up delay-500 animate-float" style={{ animationDelay: "0.4s" }}>
            <div className="absolute -top-5 left-8 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:text-primary-foreground">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-5 mb-3">Insights & Goals</h3>
            <p className="text-muted-foreground">
              Get personalized financial insights and set achievable savings goals with progress tracking.
            </p>
          </div>
        </div>
        
        {/* Animated gradient orb background elements */}
        <div className="fixed top-1/4 right-10 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="fixed bottom-1/4 left-10 w-80 h-80 bg-violet-800/20 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}></div>
      </div>
    </>
  );
} 