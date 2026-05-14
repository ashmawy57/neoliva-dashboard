"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface Insight {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'revenue_drop': return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case 'no_show': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'top_doctor': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No new insights today.</p>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                  {insight.message}
                </p>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                  {insight.severity}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
