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

  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      email: true,
      tenantId: true,
      role: true,
      staffId: true,
      tenant: { select: { status: true } },
      staff: { select: { name: true, inviteAccepted: true } }
    }
  });

  if (!dbUser) {
    // Self-healing: Search for Staff record by email
    const staff = await prisma.staff.findUnique({
      where: { email: user.email! }
    });

    if (staff) {
      dbUser = await prisma.user.upsert({
        where: { supabaseId: user.id },
        update: {},
        create: {
          supabaseId: user.id,
          email: user.email!,
          tenantId: staff.tenantId,
          staffId: staff.id,
          role: staff.role
        },
        select: {
          id: true,
          email: true,
          tenantId: true,
          role: true,
          staffId: true,
          tenant: { select: { status: true } },
          staff: { select: { name: true, inviteAccepted: true } }
        }
      });
    } else {
      throw new TenantContextError("Unauthorized: User record not found.", 'NO_USER_RECORD');
    }
  }

  // Check tenant status
  if (dbUser.tenant.status === 'PENDING') {
    throw new TenantContextError("Access Denied: Tenant approval pending.", 'PENDING');
  }

  if (dbUser.tenant.status === 'REJECTED') {
    throw new TenantContextError("Access Denied: Tenant has been rejected.", 'REJECTED');
  }

  // Check staff invitation for non-admins
  if (dbUser.role !== 'ADMIN') {
    if (!dbUser.staff || !dbUser.staff.inviteAccepted) {
      throw new TenantContextError("Access Denied: Invitation not accepted.", 'UNAUTHORIZED');
    }
  }

  const normalizedRole = normalizeRole(dbUser.role);
  if (!normalizedRole) {
    throw new TenantContextError(`Access Denied: Invalid or unknown user role "${dbUser.role}".`, 'UNAUTHORIZED');
  }

  return {
    tenantId: dbUser.tenantId,
    user: {
      ...dbUser,
      role: normalizedRole
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
