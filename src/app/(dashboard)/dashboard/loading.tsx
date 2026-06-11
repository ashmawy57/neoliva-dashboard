import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gray-100">
            <LayoutDashboard className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-3xl w-full" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px] rounded-2xl w-full" />
            <Skeleton className="h-[400px] rounded-2xl w-full" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-[220px] rounded-2xl w-full" />
          <Skeleton className="h-[350px] rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}
