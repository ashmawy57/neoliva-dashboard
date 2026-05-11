"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  CalendarCheck2
} from "lucide-react";

interface KPIProps {
  data: {
    dailyRevenue: number;
    appointments: {
      total: number;
      completed: number;
      pending: number;
    };
    pendingPayments: number;
    lowInventory: number;
  };
}

export function DashboardKPIs({ data }: KPIProps) {
  const kpis = [
    {
      title: "Daily Revenue",
      value: `$${data.dailyRevenue.toLocaleString()}`,
      sub: "Total paid today",
      icon: TrendingUp,
      color: "blue",
      trend: "up"
    },
    {
      title: "Today's Appointments",
      value: data.appointments.total,
      sub: `${data.appointments.completed} completed · ${data.appointments.pending} pending`,
      icon: CalendarCheck2,
      color: "indigo",
      trend: "none"
    },
    {
      title: "Pending Payments",
      value: `$${data.pendingPayments.toLocaleString()}`,
      sub: "Unpaid invoices",
      icon: CreditCard,
      color: "amber",
      trend: "none"
    },
    {
      title: "Low Inventory",
      value: data.lowInventory,
      sub: "Items needing restock",
      icon: AlertTriangle,
      color: "red",
      trend: data.lowInventory > 0 ? "up" : "none"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-50 text-blue-600 border-blue-100";
      case "indigo": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "amber": return "bg-amber-50 text-amber-600 border-amber-100";
      case "red": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-500";
      case "indigo": return "text-indigo-500";
      case "amber": return "text-amber-500";
      case "red": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i} className="border-0 shadow-sm overflow-hidden group hover:ring-1 hover:ring-blue-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border ${getColorClasses(kpi.color)}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.trend !== "none" && (
                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  {kpi.trend === "up" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  12%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
