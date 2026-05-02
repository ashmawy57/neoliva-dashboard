"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Smile, Lightbulb, MessageSquare, FileText, Plus, X, Save, Trash2, AlertTriangle,
  Stethoscope, Pill, ChevronDown, Check, ClipboardList, Loader2
} from "lucide-react";
import { 
  updateOralTissue, 
  addVisitRecord, 
  updatePatientNotes, 
  updateOralCondition,
  addPrescription as addPrescriptionAction,
  deletePrescription as deletePrescriptionAction,
  deleteVisitRecord
} from "@/app/actions/patients";
import { useRef } from "react";

// ============ TYPES ============
type TissueStatus = "healthy" | "needs attention" | "pathological";

interface TissueItem {
  name: string;
  status: TissueStatus;
  notes: string;
}

interface OralCondition {
  id: string;
  name: string;
  active: boolean;
}

interface Diagnosis {
  id: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  severity: "mild" | "moderate" | "severe";
  notes: string;
}

interface PrescriptionItem {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

// ============ STATUS CONFIGS ============
const STATUS_OPTIONS: { value: TissueStatus; label: string; color: string; dotColor: string }[] = [
  { value: "healthy", label: "healthy", color: "bg-gray-100 text-gray-700 border-gray-200", dotColor: "bg-emerald-500" },
  { value: "needs attention", label: "needs attention", color: "bg-blue-500 text-white border-blue-600", dotColor: "bg-blue-500" },
  { value: "pathological", label: "pathological", color: "bg-red-500 text-white border-red-600", dotColor: "bg-red-500" },
];

const DEFAULT_CONDITIONS: OralCondition[] = [
  { id: "c1", name: "Erosion", active: true },
  { id: "c2", name: "Gingivitis", active: true },
  { id: "c3", name: "Herpes", active: true },
  { id: "c4", name: "Xerostomia", active: true },
];

const ALL_CONDITIONS_LIBRARY = [
  "Erosion", "Gingivitis", "Herpes", "Xerostomia",
  "Periodontitis", "Bruxism", "Oral Candidiasis", "Leukoplakia",
  "Aphthous Ulcer", "Oral Lichen Planus", "TMJ Disorder", "Halitosis",
  "Dental Fluorosis", "Oral Cancer", "Burning Mouth Syndrome",
];

export function OralExam({ patient, onRefresh }: { patient: any; onRefresh?: () => void }) {
  const [isPending, startTransition] = useTransition();
  // ============ STATE ============
  const [tissues, setTissues] = useState<TissueItem[]>([]);
  const [conditions, setConditions] = useState<OralCondition[]>([]);
  const [otherNotes, setOtherNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);

  // Use a ref to track if we're currently updating to avoid useEffect stomping on local state
  const isUpdatingRef = useRef(false);

  // Sync state when patient prop changes (Fixes the "disappearing data" bug)
  useEffect(() => {
    if (!patient || isUpdatingRef.current) return;

    // Tissue Findings
    const defaultNames = [
      "Lips", "Buccal Mucosa", "Tongue", "Floor of Mouth", "Palate", "Gingiva",
      "Salivary Glands", "Occlusion", "Pharynx"
    ];
    const existingTissues = patient.oralTissueFindings || [];
    setTissues(defaultNames.map(name => {
      const found = existingTissues.find((e: any) => e.name === name);
      return { 
        name, 
        status: (found?.status as TissueStatus) || "healthy", 
        notes: found?.notes || "" 
      };
    }));

    // Oral Conditions
    const conds = patient.oralConditions || [];
    setConditions(conds.length > 0 ? conds.map((c: any) => ({
      id: c.id, name: c.name, active: c.active
    })) : DEFAULT_CONDITIONS);

    // Diagnoses
    const visits = patient.visitHistory || [];
    setDiagnoses(visits.filter((v: any) => v.isClinicalRecord || v.treatment !== '—').map((v: any) => ({
      id: v.id,
      date: v.date,
      chiefComplaint: v.chiefComplaint || v.notes?.split('\n')[0] || "",
      diagnosis: v.treatment || v.diagnosis || v.type,
      severity: "moderate" as const,
      notes: v.notes || ""
    })));

    // Prescriptions
    const pxs = patient.prescriptions || [];
    setPrescriptions(pxs.map((p: any) => ({
      id: p.id,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
      medication: p.prescription_items?.[0]?.medication_name || "Unknown",
      dosage: p.prescription_items?.[0]?.dosage || "",
      frequency: p.prescription_items?.[0]?.frequency || "",
      duration: p.prescription_items?.[0]?.duration || "",
      notes: p.notes || ""
    })));

    setOtherNotes(patient.notes || "");
  }, [patient]);

  // ============ HANDLERS ============
  const handleTissueStatusChange = (index: number, status: TissueStatus) => {
    const tissue = tissues[index];
    setTissues(prev => prev.map((t, i) => i === index ? { ...t, status } : t));
    
    isUpdatingRef.current = true;
    startTransition(async () => {
      try {
        await updateOralTissue(patient.id, tissue.name, status, tissue.notes || "");
        onRefresh?.();
      } finally {
        isUpdatingRef.current = false;
      }
    });
  };

  // Dialog states
  const [tissueDialog, setTissueDialog] = useState<number | null>(null); // index of tissue being edited
  const [conditionsDialog, setConditionsDialog] = useState(false);
  const [diagnosisDialog, setDiagnosisDialog] = useState(false);
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [viewDiagnosesDialog, setViewDiagnosesDialog] = useState(false);
  const [viewPrescriptionsDialog, setViewPrescriptionsDialog] = useState(false);

  // Form states
  const [newConditionName, setNewConditionName] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState<Omit<Diagnosis, "id" | "date">>({
    chiefComplaint: "", diagnosis: "", severity: "mild", notes: "",
  });
  const [newPrescription, setNewPrescription] = useState<Omit<PrescriptionItem, "id" | "date">>({
    medication: "", dosage: "", frequency: "", duration: "", notes: "",
  });

  const handleTissueNoteSave = (index: number, notes: string) => {
    const tissue = tissues[index];
    setTissues(prev => prev.map((t, i) => i === index ? { ...t, notes } : t));
    setTissueDialog(null);

    isUpdatingRef.current = true;
    startTransition(async () => {
      try {
        await updateOralTissue(patient.id, tissue.name, tissue.status, notes);
        onRefresh?.();
      } finally {
        isUpdatingRef.current = false;
      }
    });
  };

  const toggleCondition = (id: string) => {
    const cond = conditions.find(c => c.id === id);
    if (!cond) return;
    const newActive = !cond.active;
    setConditions(prev => prev.map(c => c.id === id ? { ...c, active: newActive } : c));
    
    startTransition(async () => {
      await updateOralCondition(patient.id, cond.name, newActive);
      onRefresh?.();
    });
  };

  const addCondition = (name: string) => {
    if (!name.trim()) return;
    const exists = conditions.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      if (!exists.active) toggleCondition(exists.id);
      return;
    }
    
    const newName = name.trim();
    setConditions(prev => [...prev, { id: `c-${Date.now()}`, name: newName, active: true }]);
    setNewConditionName("");

    startTransition(async () => {
      await updateOralCondition(patient.id, newName, true);
      onRefresh?.();
    });
  };

  const removeCondition = (id: string) => {
    const cond = conditions.find(c => c.id === id);
    if (!cond) return;
    
    setConditions(prev => prev.filter(c => c.id !== id));

    startTransition(async () => {
      await updateOralCondition(patient.id, cond.name, false);
      onRefresh?.();
    });
  };

  const addDiagnosis = () => {
    if (!newDiagnosis.chiefComplaint.trim() || !newDiagnosis.diagnosis.trim()) return;
    
    const d: Diagnosis = {
      id: `d-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      ...newDiagnosis,
    };
    
    setDiagnoses(prev => [d, ...prev]);
    
    startTransition(async () => {
      await addVisitRecord(patient.id, {
        treatment: newDiagnosis.diagnosis,
        doctor: "Current User", // In a real app, get from session
        notes: `${newDiagnosis.chiefComplaint}\n${newDiagnosis.notes}`,
        date: new Date().toISOString()
      });
      onRefresh?.();
    });

    setNewDiagnosis({ chiefComplaint: "", diagnosis: "", severity: "mild", notes: "" });
    setDiagnosisDialog(false);
  };

  const deleteDiagnosis = (id: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== id));
    startTransition(async () => {
      await deleteVisitRecord(id, patient.id);
      onRefresh?.();
    });
  };

  const addPrescription = () => {
    if (!newPrescription.medication.trim() || !newPrescription.dosage.trim()) return;
    
    startTransition(async () => {
      const data = {
        doctor_name: "Current Doctor",
        notes: newPrescription.notes,
        medications: [
          {
            name: newPrescription.medication,
            dosage: newPrescription.dosage,
            frequency: newPrescription.frequency,
            duration: newPrescription.duration
          }
        ]
      };
      
      const result = await addPrescriptionAction(patient.id, data);
      if (result.success) {
        onRefresh?.();
      }
    });

    setNewPrescription({ medication: "", dosage: "", frequency: "", duration: "", notes: "" });
    setPrescriptionDialog(false);
  };

  const deletePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
    startTransition(async () => {
      await deletePrescriptionAction(id, patient.id);
      onRefresh?.();
    });
  };

  const getStatusConfig = (status: TissueStatus) => STATUS_OPTIONS.find(s => s.value === status)!;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* =============== Soft Tissue Examination =============== */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Smile className="w-4 h-4 text-blue-500" /> Soft Tissue Examination
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {tissues.map((item, idx) => {
            return (
              <div key={item.name} className="flex items-center justify-between py-1 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[120px]">{item.name}</span>
                  {item.notes && (
                    <button onClick={() => setTissueDialog(idx)} className="text-[10px] text-blue-500 hover:underline">
                      View Notes
                    </button>
                  )}
                </div>
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleTissueStatusChange(idx, "healthy")}
                    disabled={isPending}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                      item.status === "healthy" 
                        ? "bg-white text-emerald-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => handleTissueStatusChange(idx, "pathological")}
                    disabled={isPending}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                      item.status === "pathological" 
                        ? "bg-white text-red-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Abnormal
                  </button>
                </div>
                
                <button 
                  onClick={() => setTissueDialog(idx)}
                  className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* =============== Diseases and Conditions =============== */}
      <Card className="border-0 shadow-sm bg-orange-50/50">
        <CardHeader className="pb-3 border-b border-orange-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-orange-800 flex items-center gap-2">
            Diseases and conditions of the mouth
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {conditions.filter(c => c.active).map((cond) => (
              <div 
                key={cond.id} 
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-center text-gray-700 font-medium shadow-sm flex items-center justify-center gap-2 group hover:border-red-200 transition-colors"
              >
                <span>{cond.name}</span>
                <button 
                  onClick={() => toggleCondition(cond.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {conditions.filter(c => c.active).length === 0 && (
              <p className="text-sm text-gray-400 col-span-2 text-center py-3">No active conditions</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button 
              variant="link" 
              onClick={() => setConditionsDialog(true)}
              className="text-blue-600 text-xs gap-1 h-auto p-0 font-medium"
            >
              Manage the oral conditions list <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ml-1"><Plus className="w-3 h-3" /></div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =============== Other Conditions Notes =============== */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Other disease/health condition:
          </CardTitle>
          <button 
            onClick={() => {
              if (isEditingNotes) {
                startTransition(async () => {
                  await updatePatientNotes(patient.id, otherNotes);
                  onRefresh?.();
                });
              }
              setIsEditingNotes(!isEditingNotes);
            }}
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-600 transition"
          >
            {isEditingNotes ? <Check className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
          </button>
        </CardHeader>
        <CardContent className="pt-4">
          {isEditingNotes ? (
            <textarea
              value={otherNotes}
              onChange={(e) => setOtherNotes(e.target.value)}
              placeholder="Note any important information regarding the patient's oral health..."
              className="w-full min-h-[120px] p-4 rounded-xl border border-blue-200 bg-blue-50/30 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              autoFocus
            />
          ) : (
            <div 
              className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 flex gap-2 w-full min-h-[100px] cursor-pointer hover:bg-gray-100/50 transition-colors"
              onClick={() => setIsEditingNotes(true)}
            >
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              {otherNotes || "Note any important information regarding the patient's oral health"}
            </div>
          )}
          {otherNotes && !isEditingNotes && (
            <div className="flex justify-end mt-2">
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">✓ Saved</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =============== Diagnoses and Prescriptions Buttons =============== */}
      <div className="space-y-3 pt-2">
        <div className="w-full bg-amber-100/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider py-2.5 text-center rounded-lg border border-amber-200">
          Diagnoses and prescriptions
          <span className="ml-2 text-amber-600 font-normal lowercase">
            ({diagnoses.length} diagnoses · {prescriptions.length} prescriptions)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => setViewDiagnosesDialog(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 uppercase tracking-wide"
          >
            Diagnosis & Chief Complaint
            {diagnoses.length > 0 && (
              <Badge className="ml-2 bg-white/20 text-white text-[10px]">{diagnoses.length}</Badge>
            )}
          </Button>
          <Button 
            onClick={() => setViewPrescriptionsDialog(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 uppercase tracking-wide"
          >
            Prescription
            {prescriptions.length > 0 && (
              <Badge className="ml-2 bg-white/20 text-white text-[10px]">{prescriptions.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Tissue Status Change Dialog */}
      <Dialog open={tissueDialog !== null} onOpenChange={(open) => !open && setTissueDialog(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Smile className="w-5 h-5 text-blue-600" /> 
              {tissueDialog !== null ? tissues[tissueDialog]?.name : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            {/* Status Selection */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</p>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => tissueDialog !== null && handleTissueStatusChange(tissueDialog, opt.value)}
                    className={`px-3 py-3 rounded-xl text-xs font-semibold border-2 transition-all flex flex-col items-center gap-1.5 ${
                      tissueDialog !== null && tissues[tissueDialog]?.status === opt.value
                        ? `${opt.color} ring-2 ring-offset-2 ring-blue-300 shadow-md scale-[1.02]`
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${opt.dotColor}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Note */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical Notes</p>
              <textarea
                value={tissueDialog !== null ? tissues[tissueDialog]?.notes || "" : ""}
                onChange={(e) => {
                  if (tissueDialog !== null) {
                    setTissues(prev => prev.map((t, i) => i === tissueDialog ? { ...t, notes: e.target.value } : t));
                  }
                }}
                placeholder="Add any observations about this tissue area..."
                className="w-full h-24 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <Button 
              onClick={() => {
                if (tissueDialog !== null) {
                  handleTissueNoteSave(tissueDialog, tissues[tissueDialog].notes);
                }
              }}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-semibold shadow-md shadow-blue-500/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Conditions Dialog */}
      <Dialog open={conditionsDialog} onOpenChange={setConditionsDialog}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-orange-100 bg-orange-50 m-0">
            <DialogTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" /> Manage Oral Conditions
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Add custom condition */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newConditionName}
                onChange={(e) => setNewConditionName(e.target.value)}
                placeholder="Add custom condition..."
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                onKeyDown={(e) => e.key === "Enter" && addCondition(newConditionName)}
              />
              <Button 
                onClick={() => addCondition(newConditionName)}
                disabled={!newConditionName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick-add from library */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conditions Library</p>
              <div className="flex flex-wrap gap-2">
                {ALL_CONDITIONS_LIBRARY.map(name => {
                  const existing = conditions.find(c => c.name === name);
                  const isActive = existing?.active;
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        if (existing) {
                          toggleCondition(existing.id);
                        } else {
                          addCondition(name);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 inline mr-1" />}
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active conditions list */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Conditions ({conditions.filter(c => c.active).length})
              </p>
              {conditions.filter(c => c.active).map(cond => (
                <div key={cond.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-gray-700">{cond.name}</span>
                  </div>
                  <button onClick={() => removeCondition(cond.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Diagnoses Dialog */}
      <Dialog open={viewDiagnosesDialog} onOpenChange={setViewDiagnosesDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" /> Diagnosis & Chief Complaint
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <Button 
              onClick={() => { setViewDiagnosesDialog(false); setDiagnosisDialog(true); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-semibold shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Diagnosis
            </Button>

            <div className="space-y-3">
              {diagnoses.length > 0 ? diagnoses.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-3 group hover:border-blue-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          d.severity === "severe" ? "bg-red-100 text-red-700 border-red-200" :
                          d.severity === "moderate" ? "bg-amber-100 text-amber-700 border-amber-200" :
                          "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}>
                          {d.severity}
                        </Badge>
                        <span className="text-[10px] text-gray-400">{d.date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{d.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-1"><span className="font-semibold">Chief Complaint:</span> {d.chiefComplaint}</p>
                      {d.notes && <p className="text-xs text-gray-500 mt-1.5 bg-white p-2 rounded-lg border border-gray-100">{d.notes}</p>}
                    </div>
                    <button onClick={() => deleteDiagnosis(d.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-6">No diagnoses recorded yet</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Diagnosis Form Dialog */}
      <Dialog open={diagnosisDialog} onOpenChange={setDiagnosisDialog}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" /> New Diagnosis
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chief Complaint *</label>
              <input
                type="text"
                value={newDiagnosis.chiefComplaint}
                onChange={(e) => setNewDiagnosis(p => ({ ...p, chiefComplaint: e.target.value }))}
                placeholder="What is the patient's main concern?"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnosis *</label>
              <input
                type="text"
                value={newDiagnosis.diagnosis}
                onChange={(e) => setNewDiagnosis(p => ({ ...p, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis..."
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {(["mild", "moderate", "severe"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setNewDiagnosis(p => ({ ...p, severity: s }))}
                    className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                      newDiagnosis.severity === s 
                        ? s === "severe" ? "bg-red-50 border-red-400 text-red-700"
                          : s === "moderate" ? "bg-amber-50 border-amber-400 text-amber-700"
                          : "bg-emerald-50 border-emerald-400 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
              <textarea
                value={newDiagnosis.notes}
                onChange={(e) => setNewDiagnosis(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional observations..."
                className="w-full h-20 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <Button 
              onClick={addDiagnosis}
              disabled={!newDiagnosis.chiefComplaint.trim() || !newDiagnosis.diagnosis.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-blue-500/20"
            >
              <Save className="w-4 h-4 mr-2" /> Save Diagnosis
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Prescriptions Dialog */}
      <Dialog open={viewPrescriptionsDialog} onOpenChange={setViewPrescriptionsDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" /> Prescriptions
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <Button 
              onClick={() => { setViewPrescriptionsDialog(false); setPrescriptionDialog(true); }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 text-sm font-semibold shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Prescription
            </Button>

            <div className="space-y-3">
              {prescriptions.length > 0 ? prescriptions.map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-2 group hover:border-purple-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-gray-900">{p.medication}</span>
                        <span className="text-[10px] text-gray-400">{p.date}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Dosage</p>
                          <p className="text-xs font-semibold text-gray-700">{p.dosage}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Frequency</p>
                          <p className="text-xs font-semibold text-gray-700">{p.frequency}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Duration</p>
                          <p className="text-xs font-semibold text-gray-700">{p.duration}</p>
                        </div>
                      </div>
                      {p.notes && <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded-lg border border-gray-100">📋 {p.notes}</p>}
                    </div>
                    <button onClick={() => deletePrescription(p.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-6">No prescriptions yet</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Prescription Form Dialog */}
      <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-purple-100 bg-purple-50 m-0">
            <DialogTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" /> New Prescription
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medication *</label>
              <input
                type="text"
                value={newPrescription.medication}
                onChange={(e) => setNewPrescription(p => ({ ...p, medication: e.target.value }))}
                placeholder="e.g., Amoxicillin 500mg"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dosage *</label>
                <input
                  type="text"
                  value={newPrescription.dosage}
                  onChange={(e) => setNewPrescription(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="e.g., 1 tablet"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</label>
                <input
                  type="text"
                  value={newPrescription.frequency}
                  onChange={(e) => setNewPrescription(p => ({ ...p, frequency: e.target.value }))}
                  placeholder="e.g., 3x daily"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
                <input
                  type="text"
                  value={newPrescription.duration}
                  onChange={(e) => setNewPrescription(p => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g., 7 days"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
              <textarea
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription(p => ({ ...p, notes: e.target.value }))}
                placeholder="Special instructions..."
                className="w-full h-20 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
              />
            </div>
            <Button 
              onClick={addPrescription}
              disabled={!newPrescription.medication.trim() || !newPrescription.dosage.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-purple-500/20"
            >
              <Save className="w-4 h-4 mr-2" /> Save Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
