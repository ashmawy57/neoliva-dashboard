import prisma from "@/lib/prisma";
import { Staff, Prisma } from "@prisma/client";

export class StaffRepository {
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.StaffOrderByWithRelationInput;
  }): Promise<Staff[]> {
    return prisma.staff.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Staff | null> {
    return prisma.staff.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.StaffCreateInput, 'tenant'>): Promise<Staff> {
    return prisma.staff.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return prisma.staff.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Staff> {
    return prisma.staff.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
