"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Insight {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface InsightsEngineProps {
  insights: Insight[];
}

export function InsightsEngine({ insights }: InsightsEngineProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: "bg-rose-50/50",
          border: "border-rose-100",
          text: "text-rose-700",
          icon: AlertTriangle,
          iconColor: "text-rose-500"
        };
      case 'medium':
        return {
          bg: "bg-amber-50/50",
          border: "border-amber-100",
          text: "text-amber-700",
          icon: Info,
          iconColor: "text-amber-500"
        };
      default:
        return {
          bg: "bg-indigo-50/50",
          border: "border-indigo-100",
          text: "text-indigo-700",
          icon: Lightbulb,
          iconColor: "text-indigo-500"
        };
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden h-full">
      <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Clinic Intelligence
          </CardTitle>
        </div>
        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          AI Powered
        </span>
      </CardHeader>
      <CardContent className="pt-4 px-4 h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No alerts today. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const config = getSeverityConfig(insight.severity);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative p-3 rounded-2xl border ${config.bg} ${config.border} hover:shadow-md transition-all cursor-pointer overflow-hidden`}
                >
                  <div className="flex gap-3 relative z-10">
                    <div className={`mt-0.5 ${config.iconColor}`}>
                      <config.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium leading-relaxed ${config.text}`}>
                        {insight.message}
                      </p>
                      <div className="mt-2 flex items-center text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 transition-colors">
                        TAKE ACTION <ChevronRight className="w-3 h-3 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative background pulse for high severity */}
                  {insight.severity === 'high' && (
                    <div className="absolute inset-0 bg-rose-200/10 animate-pulse pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
