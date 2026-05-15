/**
 * CENTRALIZED TENANT RESOLUTION LAYER
 *
 * ██████████████████████████████████████████████████████████
 * ██  SINGLE SOURCE OF TRUTH FOR TENANT CONTEXT RESOLUTION ██
 * ██████████████████████████████████████████████████████████
 *
 * This module is the ONLY place in the application that performs
 * tenant resolution. All other code MUST use this module — never
 * use raw Prisma queries to resolve the tenant context elsewhere.
 *
 * Security Model: FAIL-CLOSED
 * ─────────────────────────────────────────────────────────
 * Any ambiguous or invalid state results in an error/denial.
 * The system never "falls through" to a permissive default.
 *
 * Resolution Priority:
 * 1. active_tenant_id from JWT session metadata (fastest, multi-clinic support)
 * 2. findFirst fallback on active TenantMembership (single-clinic default)
 *
 * Regardless of which path resolves the membership, the SAME
 * strict validation pipeline is applied to EVERY membership found.
 */

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { normalizeRole } from '@/lib/auth/roles';
import { TenantContextError } from '@/lib/auth/auth-errors';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedTenantContext {
  tenantId: string;
  user: {
    id: string;
    email: string;
    tenantId: string;
    staffId?: string;
    role: string;
    tenant: {
      status: string;
    };
  };
  authUser: {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  };
}

// ─── Core — Unified Validation Pipeline ──────────────────────────────────────

/**
 * validateMembership
 *
 * This is the UNIFIED validation checkpoint that EVERY membership
 * found (by any resolution path) MUST pass through.
 *
 * It enforces the FAIL-CLOSED model:
 * - Inactive membership → MEMBERSHIP_INACTIVE
 * - PENDING tenant      → PENDING
 * - REJECTED tenant     → REJECTED
 * - SUSPENDED tenant    → SUSPENDED
 * - Unknown/null role   → INVALID_ROLE
 *
 * This function is intentionally separate so that
 * active_tenant_id path and findFirst fallback path
 * both pass through the SAME logic — no divergence.
 */
function validateMembership(membership: {
  isActive: boolean;
  status: string;
  role: string;
  tenant: { status: string };
  user: { id: string; email: string };
  tenantId: string;
  staffProfile?: { id: string } | null;
}): void {
  // 1. Membership must be active
  if (!membership.isActive || membership.status !== 'ACTIVE') {
    throw new TenantContextError(
      'MEMBERSHIP_INACTIVE',
      `Membership for user ${membership.user.email} is not active (isActive=${membership.isActive}, status=${membership.status})`
    );
  }

  // 2. Tenant status checks — FAIL-CLOSED on any non-APPROVED state
  const tenantStatus = membership.tenant.status;

  if (tenantStatus === 'PENDING') {
    throw new TenantContextError(
      'PENDING',
      `Tenant for user ${membership.user.email} is PENDING admin approval.`
    );
  }

  if (tenantStatus === 'REJECTED') {
    throw new TenantContextError(
      'REJECTED',
      `Tenant for user ${membership.user.email} has been REJECTED by admin.`
    );
  }

  if (tenantStatus === 'SUSPENDED') {
    throw new TenantContextError(
      'SUSPENDED',
      `Tenant for user ${membership.user.email} has been SUSPENDED.`
    );
  }

  // 3. Role must be a valid, recognized system role
  const normalizedRole = normalizeRole(membership.role);
  if (!normalizedRole) {
    throw new TenantContextError(
      'INVALID_ROLE',
      `User ${membership.user.email} has unrecognized role: "${membership.role}"`
    );
  }
}

// ─── Core — Prisma Membership Query ──────────────────────────────────────────

/**
 * The standard Prisma include/select shape used in ALL membership queries.
 * This ensures that validateMembership always receives the data it needs.
 */
const MEMBERSHIP_INCLUDE = {
  tenant: { select: { status: true } },
  user: true,
  staffProfile: { select: { id: true } },
} as const;

// ─── Main Export — Memoized Per-Request Resolution ────────────────────────────

/**
 * resolveTenantContext
 *
 * Memoized via React's `cache()` — called multiple times in the same
 * request returns the same result without additional DB queries.
 *
 * Usage:
 *   const ctx = await resolveTenantContext();
 *   const { tenantId, user } = ctx;
 *
 * Throws TenantContextError on any failure — callers should catch
 * and handle (or use `resolveTenantContextOrRedirect` for UI code).
 */
export const resolveTenantContext = cache(async (): Promise<ResolvedTenantContext> => {
  // ── Step 1: Get authenticated user from Supabase ──────────────────────────
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new TenantContextError(
      'UNAUTHORIZED',
      `Supabase auth.getUser failed: ${authError?.message ?? 'No user in session'}`
    );
  }

  // ── Step 2: Determine Resolution Path ────────────────────────────────────
  const activeTenantId = (
    authUser.app_metadata?.active_tenant_id ??
    authUser.user_metadata?.active_tenant_id
  ) as string | undefined;

  let membership: Awaited<ReturnType<typeof fetchMembershipByTenantId>> | null = null;

  if (activeTenantId) {
    // Path A: active_tenant_id present in JWT — target specific tenant
    membership = await fetchMembershipByTenantId(authUser.id, activeTenantId);

    if (!membership) {
      throw new TenantContextError(
        'NO_MEMBERSHIP',
        `User ${authUser.email} has active_tenant_id "${activeTenantId}" in JWT but no matching membership in DB.`
      );
    }
  } else {
    // Path B: No active_tenant_id — fallback to first active membership
    membership = await fetchPrimaryMembership(authUser.id);

    if (!membership) {
      // Check if User record exists at all for better diagnostics
      const userExists = await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true },
      });

      if (!userExists) {
        throw new TenantContextError(
          'NO_USER_RECORD',
          `No DB User record found for Supabase UID: ${authUser.id} (${authUser.email})`
        );
      }

      throw new TenantContextError(
        'NO_MEMBERSHIP',
        `User ${authUser.email} (DB found) has no ACTIVE TenantMembership.`
      );
    }
  }

  // ── Step 3: UNIFIED Validation Pipeline (FAIL-CLOSED) ────────────────────
  // This runs on EVERY membership, regardless of which path found it.
  validateMembership(membership);

  // ── Step 4: Build and return the resolved context ─────────────────────────
  const normalizedRole = normalizeRole(membership.role)!; // Safe: validateMembership already checked this

  return {
    tenantId: membership.tenantId,
    user: {
      id: membership.user.id,
      email: membership.user.email,
      tenantId: membership.tenantId,
      staffId: membership.staffProfile?.id,
      role: normalizedRole,
      tenant: { status: membership.tenant.status },
    },
    authUser,
  };
});

// ─── Private Query Helpers ────────────────────────────────────────────────────

async function fetchMembershipByTenantId(supabaseUserId: string, tenantId: string) {
  // Resolve internal user ID first
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: { id: true },
  });

  if (!dbUser) return null;

  return prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: dbUser.id,
        tenantId,
      },
    },
    include: MEMBERSHIP_INCLUDE,
  });
}

async function fetchPrimaryMembership(supabaseUserId: string) {
  return prisma.tenantMembership.findFirst({
    where: {
      user: { supabaseId: supabaseUserId },
      isActive: true,
      status: 'ACTIVE',
    },
    include: MEMBERSHIP_INCLUDE,
    // Deterministic tie-breaking: most recently joined membership
    orderBy: { joinedAt: 'desc' },
  });
}

// ─── UI Redirect Wrapper ──────────────────────────────────────────────────────

/**
 * resolveTenantContextOrRedirect
 *
 * Wrapper for use in Server Components and Pages.
 * Catches TenantContextError and performs appropriate UI redirects.
 * Returns the resolved context on success.
 */
export async function resolveTenantContextOrRedirect(): Promise<ResolvedTenantContext> {
  const { redirect } = await import('next/navigation');

  try {
    return await resolveTenantContext();
  } catch (error) {
    if (error instanceof TenantContextError) {
      console.warn(`[TenantContext] Redirecting due to ${error.code}: ${error.internalReason}`);

      switch (error.code) {
        case 'PENDING':
          redirect('/pending-approval');
        case 'REJECTED':
          redirect('/auth/error?type=ACCOUNT_REJECTED');
        case 'SUSPENDED':
          redirect('/auth/error?type=ACCOUNT_SUSPENDED');
        case 'UNAUTHORIZED':
        case 'NO_USER_RECORD':
        case 'NO_MEMBERSHIP':
        case 'MEMBERSHIP_INACTIVE':
          redirect('/auth/error?type=SESSION_EXPIRED');
        case 'INVALID_ROLE':
          redirect('/auth/error?type=INVALID_ACCOUNT');
        default:
          redirect('/auth/error?type=SESSION_EXPIRED');
      }
    }
    // Re-throw unexpected errors (will surface as a 500)
    throw error;
  }
}
