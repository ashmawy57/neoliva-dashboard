import { prisma } from "@/lib/prisma";
import { LabOrder, LabOrderStatus, Prisma } from "@/generated/client";

export class LabOrderRepository {
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    select?: Prisma.LabOrderSelect;
    orderBy?: Prisma.LabOrderOrderByWithRelationInput;
    where?: Prisma.LabOrderWhereInput;
  }): Promise<any[]> {
    return prisma.labOrder.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId,
      },
      select: params?.select || {
        id: true,
        displayId: true,
        labName: true,
        itemType: true,
        toothNumber: true,
        status: true,
        cost: true,
        dueDate: true,
        patient: {
          select: {
            name: true,
            displayId: true
          }
        },
      }
    });
  }

  async findById(tenantId: string, id: string): Promise<any | null> {
    return prisma.labOrder.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        patient: true,
        appointment: true
      }
    });
  }

  async create(tenantId: string, data: any): Promise<LabOrder> {
    return prisma.labOrder.create({
      data: {
        displayId: data.displayId,
        labName: data.labName,
        itemType: data.itemType,
        toothNumber: data.toothNumber,
        cost: data.cost,
        dueDate: data.dueDate,
        notes: data.notes,
        status: data.status || 'PENDING',

        patient: data.patient || {
          connect: { id: data.patientId }
        },

        tenant: {
          connect: { id: tenantId }
        },

        ...(data.appointment && {
          appointment: data.appointment
        })
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

  async updateStatus(tenantId: string, id: string, status: LabOrderStatus): Promise<LabOrder> {
    const updateData: any = { status };
    
    if (status === 'SENT') {
      updateData.sentAt = new Date();
    } else if (status === 'RECEIVED') {
      updateData.receivedAt = new Date();
    }

    return prisma.labOrder.update({
      where: {
        id,
        tenantId,
      },
      data: updateData,
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

  async getStats(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + 7);

    const orders = await prisma.labOrder.findMany({
      where: { tenantId },
      select: {
        status: true,
        cost: true,
        dueDate: true,
        createdAt: true
      }
    });

    return {
      activeCases: orders.filter(o => ['SENT', 'IN_PROGRESS'].includes(o.status)).length,
      dueThisWeek: orders.filter(o => o.dueDate && o.dueDate >= now && o.dueDate <= endOfWeek).length,
      received: orders.filter(o => o.status === 'RECEIVED').length,
      monthlyCost: orders
        .filter(o => o.createdAt && o.createdAt >= startOfMonth)
        .reduce((sum, o) => sum + Number(o.cost || 0), 0)
    };
  }
}
