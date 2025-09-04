import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CommandPalette } from "@/components/ui/command-palette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinanceTrack",
  description: "Manage your personal finances with FinanceTrack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-gradient-radial from-primary/8 via-primary/3 to-transparent fixed inset-0 h-screen w-screen -z-10 dark:from-primary/6 dark:via-primary/2 dark:to-transparent"></div>
          <div className="noise-pattern fixed inset-0 h-screen w-screen opacity-20 -z-10 dark:opacity-40"></div>
          <StackProvider app={stackServerApp}>
            <StackTheme>
              {children}
              <CommandPalette />
              <Toaster />
            </StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
