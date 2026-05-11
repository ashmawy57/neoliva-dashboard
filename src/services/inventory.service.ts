import { InventoryRepository } from "@/repositories/inventory.repository";

const inventoryRepository = new InventoryRepository();

export class InventoryService {
  async createItemService(tenantId: string, data: {
    name: string;
    category: string;
    unit: string;
    minimumStock: number;
    initialStock?: number;
  }) {
    return await inventoryRepository.createItem(tenantId, data);
  }

  async getItemsService(tenantId: string, filters?: {
    search?: string;
    category?: string;
  }) {
    const items = await inventoryRepository.getItems(tenantId, filters);
    
    return items.map(item => {
      const currentStock = this.calculateCurrentStock(item.stockEntries);
      return {
        ...item,
        currentStock,
        status: currentStock <= item.minimumStock ? 'LOW' : 'OK',
        stockEntries: undefined // Strip from list for performance if needed, or keep
      };
    });
  }

  async addStockService(tenantId: string, data: {
    itemId: string;
    quantity: number;
    reason: string;
  }) {
    return await inventoryRepository.addStock(tenantId, data);
  }

  async deductStockService(tenantId: string, data: {
    itemId: string;
    quantity: number;
    reason: string;
  }) {
    // 1. Check availability
    const item = await inventoryRepository.findUnique(tenantId, data.itemId);
    if (!item) throw new Error("Item not found");

    const currentStock = this.calculateCurrentStock(item.stockEntries);
    if (data.quantity > currentStock) {
      throw new Error(`Insufficient stock. Available: ${currentStock} ${item.unit}`);
    }

    return await inventoryRepository.deductStock(tenantId, data);
  }

  async getInventoryStatsService(tenantId: string) {
    const items = await inventoryRepository.getItems(tenantId);
    
    let totalItems = items.length;
    let lowStockAlerts = 0;
    let lastAuditDate: Date | null = null;

    items.forEach(item => {
      const currentStock = this.calculateCurrentStock(item.stockEntries);
      if (currentStock <= item.minimumStock) {
        lowStockAlerts++;
      }

      // Track latest entry for last audit date
      item.stockEntries.forEach(entry => {
        if (!lastAuditDate || entry.createdAt > lastAuditDate) {
          lastAuditDate = entry.createdAt;
        }
      });
    });

    return {
      totalItems,
      lowStockAlerts,
      lastAuditDate: lastAuditDate ? lastAuditDate.toLocaleDateString() : '—'
    };
  }

  async getItemHistoryService(tenantId: string, itemId: string) {
    return await inventoryRepository.getStockEntries(tenantId, itemId);
  }

  async updateItemService(tenantId: string, id: string, data: {
    name?: string;
    category?: string;
    unit?: string;
    minimumStock?: number;
  }) {
    return await inventoryRepository.updateItem(tenantId, id, data);
  }

  async deleteItemService(tenantId: string, id: string) {
    // Optional: check if there are stock entries or handle cascade
    return await inventoryRepository.deleteItem(tenantId, id);
  }

  private calculateCurrentStock(entries: any[]): number {
    return entries.reduce((acc, entry) => {
      if (entry.type === 'IN') return acc + entry.quantity;
      if (entry.type === 'OUT') return acc - entry.quantity;
      return acc;
    }, 0);
  }
}
