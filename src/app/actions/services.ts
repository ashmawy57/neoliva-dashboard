'use server'

import { revalidatePath } from 'next/cache'
import { ServiceService } from "@/services/service.service";
import { ServiceCategory } from "@/generated/client";
import { resolveTenantContext } from "@/lib/tenant-context";

const serviceService = new ServiceService();

export async function getServices() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await serviceService.getServices(tenantId);
    return data;
  } catch (error) {
    console.error('[Actions] Error fetching services:', error);
    return [];
  }
}

export async function createServiceAction(data: {
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number;
  description?: string;
  popular?: boolean;
}) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await serviceService.createService(tenantId, data);
    revalidatePath('/services');
    revalidatePath('/appointments'); 
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error creating service:', error);
    return { success: false, error: error.message };
  }
}

export async function updateServiceAction(id: string, data: Partial<{
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number;
  description: string;
  popular: boolean;
}>) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await serviceService.updateService(tenantId, id, data);
    revalidatePath('/services');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error updating service:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await serviceService.deleteService(tenantId, id);
    revalidatePath('/services');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error deleting service:', error);
    return { success: false, error: error.message };
  }
}
