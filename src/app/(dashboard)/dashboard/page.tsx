import { getDashboardData } from "./query";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { AdvancedCharts } from "@/components/dashboard/DynamicCharts";
import { InsightsEngine } from "@/components/dashboard/InsightsEngine";
import { OperationalPanel } from "@/components/dashboard/OperationalPanel";
import { DoctorPerformance } from "@/components/dashboard/DoctorPerformance";
import { FinancialFlow } from "@/components/dashboard/FinancialFlow";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Granular Server Components ---

async function KPIsSection() {
  const data = await getDashboardData();
  return <DashboardKPIs data={data.kpis} />;
}

async function ChartsSection() {
  const data = await getDashboardData();
  return <AdvancedCharts data={data.charts} />;
}

async function FinancialSection() {
  const data = await getDashboardData();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FinancialFlow data={data.financialFlow} />
      <ActivityFeed activities={data.financialFlow.activityFeed} />
    </div>
  );
}

async function InsightsSection() {
  const data = await getDashboardData();
  return <InsightsEngine insights={data.insights} />;
}

async function OperationalSection() {
  const data = await getDashboardData();
  return <OperationalPanel queue={data.operational.patientQueue} />;
}

async function DoctorPerformanceSection() {
  const data = await getDashboardData();
  return <DoctorPerformance doctors={data.doctorPerformance} />;
}

// --- Skeleton Fallbacks ---

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-28 rounded-2xl w-full" />
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[380px] rounded-2xl w-full" />
      <Skeleton className="h-[380px] rounded-2xl w-full" />
    </div>
  );
}

function FinancialSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[360px] rounded-2xl w-full" />
      <Skeleton className="h-[360px] rounded-2xl w-full" />
    </div>
  );
}

function SidebarCardSkeleton({ height = "h-[300px]" }: { height?: string }) {
  return <Skeleton className={`${height} rounded-2xl w-full`} />;
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-100">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Clinic Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Real-time operational & financial control center.
            </p>
          </div>
        </div>
        <QuickActions />
      </div>

      {/* Smart KPI Section */}
      <Suspense fallback={<KPISkeleton />}>
        <KPIsSection />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Analytics Column */}
        <div className="lg:col-span-8 space-y-6">
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection />
          </Suspense>
          
          <Suspense fallback={<FinancialSkeleton />}>
            <FinancialSection />
          </Suspense>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Suspense fallback={<SidebarCardSkeleton height="h-[220px]" />}>
            <InsightsSection />
          </Suspense>
          
          <Suspense fallback={<SidebarCardSkeleton height="h-[350px]" />}>
            <OperationalSection />
          </Suspense>

          <Suspense fallback={<SidebarCardSkeleton height="h-[300px]" />}>
            <DoctorPerformanceSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
