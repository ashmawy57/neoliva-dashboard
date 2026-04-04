"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RefreshCw, Stethoscope, Image as ImageIcon, PenTool } from "lucide-react";

type ToothCondition = "healthy" | "caries" | "filled" | "extracted" | "crown";

const TOOTH_CONDITIONS: Record<ToothCondition, { color: string; label: string; tooltip: string }> = {
  healthy: { color: "bg-white border-gray-300", label: "Healthy", tooltip: "Healthy Tooth" },
  caries: { color: "bg-red-500 border-red-600", label: "Caries", tooltip: "Dental Caries" },
  filled: { color: "bg-blue-400 border-blue-500", label: "Filled", tooltip: "Restoration / Filling" },
  extracted: { color: "bg-gray-800 border-gray-900", label: "Extracted", tooltip: "Missing or Extracted" },
  crown: { color: "bg-amber-400 border-amber-500", label: "Crown", tooltip: "Crown or Veneer" },
};

const topTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const bottomTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Static tiny SVG for the grid
const ToothSurfacesSvg = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} stroke="currentColor" strokeWidth="6" fill="none">
    <circle cx="50" cy="50" r="46" />
    <circle cx="50" cy="50" r="18" />
    <path d="M 18,18 L 37,37 M 82,18 L 63,37 M 18,82 L 37,63 M 82,82 L 63,63" />
  </svg>
);

// Large Interactive SVG for the modal
const InteractiveSurfacesSvg = ({ onClickWedge }: { onClickWedge?: (wedge: string) => void }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm relative z-0">
      <path d="M 50 4 A 46 46 0 0 1 82.5 17.5 L 63 37 A 18 18 0 0 0 50 32 A 18 18 0 0 0 37 37 L 17.5 17.5 A 46 46 0 0 1 50 4 Z" fill="white" stroke="#d1d5db" strokeWidth="2.5" className="hover:fill-blue-50 cursor-pointer transition-colors" onClick={() => onClickWedge && onClickWedge('Buccal/Labial')} />
      <path d="M 50 96 A 46 46 0 0 0 82.5 82.5 L 63 63 A 18 18 0 0 1 50 68 A 18 18 0 0 1 37 63 L 17.5 82.5 A 46 46 0 0 0 50 96 Z" fill="white" stroke="#d1d5db" strokeWidth="2.5" className="hover:fill-blue-50 cursor-pointer transition-colors" onClick={() => onClickWedge && onClickWedge('Lingual/Palatal')} />
      <path d="M 4 50 A 46 46 0 0 1 17.5 17.5 L 37 37 A 18 18 0 0 0 32 50 A 18 18 0 0 0 37 63 L 17.5 82.5 A 46 46 0 0 1 4 50 Z" fill="white" stroke="#d1d5db" strokeWidth="2.5" className="hover:fill-blue-50 cursor-pointer transition-colors" onClick={() => onClickWedge && onClickWedge('Distal')} />
      <path d="M 96 50 A 46 46 0 0 0 82.5 17.5 L 63 37 A 18 18 0 0 1 68 50 A 18 18 0 0 1 63 63 L 82.5 82.5 A 46 46 0 0 0 96 50 Z" fill="white" stroke="#d1d5db" strokeWidth="2.5" className="hover:fill-blue-50 cursor-pointer transition-colors" onClick={() => onClickWedge && onClickWedge('Mesial')} />
      <circle cx="50" cy="50" r="18" fill="white" stroke="#d1d5db" strokeWidth="2.5" className="hover:fill-blue-50 cursor-pointer transition-colors" onClick={() => onClickWedge && onClickWedge('Occlusal')} />

      {/* Triangles/Markers inner UI */}
      <polygon points="50,22 47,26 53,26" fill="#6b7280" className="pointer-events-none" />
      <polygon points="50,78 47,74 53,74" fill="#6b7280" className="pointer-events-none" />
      <polygon points="22,50 26,47 26,53" fill="#6b7280" className="pointer-events-none" />
      <polygon points="78,50 74,47 74,53" fill="#6b7280" className="pointer-events-none" />
      <polygon points="50,47 47,51 53,51" fill="#6b7280" className="pointer-events-none" />
    </svg>
  );
}

// Surfaces Popover Menu component matching Screenshots
const SurfacesPopover = ({ tooth }: { tooth: number }) => {
  const [activeWedge, setActiveWedge] = useState<string | null>(null);

  const colors = [
    { label: "N", tw: "bg-[#e5e5cb] text-gray-700", type: "text", pattern: false },
    { label: "Caries", tw: "bg-[#ef4444]", type: "color", pattern: false },
    { label: "Filling", tw: "bg-[#1d4ed8]", type: "color", pattern: true },
    { label: "Filling", tw: "bg-[#3b82f6]", type: "color", pattern: false },
    { label: "Other", tw: "bg-[#86efac]", type: "color", pattern: false },
    { label: "Other", tw: "bg-[#c026d3]", type: "color", pattern: false },
    { label: "Other", tw: "bg-[#22c55e]", type: "color", pattern: false },
    { label: "Other", tw: "bg-[#ea580c]", type: "color", pattern: false },
    { label: "Other", tw: "bg-[#eab308]", type: "color", pattern: false },
  ];

  return (
    <Popover>
      <PopoverTrigger className="focus:outline-none bg-transparent border-0 p-0.5 m-0 w-full flex justify-center group hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
         <div className="rounded-full flex items-center justify-center p-[2px]">
            <ToothSurfacesSvg className="w-[20px] h-[20px] text-gray-400 group-hover:text-blue-500 transition-colors" />
         </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-4 rounded-3xl shadow-2xl border-gray-100 flex flex-col gap-4 bg-white relative z-[100]">
         <Button className="w-full bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold rounded-2xl shadow-sm border border-[#ffa726] h-11 text-[16px]">
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
             <InteractiveSurfacesSvg onClickWedge={setActiveWedge} />
           </div>

           {/* Color Picker Dropdown that appears on top */}
           {activeWedge && (
             <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] z-[99] transition-all rounded-3xl">
               <div className="bg-white border shadow-2xl rounded-2xl p-2 w-[180px] max-h-full flex flex-col gap-1 overflow-y-auto animate-in fade-in zoom-in-95 relative z-[100]">
                 <button className="absolute top-1 right-2 text-gray-400 hover:text-gray-900 text-lg leading-none p-1" onClick={() => setActiveWedge(null)}>×</button>
                 <p className="text-[11px] text-gray-500 font-bold mb-1.5 pt-1 uppercase text-center border-b pb-1 truncate px-4">{activeWedge}</p>
                 <div className="flex flex-col gap-0.5">
                   {colors.map((c, i) => (
                      <button key={i} className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg w-full text-left transition-colors" onClick={() => setActiveWedge(null)}>
                        {c.type === "text" ? 
                          <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center font-black text-sm border border-gray-300 shadow-sm ${c.tw}`}>{c.label}</div> : 
                          <div className={`w-7 h-7 rounded-[4px] shadow-sm border border-black/10 relative overflow-hidden ${c.tw}`}>
                            {c.pattern && (
                              <div className="absolute inset-0 right-0 left-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.7) 2px, rgba(255,255,255,0.7) 4px)' }} />
                            )}
                          </div>
                        }
                        {c.label !== "Other" && c.label !== "N" && <span className="text-sm font-medium text-gray-700">{c.label}</span>}
                      </button>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>

         <Button className="w-full bg-[#4facfe] hover:bg-[#00f2fe] text-white font-bold rounded-2xl shadow-sm border-0 h-11 text-[15px] flex items-center justify-center gap-2 mt-1">
           <PenTool className="w-4 h-4 text-white" /> Color code interpretation
         </Button>
      </PopoverContent>
    </Popover>
  )
}

export function ToothChart() {
  const [teeth, setTeeth] = useState<Record<number, ToothCondition>>({
    16: "caries",
    24: "filled",
    36: "extracted",
    47: "crown",
  });

  const handleConditionChange = (tooth: number, cond: ToothCondition) => {
    setTeeth((prev) => ({ ...prev, [tooth]: cond }));
  };

  const currentCondition = (tooth: number) => teeth[tooth] || "healthy";

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

  const isMolar = (tooth: number) => {
    const lastDigit = tooth % 10;
    return lastDigit >= 6 && lastDigit <= 8;
  };

  const renderToothColumn = (tooth: number, isTop: boolean) => {
    const cond = currentCondition(tooth);

    // Extract colors for the custom SVGs
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
    const ToothComponent = isMolar(tooth) ? MolarSvg : IncisorSvg;

    return (
      <div key={tooth} className="flex flex-col items-center gap-1.5 w-full">
        {isTop && <span className="text-[11px] font-bold text-gray-700 text-center w-full">{tooth}</span>}
        
        {/* Separate Popover for Surfaces */}
        {!isTop && <SurfacesPopover tooth={tooth} />}
        
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
                 className="h-auto py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-red-600 border-red-100 hover:bg-red-50"
              >
                 <span className="text-red-500 text-lg font-black leading-none mb-0.5">!</span> Extraction
              </Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10">
                <RefreshCw className="w-4 h-4 mr-2.5 text-gray-500" /> Switch primary / permanent
              </Button>
              <Button variant="secondary" className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10">
                <Stethoscope className="w-4 h-4 mr-2.5 text-gray-500" /> Clinical findings & Parameters
              </Button>
              <Button variant="secondary" className="w-full justify-start text-xs rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-700 h-10">
                <ImageIcon className="w-4 h-4 mr-2.5 text-gray-500" /> Photos containing this tooth
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Separate Popover for Surfaces */}
        {isTop && <SurfacesPopover tooth={tooth} />}
        
        {!isTop && <span className="text-[11px] font-bold text-gray-700 text-center w-full">{tooth}</span>}
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
            
            {/* Horizontal Maxillary/Mandibular Spacer (Optional Divider) */}
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
    </div>
  );
}
