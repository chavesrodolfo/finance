"use client";

import { Button } from "../../components/ui/button";
import { Avatar } from "../../components/ui/avatar";
import { useEffect, useState } from "react";
import { stackClientApp } from "@/app/stack.client";

export function AuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await stackClientApp.getUser();
        setIsAuthenticated(!!user);

        // Get user details from Stack Auth
        if (user) {
          try {
            // Use the user id directly since we don't have other fields
            setUserName(user.id || "Account");
          } catch {
            setUserName("Account");
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Function to navigate to settings page
  const goToAccountSettings = () => {
    window.location.href = "/handler/account-settings";
  };

  // Function to handle logout
  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = "/handler/logout";
  };

  // Função para lidar com o login direto
  const handleDirectLogin = () => {
    window.location.href = "/handler/sign-in";
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <Button disabled>Loading...</Button>;
  }

  // Show logout button when authenticated
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:inline">Hello, {userName}</span>
        <div
          onClick={goToAccountSettings}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Avatar
            fallback={userName?.[0] || "U"}
            size="sm"
            className="border border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // Show direct login button when not authenticated (sem modal)
  return (
    <Button
      onClick={handleDirectLogin}
      className="bg-primary/90 text-primary-foreground hover:bg-primary transition-colors shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
    >
      Get Started — It&apos;s Free
    </Button>
  );
}