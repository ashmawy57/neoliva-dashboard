"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const ReportsRevenueChart = dynamic(
  () => import("./ReportsRevenueChart").then((mod) => mod.ReportsRevenueChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm" /> }
);

export const ReportsExpenseChart = dynamic(
  () => import("./ReportsExpenseChart").then((mod) => mod.ReportsExpenseChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm" /> }
);

export const ReportsProfitChart = dynamic(
  () => import("./ReportsProfitChart").then((mod) => mod.ReportsProfitChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm" /> }
);

export const ReportsTreatmentChart = dynamic(
  () => import("./ReportsTreatmentChart").then((mod) => mod.ReportsTreatmentChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm" /> }
);

export const ReportsPatientGrowthChart = dynamic(
  () => import("./ReportsPatientGrowthChart").then((mod) => mod.ReportsPatientGrowthChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm" /> }
);
