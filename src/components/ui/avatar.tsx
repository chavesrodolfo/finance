"use client";

import { forwardRef } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = "Avatar", fallback, size = "md", className, ...props }, ref) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    };

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "w-8 h-8 text-xs";
        case "lg":
          return "w-12 h-12 text-base";
        default:
          return "w-10 h-10 text-sm";
      }
    };

    return (
      <div
        ref={ref}
        className={`relative rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${getSizeClass()} ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show fallback
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {fallback ? getInitials(fallback) : "U"}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };