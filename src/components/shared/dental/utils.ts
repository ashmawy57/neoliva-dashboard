import { ToothSurfaces, ToothMeta } from "./types";

export const emptySurfaces = (): ToothSurfaces => ({
  buccal: null, lingual: null, distal: null, mesial: null, occlusal: null,
});

export const defaultMeta = (): ToothMeta => ({
  surfaces: emptySurfaces(),
  toothType: 'permanent',
  findings: [],
});

export function parseToothMeta(notesJson?: string | null): ToothMeta {
  try {
    if (!notesJson) return defaultMeta();
    const parsed = JSON.parse(notesJson);
    if (typeof parsed === 'object' && ('surfaces' in parsed || 'toothType' in parsed || 'findings' in parsed)) {
      return {
        surfaces: { ...emptySurfaces(), ...(parsed.surfaces ?? {}) },
        toothType: parsed.toothType ?? 'permanent',
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      };
    }
    return defaultMeta();
  } catch {
    return defaultMeta();
  }
}

export const isMolar = (tooth: number) => {
  const lastDigit = tooth % 10;
  return lastDigit >= 6 && lastDigit <= 8;
};
