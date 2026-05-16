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
  async (tenantId: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    await requirePermission(PermissionCode.ADMIN_TENANT_MANAGE);
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });

    // If suspended, immediately revoke all active sessions
    if (status === 'SUSPENDED') {
      const { SessionService } = await import('@/lib/auth/session-service');
      await SessionService.revokeAllSessionsForTenant(tenantId);
    }
    
    revalidatePath('/admin/clinics');
    return { success: true };
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
  await SessionService.revokeSession(sessionId);
  revalidatePath('/admin/clinics');
  return { success: true };
}

