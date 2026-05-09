'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToothSurfaces, SurfaceKey, SurfaceColor } from "./types";
import { ToothSurfacesSvg, InteractiveSurfacesSvg } from "./svgs";
import { SURFACE_COLORS, SURFACE_LABELS } from "./constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


interface SurfacesPopoverProps {
  tooth: number;
  surfaces: ToothSurfaces;
  onSurfaceChange: (tooth: number, surface: SurfaceKey, color: SurfaceColor) => void;
}

export function SurfacesPopover({ tooth, surfaces, onSurfaceChange }: SurfacesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger render={<button className="group p-1.5 hover:bg-white hover:shadow-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent hover:border-gray-100 flex items-center justify-center bg-gray-50/50" />}>
        <ToothSurfacesSvg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" surfaces={surfaces} />
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0 rounded-3xl shadow-2xl border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden bg-white/95 backdrop-blur-xl">
        <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-900">Surface Mapping</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Tooth #{tooth}</p>
        </div>

        <div className="p-5 space-y-6">
          <div className="relative aspect-square w-36 mx-auto bg-white rounded-3xl p-3 shadow-inner border border-gray-100">
            <InteractiveSurfacesSvg 
              surfaces={surfaces} 
              onClickWedge={(wedge) => {
                // Cycle through colors on click
                const colors: SurfaceColor[] = SURFACE_COLORS.map(c => c.hex as SurfaceColor);
                const currentIndex = colors.indexOf(surfaces[wedge] as SurfaceColor);
                const nextColor = colors[(currentIndex + 1) % colors.length];
                onSurfaceChange(tooth, wedge, nextColor);
              }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-[9px] text-white px-2 py-0.5 rounded-full font-bold shadow-lg">
              Click segments to cycle
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(SURFACE_LABELS).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{label}</span>
                   <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-gray-50 text-gray-500 font-medium">
                     {SURFACE_COLORS.find(c => c.hex === surfaces[key as SurfaceKey])?.label || "Normal"}
                   </Badge>
                </div>
                <div className="flex justify-between items-center bg-gray-50/50 p-1.5 rounded-xl border border-gray-100">
                  {SURFACE_COLORS.map((c, i) => (
                    <button
                      key={i}
                      title={c.label}
                      onClick={() => onSurfaceChange(tooth, key as SurfaceKey, c.hex as SurfaceColor)}
                      className={cn(
                        "w-5 h-5 rounded-lg border transition-all hover:scale-110 active:scale-95",
                        c.tw,
                        surfaces[key as SurfaceKey] === c.hex 
                          ? "ring-2 ring-blue-500 border-white shadow-sm" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-50 flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-[10px] text-gray-400 font-medium italic">
              Mapped surfaces persist automatically to chart
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
