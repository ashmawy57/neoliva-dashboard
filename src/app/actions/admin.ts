'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

import { wrapAction } from "@/lib/observability/wrap-action";

export async function getAllTenants() {
  await requirePermission(PermissionCode.ADMIN_SYSTEM_VIEW);
  return await prisma.tenant.findMany({
    include: {
      _count: {
        select: { staff: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export const updateTenantStatus = wrapAction(
  'updateTenantStatus',
  async (tenantId: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DISABLED') => {
    console.log(`[SUPER_ADMIN][ACTION_START] Server received request for Tenant: ${tenantId}, New Status: ${status}`);
    try {
      console.log(`[SUPER_ADMIN][AUTH_CHECK] Verifying ADMIN_TENANT_MANAGE permission...`);
      await requirePermission(PermissionCode.ADMIN_TENANT_MANAGE);
      console.log(`[SUPER_ADMIN][AUTH_CHECK] Permission verified.`);
      
      console.log(`[SUPER_ADMIN][DB_QUERY] Fetching tenant record...`);
      const oldTenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { status: true, name: true }
      });
      console.log(`[SUPER_ADMIN][DB_QUERY] Current state:`, oldTenant);

      if (!oldTenant) {
        console.error(`[SUPER_ADMIN][NOT_FOUND] Tenant ${tenantId} does not exist in DB.`);
        throw new Error("Tenant not found");
      }

      console.log(`[SUPER_ADMIN][DB_UPDATE] Executing update in Prisma: ${oldTenant.status} -> ${status}`);
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { status }
      });
      console.log(`[SUPER_ADMIN][DB_UPDATE] Prisma update successful. New status in DB: ${updatedTenant.status}`);

      // Audit Logging
      console.log(`[SUPER_ADMIN][AUDIT_LOG] Creating audit entry for TENANT_STATUS_CHANGE...`);
      const { AuditService } = await import('@/services/audit.service');
      await AuditService.logAudit({
        action: `TENANT_STATUS_CHANGE`,
        entityType: 'TENANT',
        entityId: tenantId,
        metadata: { 
          oldStatus: oldTenant.status,
          newStatus: status,
          clinicName: oldTenant.name
        }
      });
      console.log(`[SUPER_ADMIN][AUDIT_LOG] Audit entry created.`);

      // If suspended or disabled, immediately revoke all active sessions
      if (status === 'SUSPENDED' || status === 'DISABLED') {
        console.log(`[SUPER_ADMIN][SESSION_MGMT] Revoking all sessions for tenant ${tenantId} due to ${status}...`);
        const { SessionService } = await import('@/lib/auth/session-service');
        await SessionService.revokeAllSessionsForTenant(tenantId);
        
        await AuditService.logAudit({
          action: `TENANT_SESSIONS_REVOKED`,
          entityType: 'TENANT',
          entityId: tenantId,
          metadata: { 
            reason: `Tenant status changed to ${status}`,
            clinicName: oldTenant.name
          }
        });
        console.log(`[SUPER_ADMIN][SESSION_MGMT] Revocation complete.`);
      }
      
      console.log(`[SUPER_ADMIN][REVALIDATE] Revalidating path /admin/clinics...`);
      revalidatePath('/admin/clinics');
      
      console.log(`[SUPER_ADMIN][ACTION_SUCCESS] Finished processing status update.`);
      return { success: true };
    } catch (error: any) {
      console.error(`[SUPER_ADMIN][ACTION_ERROR] Caught error in server action:`, error);
      // We throw the error so wrapAction catches it and formats it for the UI
      throw error;
    }
  },
  { module: 'admin', entityType: 'TENANT' }
);

export async function getTenantActiveSessions(tenantId: string) {
  await requirePermission(PermissionCode.ADMIN_SYSTEM_VIEW);
  const { SessionService } = await import('@/lib/auth/session-service');
  return await SessionService.getActiveSessions(tenantId);
}

export async function revokeSession(sessionId: string) {
  await requirePermission(PermissionCode.ADMIN_TENANT_MANAGE);
  const { SessionService } = await import('@/lib/auth/session-service');
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { tenantId: true, userId: true, ipAddress: true }
  });

  await SessionService.revokeSession(sessionId);

  // Audit Logging
  const { AuditService } = await import('@/services/audit.service');
  await AuditService.logAudit({
    action: 'SESSION_REVOKED_BY_ADMIN',
    entityType: 'SESSION',
    entityId: sessionId,
    tenantId: session?.tenantId || undefined,
    metadata: {
      targetUserId: session?.userId,
      targetIp: session?.ipAddress
    }
  });

  revalidatePath('/admin/clinics');
  return { success: true };
}

