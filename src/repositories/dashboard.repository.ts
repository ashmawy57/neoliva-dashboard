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
        status: true,
      },
    });
  }

  async getYesterdayRevenue(tenantId: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = await prisma.invoice.aggregate({
      where: {
        tenantId,
        status: "PAID",
        createdAt: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    return result._sum.totalAmount;
  }

  async getDoctorPerformance(tenantId: string) {
    const start = startOfMonth(new Date());
    return await prisma.staff.findMany({
      where: {
        tenantId,
        role: "DOCTOR",
      },
      select: {
        name: true,
        id: true,
        appointments: {
          where: {
            date: { gte: start },
          },
          select: {
            status: true,
            invoice: {
              select: {
                totalAmount: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async getFinancialStats(tenantId: string) {
    const today = new Date();
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      select: {
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        tenantId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      select: {
        amount: true,
      },
    });

    return { invoices, expenses };
  }

  async getActivityFeed(tenantId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      include: { patient: true, doctor: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const payments = await prisma.invoice.findMany({
      where: { tenantId, status: "PAID" },
      include: { patient: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    return { appointments, payments };
  }

  async getPatientQueue(tenantId: string) {
    return await prisma.appointment.findMany({
      where: {
        tenantId,
        date: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
        status: { in: ["WAITING", "IN_PROGRESS", "SCHEDULED"] },
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}
