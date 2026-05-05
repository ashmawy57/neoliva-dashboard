import { InventoryRepository } from "@/repositories/inventory.repository";
import { Inventory, Prisma } from "@prisma/client";

export class InventoryService {
  private repository = new InventoryRepository();

  async getInventory(tenantId: string) {
    return this.repository.findAll(tenantId, {
      orderBy: { name: 'asc' }
    });
  }

  async createInventoryItem(tenantId: string, data: any) {
    return this.repository.create(tenantId, {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      minLevel: data.minLevel,
      unit: data.unit,
      displayId: `INV-${Math.floor(1000 + Math.random() * 9000)}`
    });
  }

  async updateInventoryItem(tenantId: string, id: string, data: any) {
    return this.repository.update(tenantId, id, {
      ...data,
      updatedAt: new Date()
    });
  }

  async deleteInventoryItem(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
