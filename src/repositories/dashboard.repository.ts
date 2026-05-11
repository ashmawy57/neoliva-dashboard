import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export class DashboardRepository {
  async getRecentPatients(tenantId: string) {
    return await prisma.appointment.findMany({
      where: {
        tenantId,
        date: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });
  }

  async getDailyRevenue(tenantId: string) {
    const today = new Date();
    const result = await prisma.invoice.aggregate({
      where: {
        tenantId,
        status: "PAID",
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    return result._sum.totalAmount;
  }

  async getTodayAppointments(tenantId: string) {
    const today = new Date();
    return await prisma.appointment.findMany({
      where: {
        tenantId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });
  }

  async getPendingPayments(tenantId: string) {
    const result = await prisma.invoice.aggregate({
      where: {
        tenantId,
        status: "PENDING",
      },
      _sum: {
        totalAmount: true,
      },
    });
    return result._sum.totalAmount;
  }

  async getInventoryItems(tenantId: string) {
    return await prisma.inventoryItem.findMany({
      where: { tenantId },
      include: {
        stockEntries: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
    });
  }

  async getRevenueVsExpenses(tenantId: string) {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));
    
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        status: "PAID",
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        tenantId,
        date: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    return { invoices, expenses };
  }

  async getWeeklyAppointments(tenantId: string) {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    return await prisma.appointment.findMany({
      where: {
        tenantId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        date: true,
      },
    });
  }
}
