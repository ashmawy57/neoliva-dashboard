import prisma from "@/lib/prisma";
import { Service, Prisma } from "@prisma/client";

export class ServiceRepository {
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.ServiceOrderByWithRelationInput;
  }): Promise<Service[]> {
    return prisma.service.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.ServiceCreateInput, 'tenant'>): Promise<Service> {
    return prisma.service.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Service> {
    return prisma.service.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
