import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";

export class FinanceRepository {
  async getRevenueData(tenantId: string, fromDate: Date) {
    return prisma.payment.findMany({
      where: {
        tenantId,
        paidAt: { gte: fromDate },
      },
      select: {
        amount: true,
        paidAt: true,
      },
      orderBy: { paidAt: "asc" },
    });
  }

  async getExpenseData(tenantId: string, fromDate: Date) {
    return prisma.expense.findMany({
      where: {
        tenantId,
        date: { gte: fromDate },
        status: "PAID",
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });
  }

  async getInvoiceSummary(tenantId: string) {
    return prisma.invoice.groupBy({
      by: ["status"],
      where: { tenantId },
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getPaymentsSummary(tenantId: string) {
    return prisma.payment.aggregate({
      where: { tenantId },
      _sum: {
        amount: true,
      },
    });
  }

  async getRecentFinancialActivity(tenantId: string, limit: number = 20) {
    // Combine Invoices, Payments, and Expenses (Conceptual, but we'll fetch separately and service will sort)
    // Actually, for Repository, let's just fetch them
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        displayId: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        patient: { select: { name: true } },
      },
    });

    const payments = await prisma.payment.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        amount: true,
        method: true,
        paidAt: true,
        patient: { select: { name: true } },
      },
    });

    const expenses = await prisma.expense.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        amount: true,
        category: true,
        date: true,
      },
    });

    return { invoices, payments, expenses };
  }

  async getTopServices(tenantId: string, limit: number = 5) {
    return prisma.invoiceItem.groupBy({
      by: ["description"],
      where: { tenantId },
      _sum: {
        price: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          price: "desc",
        },
      },
      take: limit,
    });
  }

  async getRevenueByDoctor(tenantId: string) {
    // This is a bit complex because Invoices are linked to Appointments which have Doctors
    // We'll fetch Invoices with their Appointment's Doctor
    return prisma.invoice.findMany({
      where: {
        tenantId,
        status: "PAID",
      },
      select: {
        totalAmount: true,
        appointment: {
          select: {
            doctor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
