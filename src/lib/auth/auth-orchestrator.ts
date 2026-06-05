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
 *     → call: resolvePostAuthRedirect()
 *     → redirect to the returned path
 *
 * This eliminates split-brain routing and ensures all post-auth
 * logic decisions are in one auditable, testable location.
 */

import { rawPrisma } from '@/lib/prisma';
import { TenantContextError, AuthRoutingError } from '@/lib/auth/auth-errors';
import { normalizeRole } from '@/lib/auth/roles';
import { validateMembership } from '@/lib/auth/resolve-tenant-context';

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

// ─── Post-Auth Callback Resolution ──────────────────────────────────────────

/**
 * MEMBERSHIP_INCLUDE_CALLBACK
 *
 * The canonical Prisma include shape for auth callback membership queries.
 * This MUST match the shape used by validateMembership() in resolve-tenant-context.ts
 * so that the same validation logic can be applied without modification.
 */
const MEMBERSHIP_INCLUDE_CALLBACK = {
  tenant: { select: { status: true } },
  user: true,
  staffProfile: { select: { id: true } },
} as const;

/**
 * TenantContextErrorCode → Redirect URL mapping for the callback route.
 *
 * This is the authoritative error-to-redirect table for POST-AUTH failures.
 * The dashboard layout has its own equivalent for MID-SESSION failures.
 */
function tenantContextErrorToRedirectPath(code: TenantContextError['code']): string {
  switch (code) {
    case 'TENANT_PENDING':
      return '/pending-approval';
    case 'ACCOUNT_REJECTED':
      return '/auth/error?type=ACCOUNT_REJECTED';
    case 'ACCOUNT_SUSPENDED':
      return '/auth/error?type=ACCOUNT_SUSPENDED';
    case 'ACCOUNT_DISABLED':
      return '/auth/error?type=ACCOUNT_DISABLED';
    case 'INVALID_ROLE':
      return '/auth/error?type=INVALID_ACCOUNT';
    case 'MEMBERSHIP_INACTIVE':
      return '/auth/error?type=SESSION_EXPIRED';
    case 'NO_USER_RECORD':
    case 'NO_MEMBERSHIP':
      return '/auth/error?type=UNAUTHORIZED';
    case 'UNAUTHORIZED':
    case 'SESSION_EXPIRED':
    default:
      return '/auth/error?type=SESSION_EXPIRED';
  }
}

export interface PostAuthRedirectResult {
  /** Absolute path the caller should redirect to. */
  destination: string;
  /** Human-readable reason for logging. */
  reason: string;
}

/**
 * resolvePostAuthRedirect
 *
 * The ONLY function the `auth/callback` route handler should call
 * after a successful Supabase code exchange.
 *
 * What it does:
 * 1. Looks up the user's primary TenantMembership using the authoritative
 *    Prisma include shape (identical to resolve-tenant-context.ts).
 * 2. Runs the membership through `validateCallbackMembership()` — the same
 *    FAIL-CLOSED rules as the in-request resolver — so SUSPENDED/DISABLED/
 *    INVALID_ROLE users are blocked at login, not just at the layout level.
 * 3. Maps any TenantContextError to the correct error redirect URL.
 * 4. On success, delegates destination routing to `getPostLoginDestination()`
 *    (role-based routing, safe `next` path handling).
 *
 * @param supabaseUserId - The `user.id` from `supabase.auth.getUser()` (JWT-verified)
 * @param requestedNext  - Optional `next` query param from the login URL
 * @returns A PostAuthRedirectResult with the destination the caller must redirect to
 */
export async function resolvePostAuthRedirect(
  supabaseUserId: string,
  requestedNext?: string
): Promise<PostAuthRedirectResult> {
  // ── Step 1: Resolve internal DB user from Supabase UID ───────────────────
  const dbUser = await rawPrisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: { id: true },
  });

  if (!dbUser) {
    console.error(
      `[AuthOrchestrator][resolvePostAuthRedirect] No DB User record for Supabase UID: ${supabaseUserId}`
    );
    return {
      destination: '/auth/error?type=UNAUTHORIZED',
      reason: 'NO_USER_RECORD: Supabase user has no matching DB User',
    };
  }

  // ── Step 2: Load the primary active membership ─────────────────────────
  //
  // We intentionally use rawPrisma here (same as resolve-tenant-context.ts)
  // because RLS is not yet established at callback time — there is no
  // HTTP request context from which to derive a tenant. The membership
  // lookup itself is the bootstrap that establishes tenancy.
  const membership = await rawPrisma.tenantMembership.findFirst({
    where: {
      userId: dbUser.id,
      status: 'ACTIVE',
    },
    include: MEMBERSHIP_INCLUDE_CALLBACK,
    orderBy: { joinedAt: 'desc' },
  });

  if (!membership) {
    console.warn(
      `[AuthOrchestrator][resolvePostAuthRedirect] No ACTIVE TenantMembership for DB user: ${dbUser.id}`
    );
    return {
      destination: '/auth/error?type=UNAUTHORIZED',
      reason: 'NO_MEMBERSHIP: No active TenantMembership found',
    };
  }

  // ── Step 3: Run through the UNIFIED validation pipeline ──────────────────
  //
  // This uses the shared validateMembership() function from resolve-tenant-context.ts
  // ensuring zero divergence in authentication gating checks.
  try {
    validateMembership(membership);
  } catch (error) {
    if (error instanceof TenantContextError) {
      const destination = tenantContextErrorToRedirectPath(error.code);
      console.warn(
        `[AuthOrchestrator][resolvePostAuthRedirect] Access blocked: code=${error.code}, ` +
          `user=${membership.user.email}, destination=${destination}`
      );
      return { destination, reason: error.internalReason };
    }
    // Unexpected error — fail closed
    console.error(
      `[AuthOrchestrator][resolvePostAuthRedirect] Unexpected validation error:`,
      error
    );
    return {
      destination: '/auth/error?type=SESSION_EXPIRED',
      reason: 'Unexpected error during membership validation',
    };
  }

  // ── Step 4: Delegate to role-based routing ────────────────────────────────
  //
  // validateCallbackMembership() passed, so we have an APPROVED tenant
  // and a valid role. Let getPostLoginDestination() decide the destination.
  const normalizedRole = normalizeRole(membership.role) ?? 'OWNER'; // safe — validated above
  const routing = getPostLoginDestination({
    tenantStatus: membership.tenant.status,
    membershipRole: normalizedRole,
    defaultPath: requestedNext,
  });

  console.log(
    `[AuthOrchestrator][resolvePostAuthRedirect] Access granted: ` +
      `user=${membership.user.email}, role=${normalizedRole}, destination=${routing.destination}`
  );

  return {
    destination: routing.destination,
    reason: routing.reason,
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
  console.log(`[AUTH_ORCHESTRATOR] Checking allowlist for: ${email}. Raw list: "${allowlistRaw}"`);
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
