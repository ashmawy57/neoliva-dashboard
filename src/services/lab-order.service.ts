import { LabOrderRepository } from "@/repositories/lab-order.repository";
import { LabOrder, Prisma } from "@prisma/client";

export class LabOrderService {
  private repository = new LabOrderRepository();

  async getLabOrders(tenantId: string) {
    return this.repository.findAll(tenantId, {
      include: {
        patient: { select: { name: true } }
      }
    });
  }

  async createLabOrder(tenantId: string, data: any) {
    const { patientId, ...rest } = data;
    
    return this.repository.create(tenantId, {
      ...rest,
      displayId: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      sendDate: data.sendDate ? new Date(data.sendDate) : new Date(),
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
      cost: data.cost || 0,
      status: (data.status as any) || 'SENT',
      patient: { connect: { id: patientId } }
    });
  }

  async updateLabOrder(tenantId: string, id: string, updates: any) {
    const { patientId, ...rest } = updates;
    
    return this.repository.update(tenantId, id, {
      ...rest,
      ...(updates.sendDate ? { sendDate: new Date(updates.sendDate) } : {}),
      ...(updates.expectedReturnDate ? { expectedReturnDate: new Date(updates.expectedReturnDate) } : {}),
      ...(patientId ? { patient: { connect: { id: patientId } } } : {}),
      updatedAt: new Date()
    });
  }

  async deleteLabOrder(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
