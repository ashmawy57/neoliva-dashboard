import { InvoiceRepository } from "@/repositories/invoice.repository";
import { Invoice, Prisma } from "@prisma/client";

export class InvoiceService {
  private repository = new InvoiceRepository();

  async getInvoices(tenantId: string) {
    return this.repository.findAll(tenantId, {
      include: {
        patient: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createInvoice(tenantId: string, data: any) {
    const { patientId, ...rest } = data;
    
    return this.repository.create(tenantId, {
      ...rest,
      displayId: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: data.amount,
      status: (data.status as any) || 'PENDING',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      patient: { connect: { id: patientId } }
    });
  }

  async updateInvoice(tenantId: string, id: string, updates: any) {
    const { patientId, ...rest } = updates;
    
    return this.repository.update(tenantId, id, {
      ...rest,
      ...(updates.dueDate ? { dueDate: new Date(updates.dueDate) } : {}),
      ...(patientId ? { patient: { connect: { id: patientId } } } : {}),
      updatedAt: new Date()
    });
  }

  async deleteInvoice(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
