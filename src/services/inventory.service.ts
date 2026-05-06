import { InventoryRepository } from "@/repositories/inventory.repository";
import { resolveTenantContext } from "@/lib/tenant-context";

const inventoryRepository = new InventoryRepository();

export class InventoryService {
  /**
   * Get formatted inventory list with status alerts
   */
  async getInventoryList() {
    const tenantId = await resolveTenantContext();
    const items = await inventoryRepository.findMany(tenantId);

    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minLevel: item.minLevel,
      unit: item.unit || 'pcs',
      status: (item.quantity <= item.minLevel ? 'Low' : 'OK') as 'Low' | 'OK',
      location: item.location,
      lastUpdated: item.updatedAt
    }));
  }

  /**
   * Get items that are below or at minimum stock level
   */
  async getLowStockItems() {
    const tenantId = await resolveTenantContext();
    const items = await inventoryRepository.findMany(tenantId);
    return items.filter(item => item.quantity <= item.minLevel);
  }

  /**
   * Adjust stock manually (restock or manual correction)
   */
  async adjustStock(id: string, adjustment: number) {
    const tenantId = await resolveTenantContext();
    const item = await inventoryRepository.findUnique(id, tenantId);
    
    if (!item) throw new Error("Item not found");
    
    const newQuantity = Math.max(0, item.quantity + adjustment);
    
    return await inventoryRepository.update(id, tenantId, {
      quantity: newQuantity
    });
  }

  /**
   * Deduct items based on service usage
   */
  async consumeItemsFromService(serviceId: string) {
    const tenantId = await resolveTenantContext();
    const usages = await inventoryRepository.getServiceUsages(serviceId, tenantId);

    if (usages.length === 0) return;

    // Perform deduction for each item used in this service
    for (const usage of usages) {
      const currentItem = usage.inventory;
      const newQuantity = Math.max(0, currentItem.quantity - usage.quantity);
      
      await inventoryRepository.update(currentItem.id, tenantId, {
        quantity: newQuantity
      });
      
      // Potential to log usage history here if needed
    }
  }

  /**
   * Add new item to inventory
   */
  async addItem(data: {
    name: string;
    category: string;
    quantity: number;
    minLevel: number;
    unit?: string;
    location?: string;
  }) {
    const tenantId = await resolveTenantContext();
    return await inventoryRepository.create({
      ...data,
      tenantId
    });
  }

  /**
   * Delete item
   */
  async deleteItem(id: string) {
    const tenantId = await resolveTenantContext();
    return await inventoryRepository.delete(id, tenantId);
  }
}
