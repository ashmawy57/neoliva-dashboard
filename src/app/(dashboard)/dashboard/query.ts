import { DashboardService } from "@/services/dashboard.service";
import { resolveTenantContextOrRedirect as resolveTenantContext } from "@/lib/auth/resolve-tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { cache } from "react";

const dashboardService = new DashboardService();

export const getDashboardData = cache(async () => {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.DASHBOARD_VIEW);

    return await dashboardService.getDashboardData(tenantId);
  } catch (error: any) {
    console.error('[getDashboardData]', error);
    throw error;
  }
});
