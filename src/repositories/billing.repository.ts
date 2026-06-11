import { prisma } from "@/lib/prisma";
import { Prisma, InvoiceStatus, PaymentMethod } from "@/generated/client";

export class BillingRepository {
  /**
   * Fetch all invoices for a tenant with patient details
   */
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    where?: Prisma.InvoiceWhereInput;
    include?: Prisma.InvoiceInclude;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput;
  }) {
    return await prisma.invoice.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId,
      },
      select: {
        id: true,
        displayId: true,
        patientId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
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
   * Get financial statistics for a tenant
   */
  async getFinancialStats(tenantId: string) {
    const now = new Date();

    const [general, overdue] = await Promise.all([
      prisma.invoice.aggregate({
        where: { tenantId },
        _sum: {
          totalAmount: true,
          paidAmount: true
        }
      }),
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { not: 'PAID' },
          dueDate: { lt: now }
        },
        _sum: {
          totalAmount: true,
          paidAmount: true
        },
        _count: {
          id: true
        }
      })
    ]);

    const totalRevenue = Number(general._sum.paidAmount || 0);
    const totalInvoiced = Number(general._sum.totalAmount || 0);
    const pendingAmount = totalInvoiced - totalRevenue;

    const overdueTotal = Number(overdue._sum.totalAmount || 0);
    const overduePaid = Number(overdue._sum.paidAmount || 0);
    const overdueAmount = overdueTotal - overduePaid;
    const overdueCount = overdue._count.id || 0;

    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      overdueCount
    };
  }

  async findUnique(tenantId: string, id: string) {
    if (!id) {
      throw new Error("BillingRepository.findUnique: id is required");
    }
    return await prisma.invoice.findUnique({
      where: { id, tenantId },
      select: {
        id: true,
        displayId: true,
        patientId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
        createdAt: true,
        patient: true,
        items: true,
        payments: true
      }
    });
  }

  async findByAppointmentId(tenantId: string, appointmentId: string) {
    return await prisma.invoice.findFirst({
      where: { appointmentId, tenantId },
      select: {
        id: true,
        displayId: true,
        patientId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        items: true,
        payments: true
      }
    });
  }

  /**
   * Creates an invoice with items atomically
   */
  async create(tenantId: string, data: Omit<Prisma.InvoiceUncheckedCreateInput, 'tenantId' | 'totalAmount'> & { totalAmount?: number | any }, tx?: Prisma.TransactionClient) {
    // Calculate total amount if items are provided in the create-input style
    let totalAmount = 0;
    if (data.items && typeof data.items === 'object' && 'create' in data.items) {
      const items = (data.items as any).create;
      if (Array.isArray(items)) {
        totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1)), 0);
      }
    }

    const client = tx || prisma;
    return await client.invoice.create({
      data: {
        ...data,
        totalAmount: data.totalAmount || totalAmount,
        tenantId
      },
      select: {
        id: true,
        displayId: true,
        items: true,
        patient: true
      }
    });
  }

  /**
   * Generic update for invoices with tenant isolation
   */
  async update(tenantId: string, id: string, data: Prisma.InvoiceUpdateInput) {
    return await prisma.invoice.update({
      where: { id, tenantId },
      data
    });
  }

  /**
   * Records a payment and updates invoice status atomically
   */
  async recordPayment(tenantId: string, invoiceId: string, data: {
    amount: number;
    method: PaymentMethod;
    notes?: string;
    paidAt?: Date;
  }, tx?: Prisma.TransactionClient) {
    const execute = async (client: Prisma.TransactionClient) => {
      // 1. Fetch invoice with strict tenant isolation
      const invoice = await client.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          status: true,
          patientId: true
        }
      });

      if (!invoice) {
        throw new Error("Invoice not found or unauthorized access.");
      }

      if (invoice.status === "PAID") {
        throw new Error("This invoice is already fully paid.");
      }

      const totalAmount = Number(invoice.totalAmount);
      const currentPaid = Number(invoice.paidAmount);
      const remainingBalance = totalAmount - currentPaid;

      // 2. Validate payment amount
      if (data.amount > (remainingBalance + 0.01)) {
        throw new Error(`Payment amount exceeds the remaining balance ($${remainingBalance.toFixed(2)}).`);
      }

      // 3. Create the Payment record
      const payment = await client.payment.create({
        data: {
          invoiceId,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
          paidAt: data.paidAt || new Date(),
          tenantId
        }
      });

      // 4. Calculate new state
      const newPaidAmount = currentPaid + Number(data.amount);
      let newStatus: InvoiceStatus = 'PENDING';
      
      if (newPaidAmount >= totalAmount - 0.01) {
        newStatus = 'PAID';
      }

      // 5. Update the Invoice record
      await client.invoice.update({
        where: { id: invoiceId, tenantId },
        data: { 
          paidAmount: newPaidAmount,
          status: newStatus,
          updatedAt: new Date()
        }
      });

      return payment;
    };

    if (tx) {
      return execute(tx);
    } else {
      return prisma.$transaction(execute);
    }
  }

  async delete(tenantId: string, id: string) {
    return await prisma.invoice.delete({
      where: { id, tenantId }
    });
  }
}
