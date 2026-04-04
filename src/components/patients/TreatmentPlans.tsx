"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, PlayCircle, Plus } from "lucide-react";

const plans = [
  {
    id: "TP-2024-001",
    title: "Root Canal & Crown (Tooth #16)",
    status: "Active",
    progress: 50,
    cost: "$1,200",
    created: "Feb 20, 2024",
    phases: [
      { step: 1, name: "Initial Consultation & X-Rays", status: "Completed", date: "Feb 20, 2024", price: "$150" },
      { step: 2, name: "Root Canal Treatment", status: "Completed", date: "Mar 15, 2024", price: "$650" },
      { step: 3, name: "Crown Placing", status: "Planned", date: "Apr 05, 2024", price: "$400" },
    ],
  },
  {
    id: "TP-2023-104",
    title: "Wisdom Teeth Extraction",
    status: "Completed",
    progress: 100,
    cost: "$800",
    created: "Nov 10, 2023",
    phases: [
      { step: 1, name: "Extraction (#38, #48)", status: "Completed", date: "Nov 25, 2023", price: "$800" },
    ],
  },
];

export function TreatmentPlans() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Treatment Plans</h3>
          <p className="text-sm text-gray-500">Manage phased treatments and progress.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md">
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-0 shadow-sm ${plan.status === "Active" ? "ring-2 ring-blue-100" : ""}`}>
            <CardContent className="p-0">
              <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${plan.status === "Active" ? "bg-blue-50/30" : "bg-gray-50/50"}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-gray-900">{plan.title}</h4>
                    <Badge variant={plan.status === "Active" ? "default" : "secondary"} className={`rounded-full ${plan.status === "Active" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}`}>
                      {plan.status === "Active" ? <PlayCircle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {plan.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">Plan ID: {plan.id} · Created on {plan.created}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Est. Cost</p>
                  <p className="text-lg font-bold text-emerald-600">{plan.cost}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Treatment Phases</span>
                  <span className="text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                    {plan.progress}% Progress
                  </span>
                </div>
                
                <div className="space-y-4 relative before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-gray-100">
                  {plan.phases.map((phase) => (
                    <div key={phase.step} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 ${phase.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {phase.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                          <p className={`text-sm font-semibold ${phase.status === 'Completed' ? 'text-gray-900' : 'text-gray-500'}`}>
                            {phase.step}. {phase.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{phase.date} · {phase.status}</p>
                        </div>
                        <p className={`text-sm font-bold ${phase.status === 'Completed' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {phase.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
