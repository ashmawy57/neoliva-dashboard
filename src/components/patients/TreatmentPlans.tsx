"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, PlayCircle, Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getTreatmentPlans, createTreatmentPlan, deleteTreatmentPlan, updatePlanStatus, addTreatmentPhase, updatePhaseStatus, deleteTreatmentPhase } from "@/app/actions/treatment-plans";

// ============ TYPES ============
type PhaseStatus = "Completed" | "In Progress" | "Planned" | "Cancelled";
type PlanStatus = "Active" | "Completed" | "On Hold" | "Cancelled";

interface Phase {
  id: string;
  step: number;
  name: string;
  status: PhaseStatus;
  date: string;
  price: string;
  notes: string;
}

interface Plan {
  id: string;
  title: string;
  status: PlanStatus;
  progress: number;
  cost: string;
  created: string;
  notes: string;
  phases: Phase[];
}

// ============ CONFIG ============
const PLAN_STATUS_COLORS: Record<PlanStatus, { bg: string; text: string; border: string }> = {
  Active:    { bg: "bg-blue-100",    text: "text-blue-800",    border: "ring-blue-100" },
  Completed: { bg: "bg-emerald-100", text: "text-emerald-800", border: "ring-emerald-100" },
  "On Hold": { bg: "bg-amber-100",   text: "text-amber-800",   border: "ring-amber-100" },
  Cancelled: { bg: "bg-red-100",     text: "text-red-800",     border: "ring-red-100" },
};

const PHASE_STATUS_ICONS: Record<PhaseStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  Completed:   { icon: CheckCircle2, color: "text-white",     bg: "bg-emerald-500" },
  "In Progress": { icon: PlayCircle, color: "text-white",     bg: "bg-blue-500" },
  Planned:     { icon: Clock,        color: "text-gray-500",  bg: "bg-gray-200" },
  Cancelled:   { icon: X,           color: "text-white",     bg: "bg-red-400" },
};

const TREATMENT_PRESETS = [
  "Initial Consultation & X-Rays", "Root Canal Treatment", "Crown Placing", "Composite Filling",
  "Tooth Extraction", "Dental Implant Placement", "Abutment Placement", "Bridge Fabrication",
  "Orthodontic Adjustment", "Teeth Whitening", "Scaling & Root Planing", "Follow-up Visit",
];

function calcProgress(phases: Phase[]): number {
  if (phases.length === 0) return 0;
  const completed = phases.filter(p => p.status === "Completed").length;
  return Math.round((completed / phases.length) * 100);
}

function calcCost(phases: Phase[]): string {
  const total = phases.reduce((sum, p) => {
    const num = parseFloat(p.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  return `$${total.toLocaleString()}`;
}

const initialPlans: Plan[] = [
  {
    id: "TP-2024-001",
    title: "Root Canal & Crown (Tooth #16)",
    status: "Active",
    progress: 50,
    cost: "$1,200",
    created: "Feb 20, 2024",
    notes: "",
    phases: [
      { id: "ph-1", step: 1, name: "Initial Consultation & X-Rays", status: "Completed", date: "Feb 20, 2024", price: "$150", notes: "" },
      { id: "ph-2", step: 2, name: "Root Canal Treatment", status: "Completed", date: "Mar 15, 2024", price: "$650", notes: "" },
      { id: "ph-3", step: 3, name: "Crown Placing", status: "Planned", date: "Apr 05, 2024", price: "$400", notes: "" },
    ],
  },
  {
    id: "TP-2023-104",
    title: "Wisdom Teeth Extraction",
    status: "Completed",
    progress: 100,
    cost: "$800",
    created: "Nov 10, 2023",
    notes: "",
    phases: [
      { id: "ph-4", step: 1, name: "Extraction (#38, #48)", status: "Completed", date: "Nov 25, 2023", price: "$800", notes: "" },
    ],
  },
];

export function TreatmentPlans({ 
  patientId,
  onRefresh
}: { 
  patientId: string,
  onRefresh?: () => void
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await getTreatmentPlans(patientId);
      setPlans(data as Plan[]);
      if (data.length > 0 && !expandedPlan) {
        setExpandedPlan(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      loadPlans();
    }
  }, [patientId]);

  // Dialog states
  const [newPlanDialog, setNewPlanDialog] = useState(false);
  const [addPhaseDialog, setAddPhaseDialog] = useState<string | null>(null); // plan id
  const [editPlanDialog, setEditPlanDialog] = useState<string | null>(null); // plan id
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // plan id

  // Forms
  const [newPlan, setNewPlan] = useState({ title: "", notes: "" });
  const [newPlanPhases, setNewPlanPhases] = useState<{ name: string; date: string; price: string }[]>([]);
  const [inlinePhase, setInlinePhase] = useState({ name: "", date: "", price: "" });
  const [newPhase, setNewPhase] = useState({ name: "", date: "", price: "", notes: "" });

  const newPlanTotalCost = newPlanPhases.reduce((s, p) => {
    const n = parseFloat(p.price.replace(/[^0-9.]/g, ""));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const addInlinePhase = () => {
    if (!inlinePhase.name.trim()) return;
    setNewPlanPhases(prev => [...prev, { ...inlinePhase }]);
    setInlinePhase({ name: "", date: "", price: "" });
  };

  const removeInlinePhase = (idx: number) => {
    setNewPlanPhases(prev => prev.filter((_, i) => i !== idx));
  };

  // ============ HANDLERS ============
  const handleAddPlan = async () => {
    if (!newPlan.title) return;
    const planData = {
      title: newPlan.title,
      status: "Active",
      notes: newPlan.notes,
      phases: newPlanPhases.map(p => ({
        name: p.name,
        date: p.date,
        price: p.price,
        status: "Planned"
      }))
    };
    
    const res = await createTreatmentPlan(patientId, planData);
    if (res.success) {
      await loadPlans();
      setExpandedPlan(res.data.id);
      onRefresh?.();
    }
    
    setNewPlanDialog(false);
    setNewPlan({ title: "", notes: "" });
    setNewPlanPhases([]);
    setInlinePhase({ name: "", date: "", price: "" });
  };

  const handleDeletePlan = async (id: string) => {
    const res = await deleteTreatmentPlan(id, patientId);
    if (res.success) {
      setPlans(prev => prev.filter(p => p.id !== id));
      onRefresh?.();
    }
    setDeleteConfirm(null);
  };

  const handleAddPhase = async (planId: string) => {
    if (!newPhase.name) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const step = plan.phases.length + 1;
    const res = await addTreatmentPhase(planId, newPhase, step, patientId);
    if (res.success) {
      await loadPlans();
      onRefresh?.();
    }
    
    setNewPhase({ name: "", date: "", price: "", notes: "" });
    setAddPhaseDialog(null);
  };

  const handleDeletePhase = async (planId: string, phaseId: string) => {
    const res = await deleteTreatmentPhase(phaseId, patientId);
    if (res.success) {
      await loadPlans();
      onRefresh?.();
    }
  };

  const cyclePhaseStatus = async (planId: string, phaseId: string) => {
    const statusOrder: PhaseStatus[] = ["Planned", "In Progress", "Completed", "Cancelled"];
    const plan = plans.find(p => p.id === planId);
    const phase = plan?.phases.find(ph => ph.id === phaseId);
    if (!phase) return;
    
    const currentIdx = statusOrder.indexOf(phase.status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    
    // Optimistic update
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const updatedPhases = p.phases.map(ph => {
        if (ph.id !== phaseId) return ph;
        return { ...ph, status: nextStatus };
      });
      const progress = calcProgress(updatedPhases);
      return { ...p, phases: updatedPhases, progress };
    }));
    
    const res = await updatePhaseStatus(phaseId, nextStatus, patientId);
    if (res.success) {
      onRefresh?.();
    } else {
      // Revert if failed (simplified: just reload)
      await loadPlans();
    }
  };

  const changePlanStatus = async (planId: string, status: PlanStatus) => {
    const res = await updatePlanStatus(planId, status, patientId);
    if (res.success) {
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status } : p));
      onRefresh?.();
    }
    setEditPlanDialog(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Treatment Plans</h3>
          <p className="text-sm text-gray-500">Manage phased treatments and progress.</p>
        </div>
        <Button onClick={() => setNewPlanDialog(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-white font-medium">
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
      </div>

      {/* Plans Summary */}
      {plans.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-xl font-black text-blue-700">{plans.filter(p => p.status === "Active").length}</p>
            <p className="text-[10px] text-blue-500 font-medium">Active Plans</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-xl font-black text-emerald-700">{plans.filter(p => p.status === "Completed").length}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Completed</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="text-xl font-black text-gray-700">{plans.reduce((s, p) => s + p.phases.length, 0)}</p>
            <p className="text-[10px] text-gray-500 font-medium">Total Phases</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <p className="text-xl font-black text-purple-700">
              ${plans.reduce((s, p) => {
                const n = parseFloat(p.cost.replace(/[^0-9.]/g, ""));
                return s + (isNaN(n) ? 0 : n);
              }, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-purple-500 font-medium">Total Cost</p>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="grid gap-6">
        {plans.length > 0 ? plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const sc = PLAN_STATUS_COLORS[plan.status];
          return (
            <Card key={plan.id} className={`border-0 shadow-sm overflow-hidden ${plan.status === "Active" ? "ring-2 " + sc.border : ""}`}>
              <CardContent className="p-0">
                {/* Plan Header */}
                <div
                  className={`p-5 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors ${
                    plan.status === "Active" ? "bg-blue-50/30" : plan.status === "Completed" ? "bg-emerald-50/20" : "bg-gray-50/50"
                  }`}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-bold text-gray-900">{plan.title}</h4>
                      <Badge className={`rounded-full text-[10px] ${sc.bg} ${sc.text} border-0`}>
                        {plan.status === "Active" ? <PlayCircle className="w-3 h-3 mr-1" /> : plan.status === "Completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : plan.status === "On Hold" ? <Clock className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Plan ID: {plan.id} · Created on {plan.created}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Est. Cost</p>
                      <p className="text-lg font-bold text-emerald-600">{plan.cost}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 animate-fade-in-up">
                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Treatment Phases</span>
                        <span className="text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          {plan.progress}% Progress
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Phases Timeline */}
                    {plan.phases.length > 0 ? (
                      <div className="space-y-3 relative before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-gray-100">
                        {plan.phases.map((phase) => {
                          const phConfig = PHASE_STATUS_ICONS[phase.status];
                          const Icon = phConfig.icon;
                          return (
                            <div key={phase.id} className="flex gap-4 relative group">
                              {/* Status dot — click to cycle */}
                              <button
                                onClick={() => cyclePhaseStatus(plan.id, phase.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 transition-all hover:scale-110 hover:shadow-md ${phConfig.bg}`}
                                title="Click to change status"
                              >
                                <Icon className={`w-4 h-4 ${phConfig.color}`} />
                              </button>
                              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${phase.status === 'Completed' ? 'text-gray-900' : phase.status === 'Cancelled' ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                    {phase.step}. {phase.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <p className="text-xs text-gray-400">{phase.date}</p>
                                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 rounded-full
                                      ${phase.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                        phase.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                        phase.status === "Cancelled" ? "bg-red-50 text-red-500 border-red-200" :
                                        "bg-gray-50 text-gray-500 border-gray-200"}`}
                                    >
                                      {phase.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className={`text-sm font-bold ${phase.status === 'Completed' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {phase.price}
                                  </p>
                                  <button
                                    onClick={() => handleDeletePhase(plan.id, phase.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No phases added yet</p>
                        <p className="text-xs text-gray-300 mt-1">Add treatment phases to track progress</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        onClick={() => setAddPhaseDialog(plan.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-semibold shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Phase
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditPlanDialog(plan.id)}
                        className="rounded-lg h-8 text-xs font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Change Status
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(plan.id)}
                        className="rounded-lg h-8 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Plan
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">No treatment plans yet</p>
            <Button size="sm" variant="link" onClick={() => setNewPlanDialog(true)} className="text-blue-600 text-xs mt-1">+ Create your first plan</Button>
          </div>
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* New Plan Dialog */}
      <Dialog open={newPlanDialog} onOpenChange={setNewPlanDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Create New Treatment Plan
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Plan Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Treatment Title *</label>
              <input
                type="text"
                value={newPlan.title}
                onChange={(e) => setNewPlan(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Root Canal & Crown (Tooth #16)"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical Notes</label>
              <textarea
                value={newPlan.notes}
                onChange={(e) => setNewPlan(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional details about the treatment plan..."
                className="w-full h-16 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            {/* ---- Treatment Phases Section ---- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Treatment Phases</label>
                <div className="flex items-center gap-3">
                  {newPlanPhases.length > 0 && (
                    <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50 border-emerald-200">
                      Est. ${newPlanTotalCost.toLocaleString()}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[9px]">{newPlanPhases.length} phases</Badge>
                </div>
              </div>

              {/* Added phases list */}
              {newPlanPhases.length > 0 && (
                <div className="space-y-2">
                  {newPlanPhases.map((ph, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 group">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{ph.name}</p>
                        <p className="text-[10px] text-gray-400">{ph.date || "TBD"} · {ph.price || "$0"}</p>
                      </div>
                      <button onClick={() => removeInlinePhase(idx)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick select presets */}
              <div className="flex flex-wrap gap-1.5">
                {TREATMENT_PRESETS.filter(t => !newPlanPhases.find(p => p.name === t)).slice(0, 10).map(t => (
                  <button key={t} onClick={() => setInlinePhase(p => ({ ...p, name: t }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      inlinePhase.name === t ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200"
                    }`}>{t}</button>
                ))}
              </div>

              {/* Inline add phase form */}
              <div className="p-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 space-y-3">
                <input
                  type="text"
                  value={inlinePhase.name}
                  onChange={(e) => setInlinePhase(p => ({ ...p, name: e.target.value }))}
                  placeholder="Phase name (e.g., Root Canal Treatment)"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  onKeyDown={(e) => e.key === "Enter" && addInlinePhase()}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={inlinePhase.date}
                    onChange={(e) => setInlinePhase(p => ({ ...p, date: e.target.value }))}
                    placeholder="Date"
                    className="h-9 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                  <input
                    type="text"
                    value={inlinePhase.price}
                    onChange={(e) => setInlinePhase(p => ({ ...p, price: e.target.value }))}
                    placeholder="Price"
                    className="h-9 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                  <Button
                    size="sm"
                    onClick={addInlinePhase}
                    disabled={!inlinePhase.name.trim()}
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setNewPlanDialog(false); setNewPlanPhases([]); setInlinePhase({ name: "", date: "", price: "" }); }} className="flex-1 rounded-xl h-11">Cancel</Button>
              <Button onClick={handleAddPlan} disabled={!newPlan.title.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-md shadow-blue-500/20">
                <Save className="w-4 h-4 mr-2" /> Create Plan
                {newPlanPhases.length > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white text-[9px]">{newPlanPhases.length} phases</Badge>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Phase Dialog */}
      <Dialog open={addPhaseDialog !== null} onOpenChange={(o) => !o && setAddPhaseDialog(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 m-0">
            <DialogTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Add Treatment Phase
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {/* Quick presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Select</label>
              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                {TREATMENT_PRESETS.map(t => (
                  <button key={t} onClick={() => setNewPhase(p => ({ ...p, name: t }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      newPhase.name === t ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phase Name *</label>
              <input type="text" value={newPhase.name} onChange={(e) => setNewPhase(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Crown Preparation" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                <input type="text" value={newPhase.date} onChange={(e) => setNewPhase(p => ({ ...p, date: e.target.value }))} placeholder="Apr 15, 2024" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price</label>
                <input type="text" value={newPhase.price} onChange={(e) => setNewPhase(p => ({ ...p, price: e.target.value }))} placeholder="$400" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
              <textarea value={newPhase.notes} onChange={(e) => setNewPhase(p => ({ ...p, notes: e.target.value }))} placeholder="Phase details..." className="w-full h-16 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
            </div>
            <Button onClick={() => addPhaseDialog && handleAddPhase(addPhaseDialog)} disabled={!newPhase.name.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-semibold shadow-md shadow-emerald-500/20">
              <Save className="w-4 h-4 mr-2" /> Add Phase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={editPlanDialog !== null} onOpenChange={(o) => !o && setEditPlanDialog(null)}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" /> Change Plan Status
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 grid grid-cols-2 gap-3">
            {(["Active", "Completed", "On Hold", "Cancelled"] as PlanStatus[]).map(s => {
              const c = PLAN_STATUS_COLORS[s];
              const isActive = editPlanDialog ? plans.find(p => p.id === editPlanDialog)?.status === s : false;
              return (
                <button
                  key={s}
                  onClick={() => editPlanDialog && changePlanStatus(editPlanDialog, s)}
                  className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    isActive ? `${c.bg} ${c.text} border-current ring-2 ring-offset-2 ring-blue-300` : `bg-white border-gray-200 text-gray-600 hover:bg-gray-50`
                  }`}
                >{s}</button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Plan?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone. All phases will be removed.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={() => deleteConfirm && handleDeletePlan(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-500/20">
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
