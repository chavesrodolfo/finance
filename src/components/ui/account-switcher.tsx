"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/hooks/useAccountContext";

export function AccountSwitcher() {
  const { 
    currentAccount, 
    availableAccounts, 
    switchAccount, 
    isLoading,
    isSubaccount 
  } = useAccountContext();
  const [open, setOpen] = useState(false);

  if (isLoading || !currentAccount) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted animate-pulse">
        <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
        <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  // Don't show if user only has access to their own account
  if (availableAccounts.length <= 1) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {currentAccount.isOwn ? (
              <User className="h-4 w-4 text-primary" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="truncate">
              {currentAccount.name || currentAccount.email}
            </span>
            {isSubaccount && (
              <Badge variant="secondary" className="text-xs">
                Sub
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="max-h-[300px] overflow-auto">
          {availableAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                switchAccount(account.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                currentAccount.id === account.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                {account.isOwn ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex flex-col items-start truncate">
                  <span className="truncate font-medium">
                    {account.name || account.email}
                  </span>
                  {account.name && (
                    <span className="text-xs text-muted-foreground truncate">
                      {account.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!account.isOwn && (
                  <Badge variant="secondary" className="text-xs">
                    Sub
                  </Badge>
                )}
                {currentAccount.id === account.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          <p className="text-xs text-muted-foreground px-2">
            {isSubaccount 
              ? "Currently viewing as subaccount"
              : "Currently viewing your own account"
            }
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}