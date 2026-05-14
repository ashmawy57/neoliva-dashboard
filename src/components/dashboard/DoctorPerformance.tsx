"use client";

import { motion } from "framer-motion";
import { 
  Stethoscope, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Medal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DoctorStats {
  id: string;
  name: string;
  revenue: number;
  patientsCount: number;
  completionRate: number;
}

interface DoctorPerformanceProps {
  doctors: DoctorStats[];
}

export function DoctorPerformance({ doctors }: DoctorPerformanceProps) {
  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden h-full">
      <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-800">
            Medical Performance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-6">
        <div className="space-y-6">
          {doctors.map((doctor, index) => (
            <div key={doctor.id} className="relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-600">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 p-0.5 bg-amber-400 rounded-full border-2 border-white shadow-sm">
                        <Award className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">
                      Dr. {doctor.name}
                    </h4>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {doctor.patientsCount} PATIENTS HANDLED
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    ${doctor.revenue.toLocaleString()}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +12%
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                  <span>CASE COMPLETION RATE</span>
                  <span className="text-indigo-600">{doctor.completionRate.toFixed(0)}%</span>
                </div>
                <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${doctor.completionRate}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="absolute h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}

          {doctors.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No clinical data available for this period.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
