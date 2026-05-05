'use server'

import { DashboardService } from "@/services/dashboard.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const dashboardService = new DashboardService();

export async function getDashboardData() {
  try {
    const tenantId = await resolveTenantContext();
    return await dashboardService.getDashboardData(tenantId);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      lowInventoryCount: 0,
      pendingPayments: 0,
      overdueCount: 0,
      todaysAppointmentsCount: 0,
      completedAppointmentsCount: 0,
      pendingAppointmentsCount: 0,
      recentPatients: [],
    };
  }
}

