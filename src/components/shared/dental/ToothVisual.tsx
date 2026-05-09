import React from 'react';
import { cn } from "@/lib/utils";
import { MolarSvg, IncisorSvg, PrimaryToothSvg } from "./svgs";
import { isMolar } from "./utils";
import { ToothType } from "./types";

interface ToothVisualProps {
  toothId: number;
  isTop: boolean;
  toothType?: ToothType;
  fill?: string;
  stroke?: string;
  className?: string;
  isExtracted?: boolean;
  isSelected?: boolean;
}

export function ToothVisual({
  toothId,
  isTop,
  toothType = 'permanent',
  fill = '#ffffff',
  stroke = '#94a3b8',
  className,
  isExtracted = false,
  isSelected = false,
}: ToothVisualProps) {
  const SvgComponent = toothType === "primary" ? PrimaryToothSvg : (isMolar(toothId) ? MolarSvg : IncisorSvg);

  return (
    <div className={cn(
      "relative w-8 h-12 flex items-center justify-center transition-all duration-200",
      isSelected ? "scale-110 drop-shadow-md" : "drop-shadow-sm",
      isExtracted ? "opacity-30" : "opacity-100",
      className
    )}>
      <SvgComponent 
        className={cn(
          "w-full h-full transition-colors",
          isTop ? "rotate-180" : ""
        )} 
        fill={fill} 
        stroke={stroke} 
      />
      {isExtracted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-2xl leading-none">×</span>
        </div>
      )}
    </div>
  );
}
