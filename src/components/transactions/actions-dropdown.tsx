"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Upload, Download, FileText } from "lucide-react";
import Link from "next/link";

interface TransactionActionsProps {
  onImportCSV: () => void;
  onExportCSV: () => void;
  onDownloadTemplate: () => void;
}

export function TransactionActions({ 
  onImportCSV, 
  onExportCSV, 
  onDownloadTemplate 
}: TransactionActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImportClick = () => {
    setIsOpen(false);
    onImportCSV();
  };

  const handleExportClick = () => {
    setIsOpen(false);
    onExportCSV();
  };

  const handleTemplateClick = () => {
    setIsOpen(false);
    onDownloadTemplate();
  };

  return (
    <div className="relative">
      {/* Main button group */}
      <div className="flex">
        {/* Primary action - New */}
        <Link href="/dashboard/transactions/new">
          <Button className="rounded-r-none border-r border-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </Link>
        
        {/* Dropdown trigger */}
        <Button
          className="rounded-l-none px-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={handleImportClick}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Upload className="h-4 w-4 mr-3" />
                Import CSV
              </button>
              
              <button
                onClick={handleExportClick}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4 mr-3" />
                Export CSV
              </button>
              
              <button
                onClick={handleTemplateClick}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4 mr-3" />
                Template
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}