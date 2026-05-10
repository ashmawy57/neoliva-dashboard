import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class BillingRepository {
  /**
   * Fetch all invoices for a tenant with patient details
   */
  async findMany(tenantId: string) {
    return await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get total revenue and other financial aggregates
   */
  async getFinancialStats(tenantId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      select: {
        amount: true,
        paidAmount: true,
        status: true,
        dueDate: true
      }
    });

    const now = new Date();

    return {
      totalRevenue: invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0),
      pendingAmount: invoices.reduce((sum, i) => sum + (Number(i.amount) - Number(i.paidAmount)), 0),
      overdueAmount: invoices
        .filter(i => i.status !== 'PAID' && i.dueDate && new Date(i.dueDate) < now)
        .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paidAmount)), 0)
    };
  }

  async findUniqueByAppointmentId(appointmentId: string, tenantId: string) {
    return await prisma.invoice.findUnique({
      where: { appointmentId, tenantId }
    });
  }

  async findUnique(id: string, tenantId: string) {
    return await prisma.invoice.findUnique({
      where: { id, tenantId },
      include: {
        patient: true
      }
    });
  }

  async create(data: Prisma.InvoiceUncheckedCreateInput) {
    return await prisma.invoice.create({
      data
    });
  }

  async update(id: string, tenantId: string, data: Prisma.InvoiceUncheckedUpdateInput) {
    return await prisma.invoice.update({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return await prisma.invoice.delete({
      where: { id, tenantId }
    });
  }
}
