/**
 * AUTH ORCHESTRATOR
 *
 * ████████████████████████████████████████████████████████████████
 * ██  SINGLE SOURCE OF TRUTH FOR POST-AUTH ROUTING DECISIONS    ██
 * ████████████████████████████████████████████████████████████████
 *
 * This module is the ONLY place that decides where to redirect a user
 * after authentication. Server Actions authenticate only. They do NOT
 * decide destinations.
 *
 * Architecture Pattern:
 * ─────────────────────────────────────────────────────────────────
 *   staffLogin (Server Action)
 *     → signInWithPassword() only
 *     → return { success: true }
 *
 *   Client Component
 *     → on success, call: getPostLoginDestination()
 *     → redirect to the returned path
 *
 *   auth/callback Route Handler
 *     → call: getPostLoginDestination()
 *     → redirect to the returned path
 *
 * This eliminates split-brain routing and ensures all post-auth
 * logic decisions are in one auditable, testable location.
 */

import type { StaffRole } from '@/generated/client';
import { TenantContextError, AuthRoutingError } from '@/lib/auth/auth-errors';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PostAuthContext {
  tenantStatus: string;
  membershipRole: string;
  defaultPath?: string; // Optional override (e.g., from `next` query param)
}

export interface RoutingDecision {
  destination: string;
  reason: string;
}

// ─── Core — Role-Based Routing Map ───────────────────────────────────────────

const ROLE_DEFAULT_DESTINATIONS: Record<string, string> = {
  OWNER: '/dashboard',
  ADMIN: '/dashboard',
  MANAGER: '/dashboard',
  DOCTOR: '/dashboard/appointments',
  ASSISTANT: '/dashboard/appointments',
  RECEPTIONIST: '/dashboard/appointments',
  ACCOUNTANT: '/dashboard/finance',
};

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * getPostLoginDestination
 *
 * Computes the correct redirect path after a successful Supabase
 * authentication. This function does NOT perform the redirect itself —
 * it returns the destination path.
 *
 * The caller is responsible for executing the actual redirect.
 *
 * @param ctx - Context about the authenticated user's tenant and role
 * @returns A RoutingDecision with the destination path
 * @throws TenantContextError if the tenant state blocks access
 */
export function getPostLoginDestination(ctx: PostAuthContext): RoutingDecision {
  const { tenantStatus, membershipRole, defaultPath } = ctx;

  // ── 1. Tenant Status Gates ────────────────────────────────────────────────
  // These checks MUST come before any role-based routing.

  if (tenantStatus === 'PENDING') {
    return {
      destination: '/pending-approval',
      reason: 'Tenant awaiting admin approval',
    };
  }

  if (tenantStatus === 'REJECTED') {
    return {
      destination: '/auth/error?type=ACCOUNT_REJECTED',
      reason: 'Tenant registration was rejected',
    };
  }

  if (tenantStatus === 'SUSPENDED') {
    return {
      destination: '/auth/error?type=ACCOUNT_SUSPENDED',
      reason: 'Tenant account suspended',
    };
  }

  // Only APPROVED tenants reach this point.
  if (tenantStatus !== 'APPROVED') {
    // Unknown status — FAIL-CLOSED
    return {
      destination: '/auth/error?type=SESSION_EXPIRED',
      reason: `Unknown tenant status: ${tenantStatus}`,
    };
  }

  // ── 2. Role-Based Routing ─────────────────────────────────────────────────
  // If caller provided a specific `next` path (e.g., from login query param),
  // use it only if the tenant is APPROVED. Never redirect to a `next` path
  // for PENDING/REJECTED/SUSPENDED tenants.
  if (defaultPath && isSafePath(defaultPath)) {
    return {
      destination: defaultPath,
      reason: `Custom next path for APPROVED tenant`,
    };
  }

  const roleDestination = ROLE_DEFAULT_DESTINATIONS[membershipRole.toUpperCase()];

  if (roleDestination) {
    return {
      destination: roleDestination,
      reason: `Role-based routing for ${membershipRole}`,
    };
  }

  // Fallback for unrecognized roles (fail-safe to generic dashboard)
  console.warn(`[AuthOrchestrator] Unrecognized role "${membershipRole}" — routing to /dashboard`);
  return {
    destination: '/dashboard',
    reason: `Fallback routing (unrecognized role: ${membershipRole})`,
  };
}

// ─── Super Admin Routing ──────────────────────────────────────────────────────

/**
 * getAdminPostLoginDestination
 *
 * Used exclusively by the Admin Portal login flow.
 * Validates the SUPER_ADMIN dual check and returns the admin destination.
 *
 * Dual validation: JWT metadata role + email allowlist
 */
export function getAdminPostLoginDestination(
  jwtRole: string,
  email: string
): RoutingDecision {
  const isSuperAdminByRole = jwtRole.toUpperCase() === 'SUPER_ADMIN';
  const isSuperAdminByAllowlist = isAdminAllowlisted(email);

  if (!isSuperAdminByRole && !isSuperAdminByAllowlist) {
    throw new AuthRoutingError(
      'UNAUTHORIZED_ROUTE',
      `Admin access denied for ${email} (role: ${jwtRole})`
    );
  }

  // Log defense-in-depth warning if only one check passed
  if (isSuperAdminByRole && !isSuperAdminByAllowlist) {
    console.warn(
      `[AdminOrchestrator] JWT SUPER_ADMIN role accepted but email "${email}" NOT in ALLOWED_SUPER_ADMIN_EMAILS. ` +
      `Consider adding this email to the allowlist for defense-in-depth.`
    );
  }

  if (!isSuperAdminByRole && isSuperAdminByAllowlist) {
    console.warn(
      `[AdminOrchestrator] Email "${email}" is in the admin allowlist but JWT role is "${jwtRole}" (not SUPER_ADMIN). ` +
      `This may indicate a misconfigured Supabase user metadata.`
    );
  }

  return {
    destination: '/admin/clinics',
    reason: `Super Admin authenticated (jwtRole=${jwtRole}, allowlisted=${isSuperAdminByAllowlist})`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * isAdminAllowlisted
 *
 * Reads the comma-separated ALLOWED_SUPER_ADMIN_EMAILS environment variable
 * and checks if the given email is in the list.
 *
 * This is the second factor of defense-in-depth for admin access.
 */
export function isAdminAllowlisted(email: string): boolean {
  const allowlistRaw = process.env.ALLOWED_SUPER_ADMIN_EMAILS ?? '';
  if (!allowlistRaw.trim()) return false;

  const allowlist = allowlistRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.trim().toLowerCase());
}

/**
 * isSafePath
 *
 * Validates that a redirect target path is a relative internal path
 * and not an open redirect vulnerability (e.g., //evil.com or javascript:)
 */
function isSafePath(path: string): boolean {
  if (!path) return false;
  // Must start with / and not be // (protocol-relative)
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  // Disallow javascript: and data: schemes that could be embedded in path
  if (/^(javascript|data|vbscript):/i.test(path)) return false;
  return true;
}
