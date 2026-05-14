"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target,
  ChevronUp,
  ChevronDown,
  PieChart,
  Wallet
} from "lucide-react";

interface KPIProps {
  data: {
    revenueToday: { value: number; change: number };
    monthlyGrowth: number;
    profitMargin: number;
    collectionRate: number;
  };
}

export function DashboardKPIs({ data }: KPIProps) {
  const kpis = [
    {
      title: "Revenue Today",
      value: `$${data.revenueToday.value.toLocaleString()}`,
      sub: `${data.revenueToday.change >= 0 ? '+' : ''}${data.revenueToday.change.toFixed(1)}% vs yesterday`,
      icon: TrendingUp,
      gradient: "from-blue-600 to-indigo-600",
      shadow: "shadow-blue-200",
      trend: data.revenueToday.change >= 0 ? "up" : "down",
      percentage: data.revenueToday.change
    },
    {
      title: "Monthly Growth",
      value: `${data.monthlyGrowth.toFixed(1)}%`,
      sub: "Revenue growth MoM",
      icon: Target,
      gradient: "from-indigo-600 to-purple-600",
      shadow: "shadow-indigo-200",
      trend: data.monthlyGrowth >= 0 ? "up" : "down",
      percentage: data.monthlyGrowth
    },
    {
      title: "Profit Margin",
      value: `${data.profitMargin.toFixed(1)}%`,
      sub: "Net profit after expenses",
      icon: PieChart,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-200",
      trend: data.profitMargin >= 20 ? "up" : "none",
      percentage: data.profitMargin
    },
    {
      title: "Collection Rate",
      value: `${data.collectionRate.toFixed(1)}%`,
      sub: "Paid vs invoiced amount",
      icon: Wallet,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-200",
      trend: data.collectionRate >= 90 ? "up" : "down",
      percentage: data.collectionRate
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="group"
        >
          <Card className="border-0 shadow-xl shadow-gray-100/50 bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 rounded-3xl overflow-hidden relative">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.gradient} text-white shadow-lg ${kpi.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                {kpi.trend !== "none" && (
                  <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                    kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {kpi.trend === "up" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {Math.abs(kpi.percentage).toFixed(0)}%
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                  {kpi.title}
                </p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-[10px] font-medium text-gray-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-gray-200" />
                  {kpi.sub}
                </p>
              </div>
            </CardContent>
            
            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${kpi.gradient} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
