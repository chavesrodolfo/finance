"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users } from "lucide-react";

export default function SettingsPage() {
  const settingsPages = [
    {
      title: "Configuration",
      description: "Manage categories, descriptions, and other settings",
      href: "/dashboard/settings/configuration",
      icon: <Settings className="h-6 w-6" />
    },
    {
      title: "Subaccounts",
      description: "Manage account access and invitations",
      href: "/dashboard/settings/subaccounts",
      icon: <Users className="h-6 w-6" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {page.icon}
                  </div>
                  <div>
                    <CardTitle>{page.title}</CardTitle>
                    <CardDescription>{page.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 