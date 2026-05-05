import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, DollarSign, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardRecentPatients } from "@/components/dashboard/DashboardRecentPatients";

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
            Good morning, Dr. Smith 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening at your clinic today.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {/* Revenue Card */}
        <Card className="card-hover border-0 shadow-sm bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">Daily Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">$2,847</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <div className="flex items-center gap-0.5 bg-white/15 rounded-full px-2 py-0.5 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" /> +14.2%
              </div>
              <span className="text-blue-200 text-xs">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="card-hover border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Today&apos;s Appointments</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data?.todaysAppointmentsCount || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-semibold hover:bg-emerald-50">
                {data?.completedAppointmentsCount || 0} completed
              </Badge>
              <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[11px] font-semibold hover:bg-amber-50">
                {data?.pendingAppointmentsCount || 0} pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="card-hover border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${data?.pendingPayments?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="flex items-center gap-0.5 text-red-600 text-xs font-semibold bg-red-50 rounded-full px-2 py-0.5">
                <ArrowDownRight className="w-3 h-3" /> {data?.overdueCount || 0} overdue
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Low Inventory */}
        <Card className="card-hover border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Inventory</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data?.lowInventoryCount || 0}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">Items need restocking</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <DashboardCharts />

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent Patients */}
        <DashboardRecentPatients patients={data?.recentPatients || []} />

        {/* Live Progress */}
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
