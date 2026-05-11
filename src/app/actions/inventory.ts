'use server'

import { revalidatePath } from 'next/cache';
import { InventoryService } from "@/services/inventory.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const inventoryService = new InventoryService();

export async function createItemAction(data: {
  name: string;
  category: string;
  unit: string;
  minimumStock: number;
  initialStock?: number;
}) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await inventoryService.createItemService(tenantId, data);
    revalidatePath('/inventory');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[createItemAction]', error);
    return { success: false, error: error.message };
  }
}

export async function getInventoryAction(filters?: { search?: string; category?: string }) {
  try {
    const tenantId = await resolveTenantContext();
    const items = await inventoryService.getItemsService(tenantId, filters);
    const stats = await inventoryService.getInventoryStatsService(tenantId);
    return { success: true, data: { items, stats } };
  } catch (error: any) {
    console.error('[getInventoryAction]', error);
    return { success: false, error: error.message };
  }
}

export async function addStockAction(data: {
  itemId: string;
  quantity: number;
  reason: string;
}) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.addStockService(tenantId, data);
    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('[addStockAction]', error);
    return { success: false, error: error.message };
  }
}

export async function deductStockAction(data: {
  itemId: string;
  quantity: number;
  reason: string;
}) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.deductStockService(tenantId, data);
    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('[deductStockAction]', error);
    return { success: false, error: error.message };
  }
}

export async function getItemHistoryAction(itemId: string) {
  try {
    const tenantId = await resolveTenantContext();
    const history = await inventoryService.getItemHistoryService(tenantId, itemId);
    return { success: true, data: history };
  } catch (error: any) {
    console.error('[getItemHistoryAction]', error);
    return { success: false, error: error.message };
  }
}

export async function updateItemAction(id: string, data: {
  name?: string;
  category?: string;
  unit?: string;
  minimumStock?: number;
}) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.updateItemService(tenantId, id, data);
    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('[updateItemAction]', error);
    return { success: false, error: error.message };
  }
}

export async function deleteItemAction(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await inventoryService.deleteItemService(tenantId, id);
    revalidatePath('/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteItemAction]', error);
    return { success: false, error: error.message };
  }
}
