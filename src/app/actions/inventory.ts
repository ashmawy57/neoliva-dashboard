'use server'

import { revalidatePath } from 'next/cache';
import { InventoryService } from "@/services/inventory.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
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
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_MANAGE);
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
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

/**
 * Server Action: Fetches inventory items and stats.
 */
export async function getInventoryAction(filters?: { search?: string; category?: string }) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_VIEW);
    const items = await inventoryService.getItemsService(tenantId, filters);
    const stats = await inventoryService.getInventoryStatsService(tenantId);
    return { success: true, data: { items, stats } };
  } catch (error: any) {
    console.error('[getInventoryAction]', error);
    return { success: false, error: error.message };
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
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_MANAGE);
    await inventoryService.addStockService(tenantId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVENTORY_STOCK_ADDED',
      entityType: 'INVENTORY',
      entityId: data.itemId,
      metadata: { quantity: data.quantity, reason: data.reason }
    });

    revalidatePath('/inventory');
    return { success: true };
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
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_MANAGE);
    await inventoryService.deductStockService(tenantId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVENTORY_STOCK_DEDUCTED',
      entityType: 'INVENTORY',
      entityId: data.itemId,
      metadata: { quantity: data.quantity, reason: data.reason }
    });

    revalidatePath('/inventory');
    return { success: true };
  },
  { module: 'inventory', entityType: 'INVENTORY', entityIdPath: 'itemId' }
);

/**
 * Server Action: Fetches item history.
 */
export async function getItemHistoryAction(itemId: string) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_VIEW);
    const history = await inventoryService.getItemHistoryService(tenantId, itemId);
    return { success: true, data: history };
  } catch (error: any) {
    console.error('[getItemHistoryAction]', error);
    return { success: false, error: error.message };
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
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_MANAGE);
    await inventoryService.updateItemService(tenantId, id, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVENTORY_ITEM_UPDATED',
      entityType: 'INVENTORY',
      entityId: id,
      metadata: { ...data }
    });

    revalidatePath('/inventory');
    return { success: true };
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

/**
 * Server Action: Deletes an inventory item.
 */
export const deleteItemAction = wrapAction(
  'INVENTORY_ITEM_DELETE',
  async (id: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.INVENTORY_MANAGE);
    await inventoryService.deleteItemService(tenantId, id);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVENTORY_ITEM_DELETED',
      entityType: 'INVENTORY',
      entityId: id
    });

    revalidatePath('/inventory');
    return { success: true };
  },
  { module: 'inventory', entityType: 'INVENTORY' }
);

