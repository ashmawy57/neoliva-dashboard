import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
export async function resolveTenantContext(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('[TenantContext] No active session:', error?.message);
    throw new TenantContextError("Unauthorized: No active session found.", 'UNAUTHORIZED');
  }

  console.log('[TenantContext] Resolving tenant for supabaseId:', user.id, 'email:', user.email);

  // 1. Find the user record with tenant status and staff invitation status
  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      email: true,
      supabaseId: true,
      tenantId: true,
      role: true,
      tenant: {
        select: { id: true, status: true, name: true }
      },
      staff: {
        select: { inviteAccepted: true, role: true }
      }
    }
  });

  if (!dbUser) {
    console.log('[TenantContext] No DB User record found for supabaseId:', user.id, '| Checking for Staff by email:', user.email);
    
    // Self-healing: Search for Staff record by email
    const staff = await prisma.staff.findUnique({
      where: { email: user.email! }
    });

    if (staff) {
      console.log('[Auth] Creating missing user mapping for:', user.email);
      dbUser = await prisma.user.upsert({
        where: { supabaseId: user.id },
        update: {}, // No updates needed if it already exists
        create: {
          supabaseId: user.id,
          email: user.email!,
          tenantId: staff.tenantId,
          staffId: staff.id,
          role: staff.role // Assign the role from staff record
        },
        select: {
          id: true,
          email: true,
          supabaseId: true,
          tenantId: true,
          role: true,
          tenant: {
            select: { id: true, status: true, name: true }
          },
          staff: {
            select: { inviteAccepted: true, role: true }
          }
        }
      });
    } else {
      console.error('[TenantContext] No Staff record found for email:', user.email);
      throw new TenantContextError(
        `Access Denied: No account record found for ${user.email}. Please contact your clinic administrator.`,
        'UNAUTHORIZED'
      );
    }
  }

  console.log('[TenantContext] Found User:', dbUser.id, '| Role:', dbUser.role, '| TenantStatus:', dbUser.tenant.status, '| Staff:', dbUser.staff ? `inviteAccepted=${dbUser.staff.inviteAccepted}` : 'null');

  // 2. Check tenant status first — this applies to ALL users
  if (dbUser.tenant.status === 'PENDING') {
    console.log('[TenantContext] Tenant PENDING → redirecting to /pending-approval');
    redirect('/pending-approval');
  }

  if (dbUser.tenant.status === 'REJECTED') {
    console.log('[TenantContext] Tenant REJECTED → redirecting to /rejected');
    redirect('/rejected');
  }

  // 3. Tenant is APPROVED. For non-ADMIN users, verify invite was accepted.
  //    Clinic owners (created via createClinicRequest) have role='ADMIN' and
  //    their staff record is created with inviteAccepted=true, so this is safe.
  if (dbUser.role !== 'ADMIN') {
    if (!dbUser.staff || !dbUser.staff.inviteAccepted) {
      console.error('[TenantContext] Non-admin user has not accepted invite. Staff:', dbUser.staff);
      throw new TenantContextError(
        `Access Denied: You must accept your invitation before logging in.`,
        'UNAUTHORIZED'
      );
    }
  }

  console.log('[TenantContext] ✅ Access granted. TenantId:', dbUser.tenantId);
  return dbUser.tenantId;
}
