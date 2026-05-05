import prisma from "@/lib/prisma";
import { Inventory, Prisma } from "@prisma/client";

export class InventoryRepository {
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.InventoryOrderByWithRelationInput;
  }): Promise<Inventory[]> {
    return prisma.inventory.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Inventory | null> {
    return prisma.inventory.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.InventoryCreateInput, 'tenant'>): Promise<Inventory> {
    return prisma.inventory.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return prisma.inventory.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Inventory> {
    return prisma.inventory.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
