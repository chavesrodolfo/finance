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
      <div className="text-center">
        <div className="bg-primary/20 text-primary-foreground p-4 rounded-xl animate-pulse-slow mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Loading FinanceTrack</h1>
        <p className="text-muted-foreground">Please wait while we prepare your experience...</p>
      </div>
    </div>
  );
}
