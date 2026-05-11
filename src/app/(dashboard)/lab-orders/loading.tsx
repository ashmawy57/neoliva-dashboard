import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Beaker, Truck } from "lucide-react";

export default function LabOrdersLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-pulse pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <Skeleton className="h-2 w-full mt-4 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-5 h-5 bg-gray-200 rounded-full" />
          <Skeleton className="h-6 w-32 rounded" />
        </div>
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
