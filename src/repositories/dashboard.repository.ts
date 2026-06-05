import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

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
    const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 12));
    
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        status: "PAID",
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        tenantId,
        date: { gte: twelveMonthsAgo },
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
    const now = new Date();

    // ── P1 FIX: Constrain to a rolling 12-month window. ─────────────────────
    // Previously this was an unbounded findMany that loaded every invoice ever
    // created for the tenant. The oldest record the service layer consumes is
    // the previous calendar month (for the month-over-month growth KPI), so
    // 12 months covers all callers with a 10× reduction in scan range for a
    // clinic with multi-year history.
    const twelveMonthsAgo = startOfMonth(subMonths(now, 12));

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          tenantId,
          createdAt: { gte: twelveMonthsAgo },
        },
        select: {
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      // Expenses are only used today for the daily cash-out KPI.
      prisma.expense.findMany({
        where: {
          tenantId,
          date: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
        select: {
          amount: true,
        },
      }),
    ]);

    return { invoices, expenses };
  }

  async getActivityFeed(tenantId: string) {
    // ── P3 FIX: Apply date boundaries before take:5. ────────────────────────
    // Without a createdAt/updatedAt filter Postgres must sort the entire
    // tenant partition before it can discard all rows beyond the first 5.
    // Bounding both sub-queries to the trailing 7 days means the planner
    // uses the (tenantId, createdAt) index range-scan — orders of magnitude
    // cheaper on high-volume tenants. Activity older than 7 days is not
    // meaningful for a "recent activity" feed.
    const sevenDaysAgo = subDays(new Date(), 7);

    const [appointments, payments] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          tenantId,
          createdAt: { gte: sevenDaysAgo },
        },
        include: { patient: true, doctor: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          tenantId,
          status: "PAID",
          updatedAt: { gte: sevenDaysAgo },
        },
        include: { patient: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

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
