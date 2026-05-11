import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ExpensesLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-xl" />
                {i === 0 && <Skeleton className="h-6 w-20 rounded-full" />}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table section */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        </div>
        <div className="p-0">
          <div className="bg-gray-50/50 p-4 border-b flex gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i === 2 ? 'flex-1' : 'w-24'} rounded-lg`} />
            ))}
          </div>
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-4 flex-1">
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-5 w-48 rounded-lg" />
                     <Skeleton className="h-3 w-32 rounded-lg" />
                   </div>
                </div>
                <div className="flex gap-8 items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
