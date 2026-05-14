import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";
import { normalizeRole } from "./rbac";

export class TenantContextError extends Error {
  constructor(message: string, public code: 'UNAUTHORIZED' | 'NO_USER_RECORD' | 'NO_TENANT' | 'PENDING' | 'REJECTED') {
    super(message);
    this.name = 'TenantContextError';
  }
}

/**
 * Resolves the current tenant context from the authenticated user session.
 * 
 * Flow:
 * 1. Get Supabase session user
 * 2. Find the User record in the DB (linked by supabaseId)
 * 3. Check tenant status:
 *    - PENDING   → redirect to /pending-approval
 *    - REJECTED  → redirect to /rejected
 *    - APPROVED  → return tenantId ✅
 * 4. For non-ADMIN users, also verify that inviteAccepted = true on their Staff record
 */
/**
 * Core logic to retrieve tenant context without redirecting.
 * Useful for API routes and background tasks.
 * Memoized per request.
 */
export const getTenantContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new TenantContextError("Unauthorized: No active session found.", 'UNAUTHORIZED');
  }

  // Get active tenant from session metadata
  const activeTenantId = user.app_metadata?.active_tenant_id || user.user_metadata?.active_tenant_id;

  if (!activeTenantId) {
    // If no active tenant, try to find the primary membership
    const membership = await prisma.tenantMembership.findFirst({
      where: { 
        user: { supabaseId: user.id },
        isActive: true,
        status: 'ACTIVE'
      },
      include: { 
        tenant: { select: { status: true } },
        user: true,
        staffProfile: { select: { id: true } }
      }
    });

    if (!membership) {
      throw new TenantContextError("Access Denied: No active clinic membership found.", 'NO_TENANT');
    }

    // Return the found membership
    return {
      tenantId: membership.tenantId,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        tenantId: membership.tenantId,
        staffId: membership.staffProfile?.id,
        role: normalizeRole(membership.role)!,
        tenant: { status: membership.tenant.status }
      },
      authUser: user
    };
  }

  // Find membership for the active tenant
  const membership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: (await prisma.user.findUnique({ where: { supabaseId: user.id } }))?.id || '',
        tenantId: activeTenantId
      }
    },
    include: {
      tenant: { select: { status: true } },
      user: true,
      staffProfile: { select: { id: true } }
    }
  });

  if (!membership || !membership.isActive || membership.status !== 'ACTIVE') {
    throw new TenantContextError("Access Denied: You do not have an active membership in this clinic.", 'UNAUTHORIZED');
  }

  // Check tenant status
  if (membership.tenant.status === 'PENDING') {
    throw new TenantContextError("Access Denied: Clinic approval pending.", 'PENDING');
  }

  if (membership.tenant.status === 'REJECTED') {
    throw new TenantContextError("Access Denied: Clinic has been rejected.", 'REJECTED');
  }

  const normalizedRole = normalizeRole(membership.role);
  if (!normalizedRole) {
    throw new TenantContextError(`Access Denied: Invalid or unknown user role "${membership.role}".`, 'UNAUTHORIZED');
  }

  return {
    tenantId: membership.tenantId,
    user: {
      id: membership.user.id,
      email: membership.user.email,
      tenantId: membership.tenantId,
      staffId: membership.staffProfile?.id,
      role: normalizedRole,
      tenant: { status: membership.tenant.status }
    },
    authUser: user
  };
});

/**
 * Resolves the current tenant context and handles UI redirects.
 * Use this in Server Components and Pages.
 */
export async function resolveTenantContext(): Promise<string> {
  try {
    const { tenantId } = await getTenantContext();
    return tenantId;
  } catch (error) {
    if (error instanceof TenantContextError) {
      if (error.code === 'PENDING') redirect('/auth/error?type=TENANT_PENDING');
      if (error.code === 'REJECTED') redirect('/auth/error?type=ACCOUNT_SUSPENDED');
      if (error.code === 'UNAUTHORIZED' || error.code === 'NO_USER_RECORD') redirect('/auth/error?type=SESSION_EXPIRED');
    }
    throw error;
  }
}
