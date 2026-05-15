/**
 * ROLE UTILITIES — Standalone, No Circular Dependencies
 *
 * Extracted from rbac.ts to break the circular import between:
 *   rbac.ts → resolve-tenant-context.ts → rbac.ts (normalizeRole)
 *
 * This file has NO imports from other internal modules.
 */

export const VALID_SYSTEM_ROLES = [
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'MANAGER',
  'DOCTOR',
  'ASSISTANT',
  'RECEPTIONIST',
  'ACCOUNTANT',
] as const;

export type SystemRole = (typeof VALID_SYSTEM_ROLES)[number];

/**
 * normalizeRole
 * Maps any incoming role string (case-insensitive, with legacy aliases) to a canonical SystemRole.
 * Returns null if unrecognized — callers MUST treat null as DENIED (fail-closed).
 *
 * Legacy mappings (backward compatibility):
 *   ADMINISTRATOR / CLINIC_ADMIN → ADMIN
 *   SUPER ADMIN → SUPER_ADMIN
 *   DR / DENTIST → DOCTOR
 */
export function normalizeRole(role: string | null | undefined): SystemRole | null {
  if (!role) return null;
  const r = role.toUpperCase().trim();

  // Legacy aliases
  if (r === 'ADMINISTRATOR' || r === 'CLINIC ADMIN' || r === 'CLINIC_ADMIN') return 'ADMIN';
  if (r === 'SUPER ADMIN' || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'OWNER') return 'OWNER';
  if (r === 'DR' || r === 'DENTIST') return 'DOCTOR';

  // Direct match
  const matched = (VALID_SYSTEM_ROLES as readonly string[]).find(vr => vr === r);
  return matched ? (matched as SystemRole) : null;
}
