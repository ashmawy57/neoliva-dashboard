import { prisma } from "@/lib/prisma";
import { LabOrder, Prisma } from "@prisma/client";

export class LabOrderRepository {
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    include?: Prisma.LabOrderInclude;
    orderBy?: Prisma.LabOrderOrderByWithRelationInput;
  }): Promise<LabOrder[]> {
    return prisma.labOrder.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<LabOrder | null> {
    return prisma.labOrder.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.LabOrderCreateInput, 'tenant'>): Promise<LabOrder> {
    return prisma.labOrder.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.LabOrderUpdateInput): Promise<LabOrder> {
    return prisma.labOrder.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<LabOrder> {
    return prisma.labOrder.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
