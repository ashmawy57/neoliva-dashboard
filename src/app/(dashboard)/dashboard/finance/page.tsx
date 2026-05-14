import { Suspense } from "react";
import { getFinancialDashboardAction } from "@/app/actions/finance";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { FinanceKPIs } from "@/components/finance/FinanceKPIs";
import { RevenueChart } from "@/components/finance/RevenueChart";
import { CashFlowCard } from "@/components/finance/CashFlowCard";
import { FinancialAlerts } from "@/components/finance/FinancialAlerts";
import { RecentFinancialActivity } from "@/components/finance/RecentFinancialActivity";
import { TopServicesChart } from "@/components/finance/TopServicesChart";
import { RevenueByDoctorChart } from "@/components/finance/RevenueByDoctorChart";
import { FinanceDashboardHeader } from "@/components/finance/FinanceDashboardHeader";
import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  TrendingUp, 
} from "lucide-react";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = '30d' } = await searchParams;
  
  // Strict Page-Level Protection
  await resolveTenantContext();
  await requirePermission(PermissionCode.FINANCE_VIEW);

  const dashboardData = await getFinancialDashboardAction(period as any);

  if (!dashboardData.success || !dashboardData.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-full">
          <TrendingUp className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold">Access Denied or Load Error</h2>
        <p className="text-slate-500 max-w-md text-center">
          {dashboardData.error || "You do not have permission to view the financial dashboard or an error occurred while fetching data."}
        </p>
        <Link 
          href="/dashboard" 
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { data } = dashboardData;
  const periodLabel = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "12m": "Last 12 Months"
  }[period] || "Last 30 Days";

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <FinanceDashboardHeader period={period} />

      {/* KPI Cards */}
      <FinanceKPIs data={data.kpis} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Left Column: Charts & Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <RevenueChart data={data.trends.revenueVsExpenses} periodLabel={periodLabel} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopServicesChart data={data.topServices} />
            <RevenueByDoctorChart data={data.revenueByDoctor} />
          </div>
        </div>

        {/* Right Column: Health & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialAlerts alerts={data.alerts} />
          <CashFlowCard data={data.cashFlow} />
          
          <FinanceQuickActions />

          <RecentFinancialActivity activity={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
