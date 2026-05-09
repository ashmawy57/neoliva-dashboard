"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  RefreshCw, 
  Stethoscope, 
  Image as ImageIcon, 
  PenTool, 
  Trash2, 
  FileText, 
  Camera, 
  AlertTriangle, 
  Edit3, 
  Check,
  Save,
  Plus,
  Info as InfoIcon
} from "lucide-react";
import { 
  updateToothCondition, 
  uploadToothPhoto, 
  deleteToothPhoto, 
  updatePatientNotes 
} from "@/app/actions/patients";

import { 
  ToothCondition as ToothCondType, 
  ToothType, 
  SurfaceColor, 
  SurfaceKey, 
  ToothSurfaces, 
  ClinicalFinding, 
  ToothPhoto, 
  ToothMeta,
  emptySurfaces,
  defaultMeta,
  parseToothMeta,
  TOOTH_CONDITIONS,
  SURFACE_COLORS,
  SURFACE_LABELS,
  DentalGrid,
  ToothVisual,
  ToothCell,
  SurfacesPopover
} from "@/components/shared/dental";
import { cn } from "@/lib/utils";

export function ToothChart({ patient, onRefresh }: { patient: any; onRefresh?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);

  // Core Chart State
  const [toothConditions, setToothConditions] = useState<Record<number, ToothCondType>>({});
  const [toothMeta, setToothMeta] = useState<Record<number, ToothMeta>>({});
  const [photos, setPhotos] = useState<ToothPhoto[]>([]);
  
  // Note State
  const [chartNote, setChartNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isSavingNote, startNoteSave] = useTransition();

  // Dialog States
  const [findingsDialog, setFindingsDialog] = useState<number | null>(null);
  const [photosDialog, setPhotosDialog] = useState<number | null>(null);
  const [extractionDialog, setExtractionDialog] = useState<number | null>(null);
  const [colorCodeDialog, setColorCodeDialog] = useState(false);

  // Finding/Parameter form state
  const [findingType, setFindingType] = useState<"finding" | "parameter">("finding");
  const [newFinding, setNewFinding] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // 1. Initialize State from Patient Data
  useEffect(() => {
    if (!patient || isUpdatingRef.current) return;

    // Map Tooth Conditions
    const conditions: Record<number, ToothCondType> = {};
    const meta: Record<number, ToothMeta> = {};
    
    (patient.toothConditions || []).forEach((c: any) => {
      // FIX BUG #1: Use toothNumber (camelCase) instead of tooth_number (snake_case from DB)
      const tNum = c.toothNumber; 
      if (tNum) {
        conditions[tNum] = c.condition as ToothCondType;
        meta[tNum] = parseToothMeta(c.notes);
      }
    });

    setToothConditions(conditions);
    setToothMeta(meta);
    setChartNote(patient.notes || "");

    // Map Photos (PatientDocuments with specific type)
    const toothPhotos: ToothPhoto[] = (patient.patient_documents || [])
      .filter((doc: any) => doc.type?.startsWith("TOOTH_PHOTO_"))
      .map((doc: any) => {
        const tooth = parseInt(doc.type.split("_").pop() || "0");
        return {
          id: doc.id,
          tooth,
          url: doc.fileUrl,
          name: doc.name,
          date: new Date(doc.uploadDate || doc.createdAt).toLocaleDateString(),
          size: "Live"
        };
      });
    setPhotos(toothPhotos);
  }, [patient]);

  // 2. Persistence Handlers
  const currentCondition = (tooth: number) => toothConditions[tooth] || "healthy";
  const currentMeta = (tooth: number) => toothMeta[tooth] || defaultMeta();

  const persistChange = async (tooth: number, condition: ToothCondType, meta: ToothMeta) => {
    isUpdatingRef.current = true;
    setIsUpdating(true);
    
    try {
      const result = await updateToothCondition(
        patient.id, 
        tooth, 
        condition, 
        JSON.stringify(meta)
      );
      
      if (result.success) {
        onRefresh?.();
      }
    } finally {
      setIsUpdating(false);
      isUpdatingRef.current = false;
    }
  };

  const handleConditionChange = (tooth: number, cond: ToothCondType) => {
    const prevCond = currentCondition(tooth);
    if (prevCond === cond) return;

    setToothConditions(prev => ({ ...prev, [tooth]: cond }));
    persistChange(tooth, cond, currentMeta(tooth));
  };

  const handleToggleToothType = (tooth: number) => {
    const meta = currentMeta(tooth);
    const newType: ToothType = meta.toothType === 'permanent' ? 'primary' : 'permanent';
    const newMeta = { ...meta, toothType: newType };
    
    setToothMeta(prev => ({ ...prev, [tooth]: newMeta }));
    persistChange(tooth, currentCondition(tooth), newMeta);
  };

  const handleSurfaceChange = (tooth: number, surface: SurfaceKey, color: SurfaceColor) => {
    const meta = currentMeta(tooth);
    const newMeta = {
      ...meta,
      surfaces: { ...meta.surfaces, [surface]: color }
    };
    
    setToothMeta(prev => ({ ...prev, [tooth]: newMeta }));
    persistChange(tooth, currentCondition(tooth), newMeta);
  };

  const handleAddFinding = (tooth: number) => {
    if (!newFinding.trim()) return;
    
    const meta = currentMeta(tooth);
    const finding: ClinicalFinding = {
      id: Math.random().toString(36).substring(7),
      type: findingType,
      note: newFinding.trim(),
      date: new Date().toLocaleDateString()
    };
    
    const newMeta = {
      ...meta,
      findings: [finding, ...meta.findings]
    };
    
    setToothMeta(prev => ({ ...prev, [tooth]: newMeta }));
    setNewFinding("");
    persistChange(tooth, currentCondition(tooth), newMeta);
  };

  const handleDeleteFinding = (tooth: number, id: string) => {
    const meta = currentMeta(tooth);
    const newMeta = {
      ...meta,
      findings: meta.findings.filter(f => f.id !== id)
    };
    
    setToothMeta(prev => ({ ...prev, [tooth]: newMeta }));
    persistChange(tooth, currentCondition(tooth), newMeta);
  };

  const handleExtraction = (tooth: number) => {
    handleConditionChange(tooth, "extracted");
    setExtractionDialog(null);
  };

  const handleAddPhoto = async (tooth: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setPhotoUploading(true);
      setPhotoError(null);
      
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadToothPhoto(patient.id, tooth, formData);
      setPhotoUploading(false);
      
      if (res.success) {
        onRefresh?.();
      } else {
        setPhotoError(res.error || "Failed to upload photo");
      }
    };
    input.click();
  };

  const handleDeletePhoto = async (id: string, url: string) => {
    const res = await deleteToothPhoto(patient.id, id, url);
    if (res.success) {
      onRefresh?.();
    }
  };

  const renderTooth = (tooth: number, isTop: boolean) => {
    const cond = currentCondition(tooth);
    const meta = currentMeta(tooth);
    const type = meta.toothType;
    const surfaces = meta.surfaces;

    const getFillAndStroke = (c: ToothCondType) => {
      switch (c) {
        case "healthy": return { fill: "#ffffff", stroke: "#94a3b8" };
        case "caries": return { fill: "#ef4444", stroke: "#b91c1c" };
        case "filled": return { fill: "#3b82f6", stroke: "#1d4ed8" };
        case "extracted": return { fill: "#f1f5f9", stroke: "#cbd5e1" }; 
        case "crown": return { fill: "#facc15", stroke: "#ca8a04" };
        default: return { fill: "#ffffff", stroke: "#94a3b8" };
      }
    };

    const { fill, stroke } = getFillAndStroke(cond);

    return (
      <ToothCell
        key={tooth}
        toothId={tooth}
        isTop={isTop}
        toothType={type}
        fill={fill}
        stroke={stroke}
        isExtracted={cond === "extracted"}
        extraContent={
          <SurfacesPopover 
            tooth={tooth} 
            surfaces={surfaces} 
            onSurfaceChange={handleSurfaceChange} 
          />
        }
      >
        <Popover>
          <PopoverTrigger render={<button className="cursor-pointer group flex items-center justify-center focus:outline-none bg-transparent border-0 p-1 w-full hover:bg-gray-100 rounded-xl transition-colors" />}>
            <ToothVisual
              toothId={tooth}
              isTop={isTop}
              toothType={type}
              fill={fill}
              stroke={stroke}
              isExtracted={cond === "extracted"}
              className="group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-md mx-auto"
            />
            {isUpdating && <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl"><RefreshCw className="w-4 h-4 animate-spin text-blue-500" /></div>}
          </PopoverTrigger>

          <PopoverContent className="w-80 p-4 rounded-2xl shadow-xl border-gray-100 flex flex-col gap-4">
            <div className="text-center pb-3 border-b border-gray-100">
               <p className="text-lg font-bold text-gray-900">Tooth #{tooth}</p>
               <p className="text-xs text-gray-500 mt-0.5">Select condition or add findings</p>
               {type === "primary" && (
                 <Badge className="mt-1.5 bg-purple-50 text-purple-700 border-purple-200 text-[10px]">Primary (Deciduous)</Badge>
               )}
            </div>
            
            <div className="flex justify-between items-center bg-gray-50/80 p-2 rounded-xl border border-gray-100">
              {Object.entries(TOOTH_CONDITIONS).map(([key, val]) => (
                <button
                  key={key}
                  title={val.tooltip}
                  onClick={() => handleConditionChange(tooth, key as ToothCondType)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                    key === cond ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-100/50'
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border", val.color)} />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                 variant="outline" 
                 onClick={() => handleConditionChange(tooth, 'extracted')}
                 className="h-auto py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-gray-700 border-gray-200 hover:bg-gray-50"
              >
                 <span className="text-gray-400 text-lg font-black leading-none mb-0.5">X</span> Mark as missing
              </Button>
              <Button 
                 variant="outline" 
                 onClick={() => setExtractionDialog(tooth)}
                 className="h-auto py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-red-600 border-red-100 hover:bg-red-50"
              >
                 <span className="text-red-500 text-lg font-black leading-none mb-0.5">!</span> Extraction
              </Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="secondary" 
                onClick={() => handleToggleToothType(tooth)}
                className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2.5 text-gray-500" /> 
                Switch to {type === "permanent" ? "primary (deciduous)" : "permanent"}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setFindingsDialog(tooth)}
                className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10"
              >
                <Stethoscope className="w-4 h-4 mr-2.5 text-gray-500" /> Clinical findings & Parameters
                {(meta.findings?.length ?? 0) > 0 && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 text-[10px] px-1.5">{meta.findings.length}</Badge>
                )}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setPhotosDialog(tooth)}
                className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10"
              >
                <ImageIcon className="w-4 h-4 mr-2.5 text-gray-500" /> Photos containing this tooth
                {photos.filter(p => p.tooth === tooth).length > 0 && (
                  <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] px-1.5">{photos.filter(p => p.tooth === tooth).length}</Badge>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </ToothCell>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Adult Odontogram (FDI)</h3>
          <p className="text-sm text-gray-500">Interactive 32-tooth chart for mapping conditions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm cursor-help" onClick={() => setColorCodeDialog(true)}>
          {Object.entries(TOOTH_CONDITIONS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full border ${val.color}`} />
              <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                {val.label}
              </span>
            </div>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <InfoIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-8 relative">
          {isUpdating && (
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs font-bold text-gray-600">Updating Chart...</span>
              </div>
            </div>
          )}
          <DentalGrid renderTooth={renderTooth} />
        </CardContent>
      </Card>

      {/* Doctor's Chart Note */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Doctor&apos;s Chart Note
          </h3>
          {!isEditingNote ? (
            <button
              onClick={() => setIsEditingNote(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setChartNote(patient?.notes || ''); setIsEditingNote(false); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startNoteSave(async () => {
                    await updatePatientNotes(patient.id, chartNote);
                    setIsEditingNote(false);
                    onRefresh?.();
                  });
                }}
                disabled={isSavingNote}
                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingNote ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
              </button>
            </div>
          )}
        </div>
        {isEditingNote ? (
          <textarea
            value={chartNote}
            onChange={e => setChartNote(e.target.value)}
            placeholder="Add clinical notes about this patient's dental chart…"
            className="w-full h-28 rounded-xl border border-blue-200 bg-blue-50/30 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
          />
        ) : (
          <p className="text-sm text-gray-600 min-h-[2.5rem] whitespace-pre-wrap leading-relaxed">
            {chartNote || <span className="text-gray-400 italic">No notes recorded. Click Edit to add a note.</span>}
          </p>
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Clinical Findings Dialog */}
      <Dialog open={findingsDialog !== null} onOpenChange={(open) => !open && setFindingsDialog(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Tooth #{findingsDialog} — Clinical Findings
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFindingType("finding")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    findingType === "finding" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  Finding
                </button>
                <button
                  onClick={() => setFindingType("parameter")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    findingType === "parameter" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  Parameter
                </button>
              </div>
              <textarea
                value={newFinding}
                onChange={(e) => setNewFinding(e.target.value)}
                placeholder="Describe the clinical finding or parameter..."
                className="w-full h-20 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
              <Button 
                onClick={() => findingsDialog && handleAddFinding(findingsDialog)}
                disabled={!newFinding.trim() || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-semibold w-full shadow-md shadow-blue-500/20"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} 
                Add to Chart
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Findings</p>
              {findingsDialog !== null && (currentMeta(findingsDialog).findings ?? []).length > 0 ? (
                currentMeta(findingsDialog!).findings.map(f => (
                  <div key={f.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex gap-3 group">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      f.type === 'finding' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    )}>
                      {f.type === 'finding' ? <FileText className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{f.note}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{f.date} · {f.type === 'finding' ? 'Clinical Finding' : 'Parameter'}</p>
                    </div>
                    <button
                      onClick={() => findingsDialog !== null && handleDeleteFinding(findingsDialog, f.id)}
                      disabled={isUpdating}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No findings recorded yet</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photos Dialog */}
      <Dialog open={photosDialog !== null} onOpenChange={(open) => !open && setPhotosDialog(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" /> Tooth #{photosDialog} — Photos
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <Button
              onClick={() => photosDialog !== null && handleAddPhoto(photosDialog)}
              disabled={photoUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold w-full shadow-md shadow-emerald-500/20"
            >
              {photoUploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              {photoUploading ? 'Uploading…' : 'Upload Photo'}
            </Button>
            {photoError && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{photoError}</p>
            )}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attached Photos</p>
              {photos.filter(p => p.tooth === photosDialog).length > 0 ? (
                photos.filter(p => p.tooth === photosDialog).map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-3 group">
                    <a href={p.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 hover:bg-emerald-100 transition-colors">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                    </a>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.date}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(p.id, p.url)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No photos attached yet</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extraction Confirmation Dialog */}
      <Dialog open={extractionDialog !== null} onOpenChange={(open) => !open && setExtractionDialog(null)}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-red-100 bg-red-50 m-0">
            <DialogTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Confirm Extraction
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-700">
              Are you sure you want to mark <strong>Tooth #{extractionDialog}</strong> as <strong className="text-red-600">extracted</strong>?
              This will record the tooth as extracted and update the chart accordingly.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setExtractionDialog(null)} 
                className="flex-1 rounded-xl border-gray-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => extractionDialog && handleExtraction(extractionDialog)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"
              >
                Confirm Extraction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Code Interpretation Dialog */}
      <Dialog open={colorCodeDialog} onOpenChange={setColorCodeDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600" /> Condition Key
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-3">
            {Object.entries(TOOTH_CONDITIONS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-4 p-2.5 rounded-xl border border-gray-100 bg-gray-50/30">
                <div className={cn("w-8 h-8 rounded-lg shadow-sm border border-black/10 flex-shrink-0", val.color)} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{val.label}</p>
                  <p className="text-xs text-gray-500">{val.tooltip}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
