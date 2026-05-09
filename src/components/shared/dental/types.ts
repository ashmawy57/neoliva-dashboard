export type ToothCondition = "healthy" | "caries" | "filled" | "extracted" | "crown";
export type ToothType = "permanent" | "primary";
export type SurfaceColor = string | null;
export type SurfaceKey = "buccal" | "lingual" | "distal" | "mesial" | "occlusal";

export interface ToothSurfaces {
  buccal: SurfaceColor;
  lingual: SurfaceColor;
  distal: SurfaceColor;
  mesial: SurfaceColor;
  occlusal: SurfaceColor;
}

export interface ClinicalFinding {
  id: string;
  tooth: number;
  date: string;
  note: string;
  type: "finding" | "parameter";
}

export interface ToothPhoto {
  id: string;
  tooth: number;
  name: string;
  date: string;
  size: string;
  url: string;
}

export interface ToothMeta {
  surfaces: ToothSurfaces;
  toothType: ToothType;
  findings: ClinicalFinding[];
}
