import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-9 rounded-full bg-muted/30" />
        </div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );
}

export function TransactionListSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 h-[450px]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-md bg-muted/30" />
        </div>
        <div className="space-y-4 flex-grow">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function BudgetCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 h-[450px]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-24 rounded-md bg-muted/30" />
        </div>
        
        {/* Total Budget */}
        <div className="p-4 bg-muted/20 rounded-lg mb-6">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <div className="space-y-3 flex-grow">
          {[80, 65, 45, 30].map((width, index) => (
            <div key={index} className="group">
              <div className="flex justify-between text-sm mb-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="flex items-center">
                <div className="w-full h-4 bg-muted/30 rounded-md overflow-hidden">
                  <Skeleton 
                    className="h-full rounded-md" 
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs Skeleton */}
      <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      
      {/* Filter Controls Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Skeleton */}
        <Card className="md:col-span-3 lg:col-span-2 bg-card text-card-foreground border">
          <div className="p-6">
            <div className="mb-6">
              <Skeleton className="h-6 w-48 mb-2" />
            </div>
            
            {/* Horizontal Chart Area */}
            <div className="w-full space-y-3">
              {[...Array(8)].map((_, i) => {
                const widths = [85, 70, 95, 55, 80, 60, 90, 45]; // Different bar widths
                return (
                  <div key={i} className="flex items-center gap-3">
                    {/* Label */}
                    <div className="flex-shrink-0 w-20 sm:w-24 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                    
                    {/* Bar */}
                    <div className="flex-1 relative">
                      <Skeleton 
                        className="h-6 sm:h-8 rounded-full" 
                        style={{ width: `${widths[i]}%` }}
                      />
                    </div>
                    
                    {/* Percentage */}
                    <div className="flex-shrink-0 w-12 sm:w-16 text-left">
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-border pt-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center p-2">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Sidebar Categories Skeleton */}
        <Card className="bg-card text-card-foreground border">
          <div className="p-6">
            <div className="mb-6">
              <Skeleton className="h-6 w-32 mb-2" />
            </div>
            
            <div className="space-y-4 max-h-80 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  {/* Category header */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  
                  {/* Category items */}
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-2 h-2 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Transaction Details Table Skeleton */}
      <Card className="bg-card text-card-foreground border mt-6">
        <div className="p-6">
          <div className="mb-6">
            <Skeleton className="h-6 w-64 mb-2" />
          </div>
          
          {/* Table Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 border-b pb-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function InvestmentCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 h-[450px]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-24 rounded-md bg-muted/30" />
        </div>
        
        {/* Summary Stats */}
        <div className="p-4 bg-muted/20 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>

        {/* Investment Accounts */}
        <div className="space-y-3 flex-grow">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}