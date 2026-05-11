'use server'

import { revalidatePath } from 'next/cache'
import { ServiceService } from "@/services/service.service";
import { ServiceCategory } from "@prisma/client";

const serviceService = new ServiceService();

export async function getServices() {
  try {
    const data = await serviceService.getServices();
    console.log(`[Actions] getServices fetched ${data.length} items`);
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
  console.log('[Actions] createService called with:', data);
  try {
    const result = await serviceService.createService(data);
    revalidatePath('/services');
    revalidatePath('/appointments'); // In case appointments uses services
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error creating service:', error);
    return { error: error.message };
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
  console.log(`[Actions] updateService called for ${id}:`, data);
  try {
    const result = await serviceService.updateService(id, data);
    revalidatePath('/services');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error updating service:', error);
    return { error: error.message };
  }
}

export async function deleteServiceAction(id: string) {
  console.log(`[Actions] deleteService called for ${id}`);
  try {
    const result = await serviceService.deleteService(id);
    revalidatePath('/services');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Actions] Error deleting service:', error);
    return { error: error.message };
  }
}
