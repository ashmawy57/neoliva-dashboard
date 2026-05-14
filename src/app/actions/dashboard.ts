'use server'

import { DashboardService } from "@/services/dashboard.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

const dashboardService = new DashboardService();

export async function getDashboardData() {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.DASHBOARD_VIEW);

    return await dashboardService.getDashboardData(tenantId);
  } catch (error: any) {
    console.error('[getDashboardData]', error);
    throw error;
  }
}
