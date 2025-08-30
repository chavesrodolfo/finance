"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { stackClientApp } from "../../stack.client";

export default function LogoutPage() {
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // First clear any client-side storage
        localStorage.removeItem("stack_user");
        sessionStorage.clear();
        
        // Use the Stack API to properly log out
        const user = await stackClientApp.getUser();
        if (user) {
          await user.signOut();
        }
        
        // Force a hard refresh to clear any cached state
        window.location.href = "/";
      } catch (error) {
        console.error("Error during logout:", error);
        // Still redirect to home even if there's an error
        window.location.href = "/";
      }
    };
    
    performLogout();
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  );
}