import { ToothCondition, SurfaceKey, SurfaceColor } from "./types";

export const TOOTH_CONDITIONS: Record<ToothCondition, { color: string; label: string; tooltip: string }> = {
  healthy: { color: "bg-white border-gray-300", label: "Healthy", tooltip: "Healthy Tooth" },
  caries: { color: "bg-red-500 border-red-600", label: "Caries", tooltip: "Dental Caries" },
  filled: { color: "bg-blue-400 border-blue-500", label: "Filled", tooltip: "Restoration / Filling" },
  extracted: { color: "bg-gray-800 border-gray-900", label: "Extracted", tooltip: "Missing or Extracted" },
  crown: { color: "bg-amber-400 border-amber-500", label: "Crown", tooltip: "Crown or Veneer" },
};

export const SURFACE_COLORS = [
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

export const SURFACE_LABELS: Record<SurfaceKey, string> = {
  buccal: "Buccal/Labial",
  lingual: "Lingual/Palatal",
  distal: "Distal",
  mesial: "Mesial",
  occlusal: "Occlusal/Incisal",
};

export const topTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const bottomTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export const QUADRANTS = {
  Q1: [18, 17, 16, 15, 14, 13, 12, 11],
  Q2: [21, 22, 23, 24, 25, 26, 27, 28],
  Q3: [31, 32, 33, 34, 35, 36, 37, 38],
  Q4: [48, 47, 46, 45, 44, 43, 42, 41],
};
