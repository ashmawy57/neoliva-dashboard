import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class BillingRepository {
  /**
   * Fetch all invoices for a tenant with patient details
   */
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    include?: Prisma.InvoiceInclude;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput;
  }) {
    return await prisma.invoice.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId,
      },
      include: params?.include || {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: params?.orderBy || { createdAt: 'desc' }
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
        .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paidAmount)), 0),
      overdueCount: invoices.filter(i => i.status !== 'PAID' && i.dueDate && new Date(i.dueDate) < now).length
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
        patient: true,
        items: true,
        payments: true
      }
    });
  }

  async create(tenantId: string, data: Omit<Prisma.InvoiceCreateInput, 'tenant'>) {
    return await prisma.invoice.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } }
      }
    });
  }

  async update(tenantId: string, id: string, data: Prisma.InvoiceUpdateInput) {
    return await prisma.invoice.update({
      where: { id, tenantId },
      data
    });
  }

  async delete(tenantId: string, id: string) {
    return await prisma.invoice.delete({
      where: { id, tenantId }
    });
  }

  /**
   * Records a payment and updates invoice status atomically
   */
  async recordPayment(tenantId: string, invoiceId: string, data: {
    amount: number;
    method: string;
    notes?: string;
    date?: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch invoice with strict tenant isolation
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        select: {
          id: true,
          amount: true,
          paidAmount: true,
          status: true
        }
      });

      if (!invoice) {
        throw new Error("Invoice not found or unauthorized access.");
      }

      if (invoice.status === "PAID") {
        throw new Error("This invoice is already fully paid.");
      }

      const totalAmount = Number(invoice.amount);
      const currentPaid = Number(invoice.paidAmount);
      const remainingBalance = totalAmount - currentPaid;

      // 2. Validate payment amount
      if (data.amount > (remainingBalance + 0.001)) {
        throw new Error(`Payment amount exceeds the remaining balance ($${remainingBalance.toFixed(2)}).`);
      }

      // 3. Create the Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
          date: data.date || new Date(),
          tenantId
        }
      });

      // 4. Calculate new state
      const newPaidAmount = currentPaid + Number(data.amount);
      let newStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      
      if (newPaidAmount >= totalAmount - 0.001) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL';
      }

      // 5. Update the Invoice record
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          paidAmount: newPaidAmount,
          status: newStatus,
          updatedAt: new Date()
        }
      });

      return payment;
    });
  }
}
