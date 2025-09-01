"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Home,
  CreditCard,
  BarChart3,
  PiggyBank,
  Settings,
  TrendingUp,
  Plus,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  shortcut: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

const commands: CommandItem[] = [
  // Actions
  {
    id: "new-transaction",
    label: "New Transaction",
    shortcut: "N",
    path: "/dashboard/transactions/new",
    icon: Plus,
    group: "Actions",
  },
  
  // Navigation
  {
    id: "dashboard",
    label: "Dashboard",
    shortcut: "D",
    path: "/dashboard",
    icon: Home,
    group: "Navigation",
  },
  {
    id: "transactions",
    label: "Transactions",
    shortcut: "T",
    path: "/dashboard/transactions",
    icon: CreditCard,
    group: "Navigation",
  },
  {
    id: "reports",
    label: "Reports",
    shortcut: "R",
    path: "/dashboard/reports",
    icon: BarChart3,
    group: "Navigation",
  },
  {
    id: "budget",
    label: "Budget",
    shortcut: "B",
    path: "/dashboard/budget",
    icon: PiggyBank,
    group: "Navigation",
  },
  {
    id: "investments",
    label: "Investments",
    shortcut: "I",
    path: "/dashboard/investments",
    icon: TrendingUp,
    group: "Navigation",
  },
  {
    id: "settings",
    label: "Settings",
    shortcut: "S",
    path: "/dashboard/settings/configuration",
    icon: Settings,
    group: "Navigation",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect platform on client side
    setIsMac(navigator.platform.includes("Mac"));
    
    const handleSelect = (path: string) => {
      setOpen(false);
      router.push(path);
    };
    
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      
      // Handle direct shortcuts when command palette is open
      if (open && e.key.length === 1) {
        const command = commands.find(
          (cmd) => cmd.shortcut.toLowerCase() === e.key.toLowerCase()
        );
        if (command) {
          e.preventDefault();
          handleSelect(command.path);
        }
      }
      
      // Handle Escape to close
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, router]);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = [];
    }
    acc[command.group].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search... (or use shortcuts like D, T, R, B, I, S, N)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedCommands).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((command) => {
              const Icon = command.icon;
              return (
                <CommandItem
                  key={command.id}
                  value={command.label}
                  onSelect={() => handleSelect(command.path)}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{command.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                    {command.shortcut}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem className="text-muted-foreground" disabled>
            <span className="flex-1">Open Command Palette</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              {isMac ? "⌘K" : "Ctrl+K"}
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
