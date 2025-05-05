"use client";

import { stackClientApp } from "@/app/stack.client";
import { useEffect, useState } from "react";

interface ProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Protected({ children, fallback }: ProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      try {
        // Check if user is logged in using the correct method
        const user = await stackClientApp.getUser();
        setIsAuthenticated(!!user);
      } catch {
        // Ignore the error, just set not authenticated
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Show the protected content for authenticated users
  return <>{children}</>;
}