"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { TrendingUp, Users, Activity } from "lucide-react";

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

export default function ReportsPage() {
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
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg. Daily Visits</p>
              <p className="text-2xl font-bold text-gray-900">18.4</p>
              <p className="text-xs text-emerald-600 font-medium">+3.2 from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Revenue Trend</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Monthly revenue over the last 8 months</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold hover:bg-emerald-50">
            $226K total
          </Badge>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#revenueGrad2)" dot={false} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Treatment Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Treatment Distribution</CardTitle>
            <p className="text-xs text-gray-500">Most requested procedures by volume</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="w-[180px] h-[180px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={treatmentsData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {treatmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {treatmentsData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Growth */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Patient Growth</CardTitle>
            <p className="text-xs text-gray-500">New patient registrations per month</p>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip cursor={{ fill: "rgba(16,185,129,0.04)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="patients" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
