import { 
  getFinancialTrendsAction, 
  getReportsKPIsAction,
  getTreatmentDistributionAction,
  getPatientGrowthAction,
  getInventoryInsightsAction,
  getAIInsightsAction
} from "@/app/actions/reports";
import { ReportsKPIs } from "@/components/reports/ReportsKPIs";
import { ReportsRevenueChart } from "@/components/reports/ReportsRevenueChart";
import { ReportsExpenseChart } from "@/components/reports/ReportsExpenseChart";
import { ReportsProfitChart } from "@/components/reports/ReportsProfitChart";
import { ReportsTreatmentChart } from "@/components/reports/ReportsTreatmentChart";
import { ReportsPatientGrowthChart } from "@/components/reports/ReportsPatientGrowthChart";
import { ReportsInventoryAlerts } from "@/components/reports/ReportsInventoryAlerts";
import { ReportsAIInsights } from "@/components/reports/ReportsAIInsights";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function ErrorState({ message }: { message?: string }) {
  return (
    <Card className="border-red-100 bg-red-50/50">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm font-medium text-red-900">Failed to load data</p>
        <p className="text-xs text-red-600 mt-1">{message || "Please check your connection and try again."}</p>
      </CardContent>
    </Card>
  );
}

export default async function ReportsPage() {
  // Use parallel fetching with failure isolation
  const [
    kpisRes,
    trendsRes,
    treatmentsRes,
    growthRes,
    inventoryRes,
    aiRes
  ] = await Promise.all([
    getReportsKPIsAction(),
    getFinancialTrendsAction(),
    getTreatmentDistributionAction(),
    getPatientGrowthAction(),
    getInventoryInsightsAction(),
    getAIInsightsAction()
  ]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics 📊</h1>
        <p className="text-sm text-gray-500">Comprehensive performance insights and data analysis</p>
      </div>

      {/* Section 1: KPI Cards */}
      {kpisRes.success && kpisRes.data ? (
        <ReportsKPIs data={kpisRes.data} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ErrorState message={kpisRes.error} />
        </div>
      )}

      {/* Section 2: Financial Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {trendsRes.success && trendsRes.data ? (
          <>
            <ReportsRevenueChart data={trendsRes.data} />
            <ReportsExpenseChart data={trendsRes.data} />
            <ReportsProfitChart data={trendsRes.data} />
          </>
        ) : (
          <div className="lg:col-span-3">
            <ErrorState message={trendsRes.error} />
          </div>
        )}
      </div>

      {/* Section 3: AI Intelligence Insights */}
      <div className="max-w-5xl">
        <ReportsAIInsights insights={aiRes.success ? aiRes.data || [] : []} />
      </div>

      {/* Section 4: Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {treatmentsRes.success && treatmentsRes.data ? (
          <ReportsTreatmentChart data={treatmentsRes.data} />
        ) : (
          <ErrorState message={treatmentsRes.error} />
        )}
        
        {growthRes.success && growthRes.data ? (
          <ReportsPatientGrowthChart data={growthRes.data} />
        ) : (
          <ErrorState message={growthRes.error} />
        )}
      </div>

      {/* Section 4: Inventory Alerts */}
      <div className="max-w-4xl">
        {inventoryRes.success && inventoryRes.data ? (
          <ReportsInventoryAlerts items={inventoryRes.data.lowStock} />
        ) : (
          <ErrorState message={inventoryRes.error} />
        )}
      </div>
    </div>
  );
}
