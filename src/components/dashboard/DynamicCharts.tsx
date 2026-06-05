"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const AdvancedCharts = dynamic(
  () => import("./AdvancedCharts").then((mod) => mod.AdvancedCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[380px] flex flex-col gap-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="flex-1 w-full" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[380px] flex flex-col gap-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="flex-1 w-full" />
        </div>
      </div>
    )
  }
);
