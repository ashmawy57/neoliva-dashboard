'use server'

import { revalidatePath } from 'next/cache'
import { ServiceService } from "@/services/service.service";
import { ServiceCategory } from "@/generated/client";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

import { wrapAction } from "@/lib/observability/wrap-action";

const serviceService = new ServiceService();

/**
 * Server Action: Fetches all dental services.
 */
export async function getServices() {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.DASHBOARD_VIEW);
    const data = await serviceService.getServices(tenantId);
    return data;
  } catch (error) {
    console.error('[Actions] Error fetching services:', error);
    return [];
  }
}

/**
 * Server Action: Creates a new dental service.
 */
export const createServiceAction = wrapAction(
  'SERVICE_CREATE',
  async (data: {
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description?: string;
    popular?: boolean;
  }) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.SETTINGS_SERVICES_MANAGE);
    const result = await serviceService.createService(tenantId, data);
    revalidatePath('/services');
    revalidatePath('/appointments'); 
    return result;
  },
  { module: 'settings', entityType: 'SERVICE' }
);

/**
 * Server Action: Updates a dental service.
 */
export const updateServiceAction = wrapAction(
  'SERVICE_UPDATE',
  async (id: string, data: Partial<{
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description: string;
    popular: boolean;
  }>) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.SETTINGS_SERVICES_MANAGE);
    const result = await serviceService.updateService(tenantId, id, data);
    revalidatePath('/services');
    return result;
  },
  { module: 'settings', entityType: 'SERVICE' }
);

/**
 * Server Action: Deletes a dental service.
 */
export const deleteServiceAction = wrapAction(
  'SERVICE_DELETE',
  async (id: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.SETTINGS_SERVICES_MANAGE);
    const result = await serviceService.deleteService(tenantId, id);
    revalidatePath('/services');
    return result;
  },
  { module: 'settings', entityType: 'SERVICE' }
);

