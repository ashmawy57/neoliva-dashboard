"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface ChartsProps {
  data: {
    revenueVsExpensesVsProfit: Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    appointmentStatus: Array<{
      name: string;
      value: number;
    }>;
    doctorPerformanceTrends: Array<{
      name: string;
      revenue: number;
    }>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-100 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="text-gray-500 capitalize">{entry.name || entry.dataKey}:</span>
            <span className="font-semibold text-gray-800">
              {typeof entry.value === 'number' && entry.dataKey !== 'value' ? `$${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardChartsDynamic({ data }: ChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {/* Financial Trends Chart */}
      <Card className="lg:col-span-4 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Financial Trends</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Revenue, Expenses & Profit (Last 6 months)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 rounded-lg">
              <LineIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueVsExpensesVsProfit} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
              <Area type="monotone" name="Profit" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#profitGrad)" dot={false} />
              <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="transparent" dot={false} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointment Breakdown Chart */}
      <Card className="lg:col-span-3 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Appointment Status</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Status breakdown for this week</p>
          </div>
          <PieIcon className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent className="h-[280px] pb-2 flex flex-col justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.appointmentStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.appointmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
