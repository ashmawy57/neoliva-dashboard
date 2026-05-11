export const dynamic = 'force-dynamic';
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { DashboardChartsDynamic } from "@/components/dashboard/DashboardChartsDynamic";
import { DashboardRecentPatients } from "@/components/dashboard/DashboardRecentPatients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const upcomingAppointments = [
  { patient: "Dr. Adams — Emily Johnson", time: "09:00 – 09:45", type: "Cleaning", progress: 65 },
  { patient: "Dr. Smith — Marcus Williams", time: "10:30 – 12:00", type: "Root Canal", progress: 20 },
  { patient: "Dr. Lee — Sarah Chen", time: "11:15 – 11:45", type: "Consultation", progress: 0 },
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Clinic Dashboard 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time insights and clinic performance overview.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKPIs data={data.kpis} />

      {/* Charts Row */}
      <DashboardChartsDynamic data={data.charts} />

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent Patients */}
        <DashboardRecentPatients patients={data.recentPatients || []} />

        {/* Live Progress (Using mock data for now as per previous design) */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Active Treatments</CardTitle>
            <p className="text-xs text-gray-500">Real-time procedure tracking</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-800 truncate pr-4">{apt.patient}</p>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">
                    {apt.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {apt.time}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      apt.progress > 50
                        ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                        : apt.progress > 0
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : "bg-gray-200"
                    }`}
                    style={{ width: `${apt.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 text-right">{apt.progress}% complete</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
