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
  async (tenantId: string, status: 'APPROVED' | 'REJECTED') => {
    await requirePermission(PermissionCode.ADMIN_TENANT_MANAGE);
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });
    
    revalidatePath('/admin/clinics');
    return { success: true };
  },
  { module: 'admin', entityType: 'TENANT' }
);

