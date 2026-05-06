import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class InventoryRepository {
  /**
   * Fetch all inventory items for a tenant
   */
  async findMany(tenantId: string) {
    return await prisma.inventory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Find a specific item
   */
  async findUnique(id: string, tenantId: string) {
    return await prisma.inventory.findUnique({
      where: { id, tenantId }
    });
  }

  /**
   * Create new inventory item
   */
  async create(data: Prisma.InventoryUncheckedCreateInput) {
    return await prisma.inventory.create({
      data
    });
  }

  /**
   * Update item details or quantity
   */
  async update(id: string, tenantId: string, data: Prisma.InventoryUncheckedUpdateInput) {
    return await prisma.inventory.update({
      where: { id, tenantId },
      data
    });
  }

  /**
   * Delete item
   */
  async delete(id: string, tenantId: string) {
    return await prisma.inventory.delete({
      where: { id, tenantId }
    });
  }

  /**
   * Get usages for a service
   */
  async getServiceUsages(serviceId: string, tenantId: string) {
    return await prisma.serviceInventoryUsage.findMany({
      where: { serviceId, tenantId },
      include: {
        inventory: true
      }
    });
  }
}
