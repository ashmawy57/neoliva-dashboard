import prisma from "@/lib/prisma";
import { TreatmentPlan, TreatmentPlanItem, Prisma } from "@prisma/client";

export class TreatmentPlanRepository {
  async findAll(tenantId: string, params?: {
    where?: Prisma.TreatmentPlanWhereInput;
    include?: Prisma.TreatmentPlanInclude;
    orderBy?: Prisma.TreatmentPlanOrderByWithRelationInput;
  }): Promise<TreatmentPlan[]> {
    return prisma.treatmentPlan.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string, include?: Prisma.TreatmentPlanInclude): Promise<TreatmentPlan | null> {
    return prisma.treatmentPlan.findFirst({
      where: {
        id,
        tenantId,
      },
      include
    });
  }

  async create(tenantId: string, data: Omit<Prisma.TreatmentPlanCreateInput, 'tenant'>): Promise<TreatmentPlan> {
    return prisma.treatmentPlan.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.TreatmentPlanUpdateInput): Promise<TreatmentPlan> {
    return prisma.treatmentPlan.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<TreatmentPlan> {
    return prisma.treatmentPlan.delete({
      where: {
        id,
        tenantId,
      },
    });
  }

  // TreatmentPlanItem operations
  async createItem(tenantId: string, data: Omit<Prisma.TreatmentPlanItemCreateInput, 'tenant'>): Promise<TreatmentPlanItem> {
    return prisma.treatmentPlanItem.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async updateItem(tenantId: string, id: string, data: Prisma.TreatmentPlanItemUpdateInput): Promise<TreatmentPlanItem> {
    return prisma.treatmentPlanItem.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async deleteItem(tenantId: string, id: string): Promise<TreatmentPlanItem> {
    return prisma.treatmentPlanItem.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
