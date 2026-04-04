"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, RotateCw, CheckSquare, Square } from "lucide-react";

const topTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const bottomTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const parameters = [
  "Suppuration", "Mobility", "Probing depth",
  "Clinical attach. level", "Gingival margin + probing depth", "Mucogingival junction",
  "Furcation", "Bleeding", "Gingival margin"
];

// Generic date placeholder for mock
const mockDates = ["Mar 03 2025", "Apr 04 2026", "May 05 2027"];

export function Periodontogram() {
  const [activeParam, setActiveParam] = useState("Mucogingival junction");
  const [showLingual, setShowLingual] = useState(true);
  const [showBuccal, setShowBuccal] = useState(true);
  
  // SVGs for teeth
  const MolarSvg = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 32" className={className} fill="white" stroke="black" strokeWidth="1">
      <path d="M 7 2 C 3 2 2 6 3 11 C 4 16 4.5 19 6 28 C 7 32 10 28 11 20 C 12 17 12 17 13 20 C 14 28 17 32 18 28 C 19.5 19 20 16 21 11 C 22 6 21 2 17 2 C 14 2 13 5 12 5 C 11 5 10 2 7 2 Z" />
    </svg>
  );

  const IncisorSvg = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 32" className={className} fill="white" stroke="black" strokeWidth="1">
      <path d="M 7 2 C 3 2 4 8 5 13 C 6 18 9 27 10 30 C 11 32 13 32 14 30 C 15 27 18 18 19 13 C 20 8 21 2 17 2 C 14 2 13 4 12 4 C 11 4 10 2 7 2 Z" />
    </svg>
  );

  const isMolar = (tooth: number) => {
    const lastDigit = tooth % 10;
    return lastDigit >= 6 && lastDigit <= 8;
  };

  const renderValueTable = (tooth: number, param: string) => {
    // 0..13 scrolling list mockup
    const values = param === "Suppuration" || param === "Bleeding" ? [0, 1] : Array.from({length: 14}, (_, i) => i);
    
    return (
      <PopoverContent className="w-[340px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden bg-[#e0e0e0]">
        {/* Header equivalent */}
        <div className="flex justify-between items-center p-2 bg-white">
           <div className="w-10 h-12 bg-blue-500 rounded-xl flex flex-col items-center justify-center text-white font-bold p-1">
              <IncisorSvg className="w-4 h-6 rotate-180" />
              <span className="text-[10px] leading-none mt-1">{tooth - 1}</span>
           </div>
           
           <Button className="bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold rounded-2xl h-10 px-6 shadow-sm">
             Submit and close
           </Button>

           <div className="w-10 h-12 bg-blue-500 rounded-xl flex flex-col items-center justify-center text-white font-bold p-1">
              <span className="text-[10px] leading-none mb-1">{tooth + 1}</span>
              <IncisorSvg className="w-4 h-6" />
           </div>
        </div>

        <div className="text-center py-2">
           <p className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1">
             <IncisorSvg className="w-4 h-6 stroke-gray-500" />
             #{tooth} {param} {param !== "Suppuration" && "(mm)"}
           </p>
        </div>

        <div className="flex w-full px-2 gap-1 pb-2 h-72">
           {/* Buccal/Labial */}
           <div className="flex-1 bg-[#800000] rounded-xl flex flex-col overflow-hidden text-center text-white font-semibold">
              <div className="p-1 pb-0 text-sm">Buccal/Labial</div>
              <div className="flex text-[10px] border-b border-white/20 pb-1">
                <div className="flex-1">Mesial</div>
                <div className="flex-1">Middle</div>
                <div className="flex-1">Distal</div>
              </div>
              <div className="flex-1 flex overflow-y-auto w-full p-1 scrollbar-hide">
                 {[1,2,3].map(col => (
                   <div key={col} className="flex-1 flex flex-col gap-1 px-0.5">
                     {values.map(v => (
                       <div key={v} className="rounded-full border border-white/20 text-xs py-1 hover:bg-white/20 cursor-pointer">
                         {v}
                       </div>
                     ))}
                   </div>
                 ))}
              </div>
           </div>

           {/* Lingual/Palatal */}
           <div className="flex-1 bg-[#0000cd] rounded-xl flex flex-col overflow-hidden text-center text-white font-semibold">
              <div className="p-1 pb-0 text-sm">Lingual/Palatal</div>
              <div className="flex text-[10px] border-b border-white/20 pb-1">
                <div className="flex-1">Mesial</div>
                <div className="flex-1">Middle</div>
                <div className="flex-1">Distal</div>
              </div>
              <div className="flex-1 flex overflow-y-auto w-full p-1 scrollbar-hide">
                 {[1,2,3].map(col => (
                   <div key={col} className="flex-1 flex flex-col gap-1 px-0.5">
                     {values.map(v => (
                       <div key={v} className="rounded-full border border-white/20 text-xs py-1 hover:bg-white/20 cursor-pointer">
                         {v}
                       </div>
                     ))}
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-[#e0e0e0] p-3 text-center border-t border-gray-300 relative">
           <div className="inline-block relative">
              <div className="text-gray-400 text-sm opacity-50 absolute -top-5 left-0 right-0">Mar 03 2025</div>
              <div className="text-gray-700 text-lg font-bold border-y-2 border-[#4facfe] py-0.5 px-4 w-48 mx-auto flex justify-between">
                <span>Apr</span> <span>04</span> <span>2026</span>
              </div>
              <div className="text-gray-400 text-sm opacity-50 absolute -bottom-5 left-0 right-0">May 05 2027</div>
           </div>
        </div>
      </PopoverContent>
    );
  };

  const renderSingleValueDropdown = (tooth: number, param: string) => {
    return (
      <PopoverContent className="w-[280px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden bg-[#e0e0e0]">
        <div className="flex justify-between items-center p-2 bg-white">
           <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold p-1">
              <span className="text-[12px]">{tooth - 1}</span>
           </div>
           <Button className="bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold rounded-2xl h-10 px-6 shadow-sm">
             Submit and close
           </Button>
           <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold p-1">
              <span className="text-[12px]">{tooth + 1}</span>
           </div>
        </div>
        
        <div className="text-center py-4">
           <p className="text-lg font-bold text-gray-800">
             <IncisorSvg className="w-4 h-6 inline mr-1 stroke-gray-500" />
             #{tooth} {param}
           </p>
        </div>

        <div className="flex flex-col items-center gap-2 pb-6 px-4">
           {[0, 1, 2, 3, 4].map(v => (
             <div key={v} className={`w-16 h-8 flex items-center justify-center rounded-full border-2 cursor-pointer font-bold ${v === 0 ? 'bg-blue-500 text-white border-blue-600' : 'bg-transparent border-gray-400 text-gray-600 hover:border-gray-600'}`}>
               {v}
             </div>
           ))}
        </div>

        <div className="bg-[#e0e0e0] p-4 text-center border-t border-gray-300 h-28 relative flex items-center justify-center">
           <div className="text-gray-700 text-lg font-bold border-y-2 border-[#4facfe] py-1 px-4 w-48 flex justify-between absolute">
             <span>Apr</span> <span>04</span> <span>2026</span>
           </div>
        </div>
      </PopoverContent>
    );
  };

  const renderTooth = (tooth: number, isTop: boolean) => {
    const ToothComponent = isMolar(tooth) ? MolarSvg : IncisorSvg;
    
    return (
      <Popover key={tooth}>
        <PopoverTrigger className="flex flex-col items-center cursor-pointer group focus:outline-none w-full border border-transparent hover:bg-white/30 rounded-lg p-0.5 transition-colors">
          {/* Numbers for Top teeth sit above the root */}
          {isTop && <span className="text-[12px] font-bold text-[#8D6E63] w-full text-center pb-1">{tooth}</span>}
          
          <div className="relative w-10 h-[60px] flex items-center justify-center bg-transparent">
             <ToothComponent 
               className={`w-full h-full ${isTop ? "rotate-180" : ""} drop-shadow-sm`} 
             />
             {/* The gumline (blue line) overlay */}
             <div className={`absolute left-0 right-0 h-px bg-[#0000cd] z-10 ${isTop ? "bottom-4" : "top-4"}`} />
             <div className={`absolute left-0 right-0 h-[4px] bg-[#0000cd] rounded-full w-1 mx-auto z-10 ${isTop ? "bottom-[14px]" : "top-[14px]"}`} />
          </div>

          <div className="flex flex-col gap-0.5 items-center justify-center py-2 h-16 text-center w-full">
             <div className="text-[#800000] text-[9px] font-mono leading-tight tracking-tighter">00-00-00</div>
             <div className="text-[#0000cd] text-[9px] font-mono leading-tight tracking-tighter">00-00-00</div>
             <div className="h-4 flex items-center justify-center w-full">
               <div className="w-[80%] h-[2px] border-b-[1.5px] border-dashed border-[#0000cd]" />
             </div>
          </div>

          {/* Numbers for Bottom teeth sit below the root (wait, root is facing down for bottom?) */}
          {/* Top: Root UP, Crown DOWN. Bottom: Crown UP, Root DOWN */}
          {!isTop && <span className="text-[12px] font-bold text-[#8D6E63] w-full text-center pt-1">{tooth}</span>}
        </PopoverTrigger>
        
        {/* Determining which popup to show based on param */}
        {activeParam === "Mobility" ? renderSingleValueDropdown(tooth, activeParam) : renderValueTable(tooth, activeParam)}
      </Popover>
    )
  }

  return (
    <div className="w-full bg-[#f5f5f5] rounded-3xl overflow-hidden border border-gray-200 animate-fade-in-up">
      {/* Top Header */}
      <div className="bg-[#4aa5ff] text-white font-bold text-center py-2 text-lg">
        Periodontics
      </div>

      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">4 April 2026</div>
          <Button className="bg-[#ffb74d] hover:bg-[#ffa726] text-white font-bold rounded-full h-9 px-6 text-sm">
            Load
          </Button>
          <Button className="bg-[#f44336] hover:bg-[#e53935] text-white p-2 rounded-full h-9 w-9">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {parameters.map(p => (
            <Button
              key={p}
              variant="outline"
              onClick={() => setActiveParam(p)}
              className={`rounded-full border-2 text-xs font-semibold h-9 ${p === activeParam ? "bg-[#4aa5ff] text-white border-[#4aa5ff]" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex h-auto w-full">
        {/* Sidebar Tools */}
        <div className="w-20 bg-[#dbe2ea] border-r border-gray-300 flex flex-col items-center gap-6 py-6 shrink-0 z-20">
           <Button className="bg-[#4aa5ff] hover:bg-[#3b82f6] text-white p-2 rounded-2xl h-12 w-12 shadow-sm flex flex-col items-center justify-center">
             <RotateCw className="w-5 h-5 mb-0.5" />
             <span className="text-[9px] font-bold">90°</span>
           </Button>

           <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowLingual(!showLingual)}>
             <div className="w-6 h-6 bg-[#0000cd] rounded-md flex items-center justify-center text-white mb-1 shadow-sm">
               {showLingual ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
             </div>
             <span className="text-[10px] text-[#0000cd] font-bold text-center leading-tight">Lingual/<br/>Palatal</span>
           </div>

           <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowBuccal(!showBuccal)}>
             <div className="w-6 h-6 bg-white border-2 border-[#800000] rounded-md flex items-center justify-center text-[#800000] mb-1 shadow-sm">
               {showBuccal ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
             </div>
             <span className="text-[10px] text-[#800000] font-bold text-center leading-tight">Buccal/<br/>Labial</span>
           </div>
        </div>

        {/* Scrollable grid area */}
        <div className="flex-1 overflow-x-auto bg-[#ffab40]/90">
           <div className="min-w-[800px] p-6 pt-8 pb-10 flex flex-col items-center justify-center gap-6 relative">
              {/* Top View */}
              <div className="flex w-full justify-center relative">
                 <div className="w-full absolute top-[62px] border-t-[1.5px] border-[#0000cd] z-0" /> {/* main line */}
                 <div className="grid grid-cols-8 gap-1.5 w-full justify-items-center">
                    {topTeeth.slice(0, 8).map(t => renderTooth(t, true))}
                 </div>
                 <div className="w-px bg-black opacity-30 mx-2 shrink-0 z-10" />
                 <div className="grid grid-cols-8 gap-1.5 w-full justify-items-center">
                    {topTeeth.slice(8, 16).map(t => renderTooth(t, true))}
                 </div>
              </div>

              {/* Middle horizontal spacing divider */}
              <div className="w-full h-8" />

              {/* Bottom View */}
              <div className="flex w-full justify-center relative">
                 <div className="grid grid-cols-8 gap-1.5 w-full justify-items-center">
                    {bottomTeeth.slice(0, 8).map(t => renderTooth(t, false))}
                 </div>
                 <div className="w-px bg-black opacity-30 mx-2 shrink-0 z-10" />
                 <div className="grid grid-cols-8 gap-1.5 w-full justify-items-center">
                    {bottomTeeth.slice(8, 16).map(t => renderTooth(t, false))}
                 </div>
                 <div className="w-full absolute top-[62px] border-t-[1.5px] border-[#0000cd] z-0" /> {/* main line */}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
