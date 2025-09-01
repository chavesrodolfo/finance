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
    <Card className="bg-card/50 backdrop-blur-sm border-border/20">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-md bg-muted/30" />
        </div>
        <div className="space-y-4 flex-grow">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-10 mt-6 rounded-md border border-border/30" />
      </div>
    </Card>
  );
}

export function BudgetCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20">
      <div className="p-6 flex flex-col h-full">
        <div className="mb-6">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-5 flex-grow">
          <div>
            <Skeleton className="h-9 w-32 mb-4" />
          </div>
          <div className="pt-4 border-t border-border/30">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-4">
              {[80, 65, 45].map((width, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-full h-6 bg-muted/30 rounded-md overflow-hidden">
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
          <div className="pt-4 border-t border-border/30">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex justify-between items-center mt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="w-full h-10 mt-6 rounded-md border border-border/30" />
      </div>
    </Card>
  );
}