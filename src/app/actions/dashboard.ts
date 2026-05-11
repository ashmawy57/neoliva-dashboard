'use server'

import { DashboardService } from "@/services/dashboard.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const dashboardService = new DashboardService();

export async function getDashboardData() {
  try {
    const tenantId = await resolveTenantContext();

    if (!tenantId) {
      throw new Error("Unauthorized");
    }

    return await dashboardService.getDashboardData(tenantId);
  } catch (error: any) {
    console.error('[getDashboardData]', error);
    throw error;
  }
}
