"use client";

import { cn } from "@/lib/utils";

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  className?: string;
}

export function BarChart({ data, maxValue, height = 300, showValues = true, className }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end justify-around gap-4 px-4"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 40);
          const defaultColors = [
            "#3b82f6", // blue
            "#ef4444", // red
            "#10b981", // green
            "#f59e0b", // amber
            "#8b5cf6", // violet
            "#ec4899", // pink
          ];

          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative flex items-end justify-center w-full" style={{ height: `${height - 40}px` }}>
                {showValues && (
                  <div className="absolute -top-6 text-sm font-medium">
                    {item.value.toFixed(1)}%
                  </div>
                )}
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: item.color || defaultColors[index % defaultColors.length],
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-center font-medium text-muted-foreground">
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
