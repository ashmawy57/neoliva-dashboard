export const dynamic = 'force-dynamic';
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { AdvancedCharts } from "@/components/dashboard/AdvancedCharts";
import { InsightsEngine } from "@/components/dashboard/InsightsEngine";
import { OperationalPanel } from "@/components/dashboard/OperationalPanel";
import { DoctorPerformance } from "@/components/dashboard/DoctorPerformance";
import { FinancialFlow } from "@/components/dashboard/FinancialFlow";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData();

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
      <DashboardKPIs data={data.kpis} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Analytics Column */}
        <div className="lg:col-span-8 space-y-6">
          <AdvancedCharts data={data.charts} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FinancialFlow data={data.financialFlow} />
            <ActivityFeed activities={data.financialFlow.activityFeed} />
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <InsightsEngine insights={data.insights} />
          
          <OperationalPanel queue={data.operational.patientQueue} />

          <DoctorPerformance doctors={data.doctorPerformance} />
        </div>
      </div>
    </div>
  );
}
