import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-50 last:border-0 gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
