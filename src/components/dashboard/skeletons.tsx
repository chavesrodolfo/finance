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
      {/* Filter Controls Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chart Skeleton */}
        <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="mb-6">
              <Skeleton className="h-6 w-48 mb-2" />
            </div>
            
            {/* Chart Area */}
            <div className="h-80 w-full relative mb-6">
              <div className="h-full w-full flex">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-xs text-muted-foreground pr-3" style={{ height: "280px", paddingBottom: "40px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-12" />
                  ))}
                </div>
                
                {/* Chart bars */}
                <div className="flex-1 relative">
                  <div className="flex items-end justify-around h-full" style={{ height: "280px", paddingBottom: "40px" }}>
                    {[...Array(8)].map((_, i) => {
                      const heights = [160, 100, 180, 70, 140, 120, 200, 80];
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <Skeleton 
                            className="w-8 mb-2 rounded-t-sm" 
                            style={{ height: `${heights[i]}px` }}
                          />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/20">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-3 w-16 mx-auto" />
                  <Skeleton className="h-6 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Sidebar Categories Skeleton */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
          <div className="p-6">
            <div className="mb-6">
              <Skeleton className="h-6 w-32 mb-2" />
            </div>
            
            <div className="space-y-4 max-h-80 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-border/20 rounded-lg p-4 space-y-3">
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
                    {[...Array(4)].map((_, j) => (
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