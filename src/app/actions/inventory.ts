'use server'

import { revalidatePath } from 'next/cache'
import { InventoryService } from "@/services/inventory.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const inventoryService = new InventoryService();

export async function getInventory() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await inventoryService.getInventory(tenantId);

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || 'Uncategorized',
      quantity: item.quantity,
      minLevel: item.minLevel,
      unit: item.unit || 'Units'
    }));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

export async function createInventoryItem(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantityStr = formData.get('quantity') as string
  const minLevelStr = formData.get('minLevel') as string
  const unit = formData.get('unit') as string

  if (!name || !category || !quantityStr || !minLevelStr || !unit) {
    return { error: 'Missing required fields' }
  }

  const quantity = parseInt(quantityStr, 10)
  const minLevel = parseInt(minLevelStr, 10)

  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.createInventoryItem(tenantId, {
      name,
      category,
      quantity,
      minLevel,
      unit
    });

    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    return { error: error.message };
  }
}

export async function updateInventoryItem(id: string, data: any) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.updateInventoryItem(tenantId, id, data);

    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    return { error: error.message };
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.deleteInventoryItem(tenantId, id);

    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return { error: error.message };
  }
}

