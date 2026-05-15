/**
 * TENANT CONTEXT — COMPATIBILITY LAYER
 *
 * This file now re-exports from the authoritative module:
 *   src/lib/auth/resolve-tenant-context.ts
 *
 * All internal code should migrate to importing directly from:
 *   @/lib/auth/resolve-tenant-context
 *
 * This module is kept for backward compatibility with existing
 * code that imports from @/lib/tenant-context.
 *
 * Migration status: ACTIVE (do not delete until all imports are updated)
 */

export {
  resolveTenantContext as getTenantContext,
  resolveTenantContextOrRedirect as resolveTenantContext,
  type ResolvedTenantContext,
} from '@/lib/auth/resolve-tenant-context';

export { TenantContextError } from '@/lib/auth/auth-errors';
