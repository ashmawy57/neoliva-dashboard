'use server'

import { withPermission } from "@/lib/rbac/guard";


import { revalidatePath } from 'next/cache';
import { InventoryService } from "@/services/inventory.service";



import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";

const inventoryService = new InventoryService();

/**
 * Server Action: Creates a new inventory item.
 */
export const createItemAction = wrapAction(
  'INVENTORY_ITEM_CREATE',
  async (data: {
    name: string;
    category: string;
    unit: string;
    minimumStock: number;
    initialStock?: number;
  }) => {
    return withPermission('inventory', 'create', async (session) => {
      const tenantId = session.tenantId;
      const result = await inventoryService.createItemService(tenantId, data);
      
          await EventService.trackEvent({
            tenantId,
            eventType: 'INVENTORY_ITEM_CREATED',
            entityType: 'INVENTORY',
            entityId: result.id,
            metadata: { name: data.name, category: data.category }
          });
      
          revalidatePath('/inventory');
          return result;
    });
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

/**
 * Server Action: Fetches inventory items and stats.
 */
export async function getInventoryAction(filters?: { search?: string; category?: string }) {
  try {
    return await withPermission('inventory', 'read', async (session) => {
      const tenantId = session.tenantId;
      const items = await inventoryService.getItemsService(tenantId, filters);
          const stats = await inventoryService.getInventoryStatsService(tenantId);
          return { success: true, error: undefined, data: { items, stats } };
    });
  } catch (error: any) {
    console.error('[getInventoryAction]', error);
        return { success: false, data: undefined, error: error.message };
  }
}

/**
 * Server Action: Adds stock to an item.
 */
export const addStockAction = wrapAction(
  'INVENTORY_STOCK_ADD',
  async (data: {
    itemId: string;
    quantity: number;
    reason: string;
  }) => {
    return withPermission('inventory', 'create', async (session) => {
      const tenantId = session.tenantId;
      await inventoryService.addStockService(tenantId, data);
      
          await EventService.trackEvent({
            tenantId,
            eventType: 'INVENTORY_STOCK_ADDED',
            entityType: 'INVENTORY',
            entityId: data.itemId,
            metadata: { quantity: data.quantity, reason: data.reason }
          });
      
          revalidatePath('/inventory');
          return { success: true, error: undefined };
    });
  },
  { module: 'inventory', entityType: 'INVENTORY', entityIdPath: 'itemId' }
);

/**
 * Server Action: Deducts stock from an item.
 */
export const deductStockAction = wrapAction(
  'INVENTORY_STOCK_DEDUCT',
  async (data: {
    itemId: string;
    quantity: number;
    reason: string;
  }) => {
    return withPermission('inventory', 'update', async (session) => {
      const tenantId = session.tenantId;
      await inventoryService.deductStockService(tenantId, data);
      
          await EventService.trackEvent({
            tenantId,
            eventType: 'INVENTORY_STOCK_DEDUCTED',
            entityType: 'INVENTORY',
            entityId: data.itemId,
            metadata: { quantity: data.quantity, reason: data.reason }
          });
      
          revalidatePath('/inventory');
          return { success: true, error: undefined };
    });
  },
  { module: 'inventory', entityType: 'INVENTORY', entityIdPath: 'itemId' }
);

/**
 * Server Action: Fetches item history.
 */
export async function getItemHistoryAction(itemId: string) {
  try {
    return await withPermission('inventory', 'read', async (session) => {
      const tenantId = session.tenantId;
      const history = await inventoryService.getItemHistoryService(tenantId, itemId);
          return { success: true, error: undefined, data: history };
    });
  } catch (error: any) {
    console.error('[getItemHistoryAction]', error);
        return { success: false, data: undefined, error: error.message };
  }
}

/**
 * Server Action: Updates an inventory item.
 */
export const updateItemAction = wrapAction(
  'INVENTORY_ITEM_UPDATE',
  async (id: string, data: {
    name?: string;
    category?: string;
    unit?: string;
    minimumStock?: number;
  }) => {
    return withPermission('inventory', 'update', async (session) => {
      const tenantId = session.tenantId;
      await inventoryService.updateItemService(tenantId, id, data);
      
          await EventService.trackEvent({
            tenantId,
            eventType: 'INVENTORY_ITEM_UPDATED',
            entityType: 'INVENTORY',
            entityId: id,
            metadata: { ...data }
          });
      
          revalidatePath('/inventory');
          return { success: true, error: undefined };
    });
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

/**
 * Server Action: Deletes an inventory item.
 */
export const deleteItemAction = wrapAction(
  'INVENTORY_ITEM_DELETE',
  async (id: string) => {
    return withPermission('inventory', 'delete', async (session) => {
      const tenantId = session.tenantId;
      await inventoryService.deleteItemService(tenantId, id);
      
          await EventService.trackEvent({
            tenantId,
            eventType: 'INVENTORY_ITEM_DELETED',
            entityType: 'INVENTORY',
            entityId: id
          });
      
          revalidatePath('/inventory');
          return { success: true, error: undefined };
    });
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

