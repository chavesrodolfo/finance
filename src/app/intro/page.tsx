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
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    checkAuth();
  }, [router]);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: "Transaction Management",
      description: "Track expenses, income, and savings with smart categorization and detailed transaction history.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20V10M18 20V4M6 20v-6" />
        </svg>
      ),
      title: "Advanced Reports",
      description: "Comprehensive analytics with monthly/yearly breakdowns, category distributions, and trend analysis.",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M16.24 7.76a6 6 0 0 1-8.49 8.49m0-8.49a6 6 0 0 1 8.49 8.49" />
        </svg>
      ),
      title: "Smart Budgeting",
      description: "Set budgets by category with progress tracking, alerts, and intelligent spending insights.",
      color: "from-indigo-500 to-violet-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      title: "Investment Tracking",
      description: "Monitor investment portfolios, track performance, and analyze returns across different accounts.",
      color: "from-violet-600 to-purple-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Multi-Account Support",
      description: "Manage multiple financial accounts, share with family members, and control access permissions.",
      color: "from-purple-600 to-indigo-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
      title: "Secure & Private",
      description: "Enterprise-grade security with data encryption, secure authentication, and privacy controls.",
      color: "from-violet-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-2xl shadow-violet-500/25 mb-8 animate-bounce">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>

          {/* Brand Name */}
          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            FinanceTrack
          </h1>

          {/* Tagline */}
          <div className="inline-block bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/50 dark:border-violet-800/50 rounded-full px-6 py-2 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
            💰 Where Smart Money Meets Beautiful Design
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            Take Control of Your
            <span className="block bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Comprehensive financial management with advanced reporting, smart budgeting, investment tracking, 
            and multi-account support. Everything you need to master your finances in one beautiful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center mb-16">
            <button 
              onClick={() => window.location.href = "/handler/sign-in"}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Start Free Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need to Manage Your Finances
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover all the powerful features that make FinanceTrack the complete solution for personal finance management
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-violet-200/30 dark:border-violet-800/30 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transform hover:-translate-y-2 transition-all duration-300"
              style={{animationDelay: `${index * 100}ms`}}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </div>
          ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-20 p-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl shadow-2xl shadow-violet-500/25">
        <h3 className="text-3xl font-bold mb-4 text-white">
          Ready to Transform Your Financial Life?
        </h3>
        <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users who have taken control of their finances with FinanceTrack
        </p>
        <button 
          onClick={() => window.location.href = "/handler/sign-in"}
          className="px-10 py-4 bg-white text-violet-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 hover:bg-gray-50"
        >
          Get Started Now - It's Free!
        </button>
      </div>
        </div>
      </div>
    </div>
  );
} 