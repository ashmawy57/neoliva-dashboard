import { withPermission } from "@/lib/rbac/guard";
import { DashboardService } from "@/services/dashboard.service";



import { cache } from "react";

const dashboardService = new DashboardService();

export const getDashboardData = cache(async () => {
  try {
    return await withPermission('reports', 'read', async (session) => {
      const tenantId = session.tenantId;
      return await dashboardService.getDashboardData(tenantId);
    });
  } catch (error: any) {
    console.error('[getDashboardData]', error);
        throw error;
  }
});
