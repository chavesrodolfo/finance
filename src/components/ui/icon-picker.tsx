"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAvailableIcons, iconMap } from "@/lib/category-icons";
import { ChevronDown } from "lucide-react";

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  disabled?: boolean;
}

export function IconPicker({ selectedIcon = "Tag", onIconSelect, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const availableIcons = getAvailableIcons();
  const SelectedIconComponent = iconMap[selectedIcon];

  // Group icons by category
  const iconsByCategory = availableIcons.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof availableIcons>);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={disabled}
        >
          {SelectedIconComponent && (
            <SelectedIconComponent className="h-4 w-4 mr-2" />
          )}
          <span className="flex-1 text-left">
            {selectedIcon === "Tag" ? "Select icon..." : selectedIcon}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-80 overflow-y-auto">
          {Object.entries(iconsByCategory).map(([category, icons]) => (
            <div key={category} className="p-2">
              <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                {category}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {icons.map((iconItem) => {
                  const IconComponent = iconItem.icon;
                  const isSelected = iconItem.name === selectedIcon;
                  
                  return (
                    <Button
                      key={iconItem.name}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleIconSelect(iconItem.name)}
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}