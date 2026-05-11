"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface ChartsProps {
  data: {
    revenueVsExpenses: Array<{
      month: string;
      revenue: number;
      expenses: number;
    }>;
    weeklyAppointments: Array<{
      day: string;
      count: number;
    }>;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-100 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-500 capitalize">{entry.name || entry.dataKey}:</span>
            <span className="font-semibold text-gray-800">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardChartsDynamic({ data }: ChartsProps) {
  const totalWeekly = data.weeklyAppointments.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {/* Revenue vs Expenses Chart */}
      <Card className="lg:col-span-4 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Revenue Overview</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Revenue vs expenses (Last 7 months)</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-[300px] pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueVsExpenses} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
              <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expenseGrad)" dot={false} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Appointments Chart */}
      <Card className="lg:col-span-3 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Weekly Appointments</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Patient visits this week</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-semibold hover:bg-blue-50">
            {totalWeekly} total
          </Badge>
        </CardHeader>
        <CardContent className="h-[260px] pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyAppointments} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip 
                cursor={{ fill: "rgba(59,130,246,0.04)" }} 
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelStyle={{ fontWeight: "bold", marginBottom: 4 }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
