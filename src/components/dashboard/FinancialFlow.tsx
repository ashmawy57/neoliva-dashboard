"use client";

import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  DollarSign,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialFlowProps {
  data: {
    cashIn: number;
    cashOut: number;
    outstandingInvoices: number;
  };
}

export function FinancialFlow({ data }: FinancialFlowProps) {
  const stats = [
    {
      label: "Cash Inflow",
      value: data.cashIn,
      icon: ArrowUpRight,
      color: "emerald",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      label: "Cash Outflow",
      value: data.cashOut,
      icon: ArrowDownRight,
      color: "rose",
      bg: "bg-rose-50",
      border: "border-rose-100",
      iconColor: "text-rose-600"
    },
    {
      label: "Receivables",
      value: data.outstandingInvoices,
      icon: FileText,
      color: "amber",
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
      <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-800">
            Financial Health
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-6">
        <div className="space-y-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-100 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${stat.bg} ${stat.border} ${stat.iconColor}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    ${stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-8 w-16 opacity-20 group-hover:opacity-40 transition-opacity">
                <Activity className={`w-full h-full ${stat.iconColor}`} />
              </div>
            </div>
          ))}

          <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase">Daily Movement</span>
              <span className="text-xs font-bold text-emerald-600">POSITIVE</span>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1 }}
                className="h-full bg-emerald-400" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-rose-400" 
              />
              <div className="flex-1 bg-amber-400 opacity-50" />
            </div>
            <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 uppercase">
              <span>REVENUE</span>
              <span>EXPENSES</span>
              <span>PENDING</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
