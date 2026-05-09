import React from 'react';
import { cn } from "@/lib/utils";
import { QUADRANTS } from "./constants";
import { Button } from "@/components/ui/button";

interface DentalGridProps {
  renderTooth: (toothId: number, isTop: boolean) => React.ReactNode;
  className?: string;
  showQuadrants?: boolean;
  onQuadrantClick?: (quadrant: keyof typeof QUADRANTS) => void;
}

export function DentalGrid({
  renderTooth,
  className,
  showQuadrants = true,
  onQuadrantClick,
}: DentalGridProps) {
  return (
    <div className={cn("flex flex-col items-center gap-10 w-full max-w-5xl mx-auto bg-gray-50/50 rounded-[2rem] p-6 sm:p-10 border border-gray-100 shadow-inner relative", className)}>
      {/* Quadrant Selectors Overlay */}
      {showQuadrants && onQuadrantClick && (
        <div className="absolute inset-0 pointer-events-none z-10 p-6 sm:p-10">
          {/* Q1 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="pointer-events-auto absolute left-2 top-[20%] h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-dashed border-gray-300 bg-white"
            onClick={() => onQuadrantClick('Q1')}
            title="Select Upper Right Quadrant (Q1)"
          >
            Q1
          </Button>
          {/* Q2 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="pointer-events-auto absolute right-2 top-[20%] h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-dashed border-gray-300 bg-white"
            onClick={() => onQuadrantClick('Q2')}
            title="Select Upper Left Quadrant (Q2)"
          >
            Q2
          </Button>
          {/* Q4 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="pointer-events-auto absolute left-2 bottom-[20%] h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-dashed border-gray-300 bg-white"
            onClick={() => onQuadrantClick('Q4')}
            title="Select Lower Right Quadrant (Q4)"
          >
            Q4
          </Button>
          {/* Q3 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="pointer-events-auto absolute right-2 bottom-[20%] h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-dashed border-gray-300 bg-white"
            onClick={() => onQuadrantClick('Q3')}
            title="Select Lower Left Quadrant (Q3)"
          >
            Q3
          </Button>
        </div>
      )}

      {/* Top Teeth Row */}
      <div className={cn("flex justify-center gap-4 sm:gap-8 w-full relative", showQuadrants && onQuadrantClick && "px-12")}>
        <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
          {QUADRANTS.Q1.map(t => renderTooth(t, true))}
        </div>
        <div className="w-0.5 bg-gray-300 rounded-full shrink-0" />
        <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
          {QUADRANTS.Q2.map(t => renderTooth(t, true))}
        </div>
      </div>
      
      {/* Horizontal Maxillary/Mandibular Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

      {/* Bottom Teeth Row */}
      <div className={cn("flex justify-center gap-4 sm:gap-8 w-full relative", showQuadrants && onQuadrantClick && "px-12")}>
        <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
          {QUADRANTS.Q4.map(t => renderTooth(t, false))}
        </div>
        <div className="w-0.5 bg-gray-300 rounded-full shrink-0" />
        <div className="grid grid-cols-8 gap-1 w-full justify-items-center">
          {QUADRANTS.Q3.map(t => renderTooth(t, false))}
        </div>
      </div>
    </div>
  );
}
