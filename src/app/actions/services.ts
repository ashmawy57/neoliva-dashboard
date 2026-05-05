'use server'

import { revalidatePath } from 'next/cache'
import { ServiceService } from "@/services/service.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const serviceService = new ServiceService();

export async function getServices() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await serviceService.getServices(tenantId);

    return data.map((service) => ({
      id: service.id,
      name: service.name,
      price: Number(service.price),
      duration: service.duration,
      description: service.description || '',
      category: service.category || 'General',
      // Fallback icons based on category
      icon: service.category === 'Preventive' ? '🪥' 
        : service.category === 'Restorative' ? '🦷'
        : service.category === 'Cosmetic' ? '✨'
        : service.category === 'Surgical' ? '🔩'
        : service.category === 'Orthodontics' ? '📋'
        : '⚕️',
      popular: service.popular || false
    }))
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function createService(formData: FormData) {
  const name = formData.get('name') as string
  const priceStr = formData.get('price') as string
  const durationStr = formData.get('duration') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string

  if (!name || !priceStr || !durationStr || !category) {
    return { error: 'Missing required fields' }
  }

  const price = parseFloat(priceStr)
  const duration = parseInt(durationStr, 10)

  try {
    const tenantId = await resolveTenantContext();
    await serviceService.createService(tenantId, {
      name,
      price,
      duration,
      description,
      category
    });

    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating service:', error);
    return { error: error.message };
  }
}

export async function updateService(id: string, data: any) {
  try {
    const tenantId = await resolveTenantContext();
    await serviceService.updateService(tenantId, id, data);

    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating service:', error);
    return { error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await serviceService.deleteService(tenantId, id);

    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return { error: error.message };
  }
}

