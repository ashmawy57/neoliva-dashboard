import { prisma } from "@/lib/prisma";
import { Prisma, StockType } from "@/generated/client";

export class InventoryRepository {
  async createItem(tenantId: string, data: Omit<Prisma.InventoryItemUncheckedCreateInput, 'tenantId'> & { initialStock?: number }) {
    return await prisma.$transaction(async (tx) => {
      const { initialStock, ...itemData } = data;
      
      const item = await tx.inventoryItem.create({
        data: {
          ...itemData,
          tenantId,
        },
      });

      if (initialStock && initialStock > 0) {
        await tx.stockEntry.create({
          data: {
            itemId: item.id,
            type: 'IN',
            quantity: initialStock,
            reason: 'Initial Stock',
            tenantId,
          },
        });
      }

      return item;
    });
  }

  async getItems(tenantId: string, filters?: {
    search?: string;
    category?: string;
  }) {
    const where: Prisma.InventoryItemWhereInput = {
      tenantId,
      ...(filters?.category && filters.category !== 'all' ? { category: filters.category } : {}),
      ...(filters?.search ? {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { category: { contains: filters.search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    return await prisma.inventoryItem.findMany({
      where,
      include: {
        stockEntries: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async addStock(tenantId: string, data: {
    itemId: string;
    quantity: number;
    reason: string;
    referenceId?: string;
  }) {
    // Ownership check
    const item = await this.findUnique(tenantId, data.itemId);
    if (!item) throw new Error("Item not found or unauthorized");

    return await prisma.stockEntry.create({
      data: {
        itemId: data.itemId,
        type: 'IN',
        quantity: data.quantity,
        reason: data.reason,
        referenceId: data.referenceId,
        tenantId,
      },
    });
  }

  async deductStock(tenantId: string, data: {
    itemId: string;
    quantity: number;
    reason: string;
    referenceId?: string;
  }) {
    // Ownership check
    const item = await this.findUnique(tenantId, data.itemId);
    if (!item) throw new Error("Item not found or unauthorized");

    return await prisma.stockEntry.create({
      data: {
        itemId: data.itemId,
        type: 'OUT',
        quantity: data.quantity,
        reason: data.reason,
        referenceId: data.referenceId,
        tenantId,
      },
    });
  }

  async getStockEntries(tenantId: string, itemId: string) {
    return await prisma.stockEntry.findMany({
      where: {
        itemId,
        tenantId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async findUnique(tenantId: string, id: string) {
    return await prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: { stockEntries: true }
    });
  }

  async updateItem(tenantId: string, id: string, data: Prisma.InventoryItemUpdateInput) {
    return await prisma.inventoryItem.update({
      where: { id, tenantId },
      data,
    });
  }

  async deleteItem(tenantId: string, id: string) {
    return await prisma.inventoryItem.delete({
      where: { id, tenantId },
    });
  }
}
