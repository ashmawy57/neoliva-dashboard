"use client";

import { useState, useTransition, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw, Stethoscope, Image as ImageIcon, PenTool, X, Info, Save, Trash2, FileText, Camera, AlertTriangle } from "lucide-react";
import { updateToothCondition } from "@/app/actions/patients";

type ToothCondition = "healthy" | "caries" | "filled" | "extracted" | "crown";
type ToothType = "permanent" | "primary";
type SurfaceColor = string | null;
type SurfaceKey = "buccal" | "lingual" | "distal" | "mesial" | "occlusal";

interface ToothSurfaces {
  buccal: SurfaceColor;
  lingual: SurfaceColor;
  distal: SurfaceColor;
  mesial: SurfaceColor;
  occlusal: SurfaceColor;
}

interface ClinicalFinding {
  id: string;
  tooth: number;
  date: string;
  note: string;
  type: "finding" | "parameter";
}

interface ToothPhoto {
  id: string;
  tooth: number;
  name: string;
  date: string;
  size: string;
}

const TOOTH_CONDITIONS: Record<ToothCondition, { color: string; label: string; tooltip: string }> = {
  healthy: { color: "bg-white border-gray-300", label: "Healthy", tooltip: "Healthy Tooth" },
  caries: { color: "bg-red-500 border-red-600", label: "Caries", tooltip: "Dental Caries" },
  filled: { color: "bg-blue-400 border-blue-500", label: "Filled", tooltip: "Restoration / Filling" },
  extracted: { color: "bg-gray-800 border-gray-900", label: "Extracted", tooltip: "Missing or Extracted" },
  crown: { color: "bg-amber-400 border-amber-500", label: "Crown", tooltip: "Crown or Veneer" },
};

const SURFACE_COLORS = [
  { label: "N", tw: "bg-[#e5e5cb]", hex: null, description: "Normal / Clear" },
  { label: "Caries", tw: "bg-[#ef4444]", hex: "#ef4444", description: "Dental Caries" },
  { label: "Filling (Amalgam)", tw: "bg-[#1d4ed8]", hex: "#1d4ed8", description: "Amalgam Filling", pattern: true },
  { label: "Filling (Composite)", tw: "bg-[#3b82f6]", hex: "#3b82f6", description: "Composite Filling" },
  { label: "Fracture", tw: "bg-[#86efac]", hex: "#86efac", description: "Tooth Fracture" },
  { label: "Sealant", tw: "bg-[#c026d3]", hex: "#c026d3", description: "Pit & Fissure Sealant" },
  { label: "Abrasion", tw: "bg-[#22c55e]", hex: "#22c55e", description: "Abrasion" },
  { label: "Erosion", tw: "bg-[#ea580c]", hex: "#ea580c", description: "Erosion" },
  { label: "Attrition", tw: "bg-[#eab308]", hex: "#eab308", description: "Attrition" },
];

const topTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const bottomTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  buccal: "Buccal/Labial",
  lingual: "Lingual/Palatal",
  distal: "Distal",
  mesial: "Mesial",
  occlusal: "Occlusal/Incisal",
};

// Static tiny SVG for the grid
const ToothSurfacesSvg = ({ className, surfaces }: { className?: string; surfaces?: ToothSurfaces }) => (
  <svg viewBox="0 0 100 100" className={className} stroke="currentColor" strokeWidth="6" fill="none">
    <circle cx="50" cy="50" r="46" fill={surfaces?.buccal || "none"} />
    <circle cx="50" cy="50" r="18" fill={surfaces?.occlusal || "none"} />
    <path d="M 18,18 L 37,37 M 82,18 L 63,37 M 18,82 L 37,63 M 82,82 L 63,63" />
  </svg>
);

// Large Interactive SVG for the modal
const InteractiveSurfacesSvg = ({ onClickWedge, surfaces }: { onClickWedge?: (wedge: SurfaceKey) => void; surfaces: ToothSurfaces }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm relative z-0">
      <path d="M 50 4 A 46 46 0 0 1 82.5 17.5 L 63 37 A 18 18 0 0 0 50 32 A 18 18 0 0 0 37 37 L 17.5 17.5 A 46 46 0 0 1 50 4 Z" fill={surfaces.buccal || "white"} stroke="#d1d5db" strokeWidth="2.5" className="hover:opacity-80 cursor-pointer transition-all" onClick={() => onClickWedge && onClickWedge('buccal')} />
      <path d="M 50 96 A 46 46 0 0 0 82.5 82.5 L 63 63 A 18 18 0 0 1 50 68 A 18 18 0 0 1 37 63 L 17.5 82.5 A 46 46 0 0 0 50 96 Z" fill={surfaces.lingual || "white"} stroke="#d1d5db" strokeWidth="2.5" className="hover:opacity-80 cursor-pointer transition-all" onClick={() => onClickWedge && onClickWedge('lingual')} />
      <path d="M 4 50 A 46 46 0 0 1 17.5 17.5 L 37 37 A 18 18 0 0 0 32 50 A 18 18 0 0 0 37 63 L 17.5 82.5 A 46 46 0 0 1 4 50 Z" fill={surfaces.distal || "white"} stroke="#d1d5db" strokeWidth="2.5" className="hover:opacity-80 cursor-pointer transition-all" onClick={() => onClickWedge && onClickWedge('distal')} />
      <path d="M 96 50 A 46 46 0 0 0 82.5 17.5 L 63 37 A 18 18 0 0 1 68 50 A 18 18 0 0 1 63 63 L 82.5 82.5 A 46 46 0 0 0 96 50 Z" fill={surfaces.mesial || "white"} stroke="#d1d5db" strokeWidth="2.5" className="hover:opacity-80 cursor-pointer transition-all" onClick={() => onClickWedge && onClickWedge('mesial')} />
      <circle cx="50" cy="50" r="18" fill={surfaces.occlusal || "white"} stroke="#d1d5db" strokeWidth="2.5" className="hover:opacity-80 cursor-pointer transition-all" onClick={() => onClickWedge && onClickWedge('occlusal')} />

      {/* Triangles/Markers inner UI */}
      <polygon points="50,22 47,26 53,26" fill="#6b7280" className="pointer-events-none" />
      <polygon points="50,78 47,74 53,74" fill="#6b7280" className="pointer-events-none" />
      <polygon points="22,50 26,47 26,53" fill="#6b7280" className="pointer-events-none" />
      <polygon points="78,50 74,47 74,53" fill="#6b7280" className="pointer-events-none" />
      <polygon points="50,47 47,51 53,51" fill="#6b7280" className="pointer-events-none" />
    </svg>
  );
}

// Surfaces Popover Menu component
const SurfacesPopover = ({ tooth, surfaces, onSurfaceChange }: { tooth: number; surfaces: ToothSurfaces; onSurfaceChange: (tooth: number, surface: SurfaceKey, color: SurfaceColor) => void }) => {
  const [activeWedge, setActiveWedge] = useState<SurfaceKey | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorPick = (surface: SurfaceKey, hex: SurfaceColor) => {
    onSurfaceChange(tooth, surface, hex);
    setActiveWedge(null);
  };

  const hasAnySurface = Object.values(surfaces).some(s => s !== null);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="focus:outline-none bg-transparent border-0 p-0.5 m-0 w-full flex justify-center group hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
         <div className="rounded-full flex items-center justify-center p-[2px]">
            <ToothSurfacesSvg className={`w-[20px] h-[20px] transition-colors ${hasAnySurface ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`} surfaces={surfaces} />
         </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-4 rounded-3xl shadow-2xl border-gray-100 flex flex-col gap-4 bg-white relative z-[100]">
         <Button 
           className="w-full bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold rounded-2xl shadow-sm border border-[#ffa726] h-11 text-[16px]"
           onClick={() => setIsOpen(false)}
         >
           Submit and close
         </Button>

         <div className="text-center py-1">
           <p className="text-[28px] leading-tight font-bold text-gray-800">{tooth}</p>
           <p className="text-[17px] text-gray-600">Tooth surfaces</p>
         </div>

         <div className="relative w-full aspect-square flex items-center justify-center p-3 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
           {/* Section Labels */}
           <span className="absolute top-4 text-sm font-semibold text-gray-600 z-0">Buccal/Labial</span>
           <span className="absolute bottom-4 text-sm text-center font-semibold text-gray-600 z-0 flex flex-col items-center">
             Lingual/Palatal
             <span className="text-[12px] text-gray-500 font-medium mt-0.5 whitespace-nowrap">© Occlusal/Incisal</span>
           </span>
           <span className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-600 z-0">Distal</span>
           <span className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-sm font-semibold text-gray-600 z-0">Mesial</span>

           {/* Interactive SVG */}
           <div className="w-[68%] h-[68%] relative z-10 hover:opacity-90">
             <InteractiveSurfacesSvg onClickWedge={setActiveWedge} surfaces={surfaces} />
           </div>

           {/* Color Picker Dropdown that appears on top */}
           {activeWedge && (
             <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] z-[99] transition-all rounded-3xl">
               <div className="bg-white border shadow-2xl rounded-2xl p-2 w-[200px] max-h-full flex flex-col gap-1 overflow-y-auto animate-in fade-in zoom-in-95 relative z-[100]">
                 <button className="absolute top-1 right-2 text-gray-400 hover:text-gray-900 text-lg leading-none p-1" onClick={() => setActiveWedge(null)}>×</button>
                 <p className="text-[11px] text-gray-500 font-bold mb-1.5 pt-1 uppercase text-center border-b pb-1 truncate px-4">{SURFACE_LABELS[activeWedge]}</p>
                 <div className="flex flex-col gap-0.5">
                   {SURFACE_COLORS.map((c, i) => (
                      <button 
                        key={i} 
                        className={`flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg w-full text-left transition-colors ${surfaces[activeWedge] === c.hex ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
                        onClick={() => handleColorPick(activeWedge, c.hex)}
                      >
                        {c.hex === null ? 
                          <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center font-black text-sm border border-gray-300 shadow-sm ${c.tw}`}>N</div> : 
                          <div className={`w-7 h-7 rounded-[4px] shadow-sm border border-black/10 relative overflow-hidden ${c.tw}`}>
                            {c.pattern && (
                              <div className="absolute inset-0 right-0 left-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.7) 2px, rgba(255,255,255,0.7) 4px)' }} />
                            )}
                          </div>
                        }
                        <span className="text-xs font-medium text-gray-700">{c.label}</span>
                      </button>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* Active surface indicators */}
         {hasAnySurface && (
           <div className="flex flex-wrap gap-1.5 px-1">
             {(Object.entries(surfaces) as [SurfaceKey, SurfaceColor][]).filter(([, v]) => v).map(([k, v]) => (
               <div key={k} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1 border border-gray-200">
                 <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: v || undefined }} />
                 <span className="text-[10px] font-semibold text-gray-600 uppercase">{k}</span>
                 <button className="text-gray-400 hover:text-red-500 ml-0.5" onClick={() => onSurfaceChange(tooth, k, null)}>
                   <X className="w-2.5 h-2.5" />
                 </button>
               </div>
             ))}
           </div>
         )}

         <Button 
           className="w-full bg-[#4facfe] hover:bg-[#00f2fe] text-white font-bold rounded-2xl shadow-sm border-0 h-11 text-[15px] flex items-center justify-center gap-2 mt-1"
           onClick={() => {
             setIsOpen(false);
           }}
         >
           <PenTool className="w-4 h-4 text-white" /> Color code interpretation
         </Button>
      </PopoverContent>
    </Popover>
  )
}

export function ToothChart({ patient, onRefresh }: { patient: any; onRefresh?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [teeth, setTeeth] = useState<Record<number, ToothCondition>>(() => {
    const conditions = patient?.toothConditions ?? [];
    const mapping: Record<number, ToothCondition> = {};
    conditions.forEach((c: any) => {
      mapping[c.tooth_number] = c.condition as ToothCondition;
    });
    return mapping;
  });

  const [toothTypes, setToothTypes] = useState<Record<number, ToothType>>({});
  const [toothSurfaces, setToothSurfaces] = useState<Record<number, ToothSurfaces>>({});
  const [findings, setFindings] = useState<ClinicalFinding[]>([]);
  const [photos, setPhotos] = useState<ToothPhoto[]>([]);

  // Dialogs state
  const [findingsDialog, setFindingsDialog] = useState<number | null>(null);
  const [photosDialog, setPhotosDialog] = useState<number | null>(null);
  const [extractionDialog, setExtractionDialog] = useState<number | null>(null);
  const [colorCodeDialog, setColorCodeDialog] = useState(false);
  const [newFinding, setNewFinding] = useState("");
  const [findingType, setFindingType] = useState<"finding" | "parameter">("finding");

  // Sync state when patient prop changes
  useEffect(() => {
    if (!patient) return;
    const conditions = patient.toothConditions ?? [];
    const mapping: Record<number, ToothCondition> = {};
    conditions.forEach((c: any) => {
      mapping[c.tooth_number] = c.condition as ToothCondition;
    });
    setTeeth(mapping);
  }, [patient]);

  const handleConditionChange = (tooth: number, cond: ToothCondition) => {
    setTeeth((prev) => ({ ...prev, [tooth]: cond }));
    startTransition(async () => {
      await updateToothCondition(patient.id, tooth, cond, "");
      onRefresh?.();
    });
  };

  const handleSurfaceChange = (tooth: number, surface: SurfaceKey, color: SurfaceColor) => {
    setToothSurfaces(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || { buccal: null, lingual: null, distal: null, mesial: null, occlusal: null }),
        [surface]: color,
      }
    }));
  };

  const handleToggleToothType = (tooth: number) => {
    setToothTypes(prev => ({
      ...prev,
      [tooth]: prev[tooth] === "primary" ? "permanent" : "primary",
    }));
  };

  const handleAddFinding = (tooth: number) => {
    if (!newFinding.trim()) return;
    const f: ClinicalFinding = {
      id: `f-${Date.now()}`,
      tooth,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      note: newFinding.trim(),
      type: findingType,
    };
    setFindings(prev => [f, ...prev]);
    setNewFinding("");
  };

  const handleDeleteFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const handleAddPhoto = (tooth: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const p: ToothPhoto = {
          id: `p-${Date.now()}`,
          tooth,
          name: file.name,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        };
        setPhotos(prev => [p, ...prev]);
      }
    };
    input.click();
  };

  const handleExtraction = (tooth: number) => {
    handleConditionChange(tooth, "extracted");
    setExtractionDialog(null);
  };

  const currentCondition = (tooth: number) => teeth[tooth] || "healthy";
  const getToothType = (tooth: number) => toothTypes[tooth] || "permanent";
  const getToothSurfaces = (tooth: number): ToothSurfaces => toothSurfaces[tooth] || { buccal: null, lingual: null, distal: null, mesial: null, occlusal: null };

  // SVG for teeth with double roots (Molars)
  const MolarSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
    <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M 7 2 C 3 2 2 6 3 11 C 4 16 4.5 19 6 28 C 7 32 10 28 11 20 C 12 17 12 17 13 20 C 14 28 17 32 18 28 C 19.5 19 20 16 21 11 C 22 6 21 2 17 2 C 14 2 13 5 12 5 C 11 5 10 2 7 2 Z" />
    </svg>
  );

  // SVG for teeth with single root (Incisors, Canines, Premolars)
  const IncisorSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
    <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M 7 2 C 3 2 4 8 5 13 C 6 18 9 27 10 30 C 11 32 13 32 14 30 C 15 27 18 18 19 13 C 20 8 21 2 17 2 C 14 2 13 4 12 4 C 11 4 10 2 7 2 Z" />
    </svg>
  );

  // Primary (baby) tooth SVG — smaller, rounder
  const PrimaryToothSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
    <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M 8 4 C 4 4 4 9 5 14 C 6 19 9 25 11 28 C 11.5 29 12.5 29 13 28 C 15 25 18 19 19 14 C 20 9 20 4 16 4 C 14 4 13 6 12 6 C 11 6 10 4 8 4 Z" />
    </svg>
  );

  const isMolar = (tooth: number) => {
    const lastDigit = tooth % 10;
    return lastDigit >= 6 && lastDigit <= 8;
  };

  const renderToothColumn = (tooth: number, isTop: boolean) => {
    const cond = currentCondition(tooth);
    const type = getToothType(tooth);
    const surfaces = getToothSurfaces(tooth);

    const getFillAndStroke = (c: ToothCondition) => {
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
    const ToothComponent = type === "primary" ? PrimaryToothSvg : (isMolar(tooth) ? MolarSvg : IncisorSvg);

    return (
      <div key={tooth} className="flex flex-col items-center gap-1.5 w-full">
        {isTop && (
          <span className={`text-[11px] font-bold text-center w-full ${type === "primary" ? "text-purple-600" : "text-gray-700"}`}>
            {tooth}
            {type === "primary" && <span className="text-[8px] block text-purple-400">1°</span>}
          </span>
        )}
        
        {/* Separate Popover for Surfaces */}
        {!isTop && <SurfacesPopover tooth={tooth} surfaces={surfaces} onSurfaceChange={handleSurfaceChange} />}
        
        {/* Main Tooth status Popover */}
        <Popover>
          <PopoverTrigger className="cursor-pointer group flex items-center justify-center focus:outline-none bg-transparent border-0 p-1 w-full hover:bg-gray-100 rounded-xl transition-colors">
            <div className="relative w-8 h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-md mx-auto">
              <ToothComponent 
                className={`w-full h-full ${isTop ? "rotate-180" : ""} ${cond === "extracted" ? "opacity-30" : ""}`} 
                fill={fill} 
                stroke={stroke} 
              />
              {cond === "extracted" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-2xl leading-none">×</span>
                </div>
              )}
            </div>
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
                  onClick={() => handleConditionChange(tooth, key as ToothCondition)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    key === cond ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border ${val.color}`} />
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
                {findings.filter(f => f.tooth === tooth).length > 0 && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 text-[10px] px-1.5">{findings.filter(f => f.tooth === tooth).length}</Badge>
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

        {/* Separate Popover for Surfaces */}
        {isTop && <SurfacesPopover tooth={tooth} surfaces={surfaces} onSurfaceChange={handleSurfaceChange} />}
        
        {!isTop && (
          <span className={`text-[11px] font-bold text-center w-full ${type === "primary" ? "text-purple-600" : "text-gray-700"}`}>
            {tooth}
            {type === "primary" && <span className="text-[8px] block text-purple-400">1°</span>}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Adult Odontogram (FDI)</h3>
          <p className="text-sm text-gray-500">Interactive 32-tooth chart for mapping conditions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
          {Object.entries(TOOTH_CONDITIONS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full border ${val.color}`} />
              <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                {val.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-10 w-full max-w-5xl mx-auto bg-gray-50/50 rounded-[2rem] p-6 sm:p-10 border border-gray-100 shadow-inner">
            {/* Top Teeth Row */}
            <div className="flex justify-center gap-4 sm:gap-8 w-full relative">
              <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
                {topTeeth.slice(0, 8).map(t => renderToothColumn(t, true))}
              </div>
              <div className="w-0.5 bg-gray-300 rounded-full shrink-0" />
              <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
                {topTeeth.slice(8, 16).map(t => renderToothColumn(t, true))}
              </div>
            </div>
            
            {/* Horizontal Maxillary/Mandibular Spacer */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

            {/* Bottom Teeth Row */}
            <div className="flex justify-center gap-4 sm:gap-8 w-full relative">
              <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
                {bottomTeeth.slice(0, 8).map(t => renderToothColumn(t, false))}
              </div>
              <div className="w-0.5 bg-gray-300 rounded-full shrink-0" />
              <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
                {bottomTeeth.slice(8, 16).map(t => renderToothColumn(t, false))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Notes or History */}
      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex gap-4">
        <div className="w-1.5 h-auto bg-blue-500 rounded-full" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1.5">Doctor's Note</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Patient reported sensitivity in tooth #16. Cavity confirmed via X-Ray. Scheduled for filling next visit. Tooth #47 crown is intact and stable.
          </p>
        </div>
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
            {/* Add new finding */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFindingType("finding")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${findingType === "finding" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Finding
                </button>
                <button
                  onClick={() => setFindingType("parameter")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${findingType === "parameter" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
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
                disabled={!newFinding.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-semibold w-full shadow-md shadow-blue-500/20"
              >
                <Save className="w-4 h-4 mr-2" /> Save Finding
              </Button>
            </div>

            {/* Existing findings */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Findings</p>
              {findings.filter(f => f.tooth === findingsDialog).length > 0 ? (
                findings.filter(f => f.tooth === findingsDialog).map(f => (
                  <div key={f.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex gap-3 group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${f.type === "finding" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                      {f.type === "finding" ? <FileText className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{f.note}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{f.date} · {f.type === "finding" ? "Clinical Finding" : "Parameter"}</p>
                    </div>
                    <button onClick={() => handleDeleteFinding(f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500">
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
              onClick={() => photosDialog && handleAddPhoto(photosDialog)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-sm font-semibold w-full shadow-md shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4 mr-2" /> Upload Photo
            </Button>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attached Photos</p>
              {photos.filter(p => p.tooth === photosDialog).length > 0 ? (
                photos.filter(p => p.tooth === photosDialog).map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.date} · {p.size}</p>
                    </div>
                    <button onClick={() => setPhotos(prev => prev.filter(x => x.id !== p.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500">
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
              <PenTool className="w-5 h-5 text-blue-600" /> Color Code Interpretation
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-3">
            {SURFACE_COLORS.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-2.5 rounded-xl border border-gray-100 bg-gray-50/30">
                <div className={`w-8 h-8 rounded-lg shadow-sm border border-black/10 flex-shrink-0 relative overflow-hidden ${c.tw}`}>
                  {c.pattern && (
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.7) 2px, rgba(255,255,255,0.7) 4px)' }} />
                  )}
                  {c.hex === null && <span className="flex items-center justify-center w-full h-full text-xs font-black text-gray-600">N</span>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
