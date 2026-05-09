import React from "react";
import { ToothSurfaces, SurfaceKey } from "./types";

// SVG for teeth with double roots (Molars)
export const MolarSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
  <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
    <path d="M 7 2 C 3 2 2 6 3 11 C 4 16 4.5 19 6 28 C 7 32 10 28 11 20 C 12 17 12 17 13 20 C 14 28 17 32 18 28 C 19.5 19 20 16 21 11 C 22 6 21 2 17 2 C 14 2 13 5 12 5 C 11 5 10 2 7 2 Z" />
  </svg>
);

// SVG for teeth with single root (Incisors, Canines, Premolars)
export const IncisorSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
  <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
    <path d="M 7 2 C 3 2 4 8 5 13 C 6 18 9 27 10 30 C 11 32 13 32 14 30 C 15 27 18 18 19 13 C 20 8 21 2 17 2 C 14 2 13 4 12 4 C 11 4 10 2 7 2 Z" />
  </svg>
);

// Primary (baby) tooth SVG — smaller, rounder
export const PrimaryToothSvg = ({ className, fill, stroke }: { className?: string, fill: string, stroke: string }) => (
  <svg viewBox="0 0 24 32" className={className} fill={fill} stroke={stroke} strokeWidth="1.5">
    <path d="M 8 4 C 4 4 4 9 5 14 C 6 19 9 25 11 28 C 11.5 29 12.5 29 13 28 C 15 25 18 19 19 14 C 20 9 20 4 16 4 C 14 4 13 6 12 6 C 11 6 10 4 8 4 Z" />
  </svg>
);

// Static tiny SVG for the grid
export const ToothSurfacesSvg = ({ className, surfaces }: { className?: string; surfaces?: ToothSurfaces }) => (
  <svg viewBox="0 0 100 100" className={className} stroke="currentColor" strokeWidth="6" fill="none">
    <circle cx="50" cy="50" r="46" fill={surfaces?.buccal || "none"} />
    <circle cx="50" cy="50" r="18" fill={surfaces?.occlusal || "none"} />
    <path d="M 18,18 L 37,37 M 82,18 L 63,37 M 18,82 L 37,63 M 82,82 L 63,63" />
  </svg>
);

// Large Interactive SVG for the modal
export const InteractiveSurfacesSvg = ({ onClickWedge, surfaces }: { onClickWedge?: (wedge: SurfaceKey) => void; surfaces: ToothSurfaces }) => {
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
