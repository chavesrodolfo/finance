import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton() {
  return (
    <Card className="card-glass-effect card-with-glow rounded-xl overflow-hidden animate-slide-up">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="h-2 w-full bg-muted/30"></div>
    </Card>
  );
}

export function TransactionListSkeleton() {
  return (
    <Card className="card-glass-effect card-with-glow rounded-xl border border-border/20 shadow-md animate-slide-up">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-4">
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
        <Skeleton className="w-full h-8 mt-6 rounded-md" />
      </div>
    </Card>
  );
}

export function BudgetCardSkeleton() {
  return (
    <Card className="card-glass-effect card-with-glow rounded-xl border border-border/20 shadow-md animate-slide-up">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <div className="space-y-5">
          <div className="text-center py-8">
            <div className="mb-4">
              <Skeleton className="h-12 w-12 mx-auto rounded-md" />
            </div>
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto mb-4" />
            <Skeleton className="h-10 w-28 mx-auto rounded-md" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border/30">
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
    </Card>
  );
}