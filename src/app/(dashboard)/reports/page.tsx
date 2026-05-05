import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Activity as ActivityIcon } from "lucide-react";
import { ReportsCharts } from "@/components/reports/ReportsCharts";

const revenueData = [
  { month: "Aug", revenue: 18000 },
  { month: "Sep", revenue: 22000 },
  { month: "Oct", revenue: 20000 },
  { month: "Nov", revenue: 27000 },
  { month: "Dec", revenue: 24000 },
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 45000 },
];

const treatmentsData = [
  { name: "Cleaning", value: 400, color: "#3b82f6" },
  { name: "Root Canal", value: 250, color: "#8b5cf6" },
  { name: "Whitening", value: 320, color: "#f59e0b" },
  { name: "Consultation", value: 180, color: "#10b981" },
  { name: "Implants", value: 90, color: "#ef4444" },
];

const patientGrowth = [
  { month: "Oct", patients: 120 },
  { month: "Nov", patients: 145 },
  { month: "Dec", patients: 138 },
  { month: "Jan", patients: 172 },
  { month: "Feb", patients: 195 },
  { month: "Mar", patients: 218 },
];

export default async function ReportsPage() {
  // In a real app, we would fetch this data from a service
  // const data = await getReportsData();
  
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Comprehensive clinic performance insights</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Revenue Growth</p>
              <p className="text-2xl font-bold text-gray-900">+41%</p>
              <p className="text-xs text-emerald-600 font-medium">Year over year increase</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Patient Growth</p>
              <p className="text-2xl font-bold text-gray-900">+218</p>
              <p className="text-xs text-emerald-600 font-medium">New patients this quarter</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <ActivityIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg. Daily Visits</p>
              <p className="text-2xl font-bold text-gray-900">18.4</p>
              <p className="text-xs text-emerald-600 font-medium">+3.2 from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportsCharts 
        revenueData={revenueData} 
        treatmentsData={treatmentsData} 
        patientGrowth={patientGrowth}
        totalRevenue={totalRevenue}
      />
    </div>
  );
}
