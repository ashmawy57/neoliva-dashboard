"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, DollarSign, AlertTriangle, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock,
  Activity, MoreHorizontal, Plus
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 4200, expenses: 2400 },
  { name: "Feb", revenue: 3800, expenses: 2100 },
  { name: "Mar", revenue: 5100, expenses: 2800 },
  { name: "Apr", revenue: 4780, expenses: 2600 },
  { name: "May", revenue: 5890, expenses: 3100 },
  { name: "Jun", revenue: 6390, expenses: 3400 },
  { name: "Jul", revenue: 7490, expenses: 3200 },
];

const appointmentData = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 19 },
  { day: "Wed", count: 15 },
  { day: "Thu", count: 22 },
  { day: "Fri", count: 18 },
  { day: "Sat", count: 8 },
];

const recentPatients = [
  { name: "Emily Johnson", time: "09:00 AM", treatment: "Teeth Cleaning", status: "In Progress", avatar: "EJ", color: "from-blue-500 to-cyan-500" },
  { name: "Marcus Williams", time: "10:30 AM", treatment: "Root Canal Therapy", status: "Waiting", avatar: "MW", color: "from-purple-500 to-pink-500" },
  { name: "Sarah Chen", time: "11:15 AM", treatment: "Orthodontic Consultation", status: "Scheduled", avatar: "SC", color: "from-amber-500 to-orange-500" },
  { name: "James Rodriguez", time: "01:00 PM", treatment: "Dental Implant Review", status: "Scheduled", avatar: "JR", color: "from-emerald-500 to-teal-500" },
  { name: "Aisha Patel", time: "02:30 PM", treatment: "Whitening Session", status: "Scheduled", avatar: "AP", color: "from-rose-500 to-pink-500" },
];

const upcomingAppointments = [
  { patient: "Dr. Adams — Emily Johnson", time: "09:00 – 09:45", type: "Cleaning", progress: 65 },
  { patient: "Dr. Smith — Marcus Williams", time: "10:30 – 12:00", type: "Root Canal", progress: 20 },
  { patient: "Dr. Lee — Sarah Chen", time: "11:15 – 11:45", type: "Consultation", progress: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-100 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-500 capitalize">{entry.dataKey}:</span>
            <span className="font-semibold text-gray-800">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
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
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
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
            <div className="text-3xl font-bold text-gray-900">24</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-semibold hover:bg-emerald-50">
                8 completed
              </Badge>
              <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[11px] font-semibold hover:bg-amber-50">
                3 pending
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
            <div className="text-3xl font-bold text-gray-900">$4,320</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="flex items-center gap-0.5 text-red-600 text-xs font-semibold bg-red-50 rounded-full px-2 py-0.5">
                <ArrowDownRight className="w-3 h-3" /> 12 overdue
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
            <div className="text-3xl font-bold text-gray-900">7</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">Items need restocking</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Revenue Overview</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Revenue vs expenses over 7 months</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[300px] pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expenseGrad)" dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Stats */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Weekly Appointments</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Patient visits this week</p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-semibold hover:bg-blue-50">
              94 total
            </Badge>
          </CardHeader>
          <CardContent className="h-[260px] pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip cursor={{ fill: "rgba(59,130,246,0.04)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent Patients */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Today&apos;s Patient Queue</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Live patient status tracker</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${patient.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {patient.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.treatment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {patient.time}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] font-semibold rounded-full px-2.5 border-none ${
                        patient.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : patient.status === "Waiting"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {patient.status === "In Progress" && <Activity className="w-2.5 h-2.5 mr-1 animate-pulse" />}
                      {patient.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
