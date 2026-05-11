import { prisma } from "@/lib/prisma";

export class ReportsRepository {
  async getInvoices(tenantId: string, fromDate?: Date) {
    return await prisma.invoice.findMany({
      where: {
        tenantId,
        status: "PAID",
        ...(fromDate && { createdAt: { gte: fromDate } }),
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async getExpenses(tenantId: string, fromDate?: Date) {
    return await prisma.expense.findMany({
      where: {
        tenantId,
        ...(fromDate && { date: { gte: fromDate } }),
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async getAppointments(tenantId: string) {
    return await prisma.appointment.findMany({
      where: {
        tenantId,
      },
      select: {
        status: true,
        treatment: true,
        date: true,
      },
    });
  }

  async getPatients(tenantId: string, fromDate?: Date) {
    return await prisma.patient.findMany({
      where: {
        tenantId,
        ...(fromDate && { createdAt: { gte: fromDate } }),
      },
      select: {
        createdAt: true,
      },
    });
  }

  async getInventory(tenantId: string) {
    return await prisma.inventoryItem.findMany({
      where: {
        tenantId,
      },
      select: {
        id: true,
        name: true,
        minimumStock: true,
        category: true,
        unit: true,
        stockEntries: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
    });
  }
}
