import { prisma } from "@/lib/prisma";
import { cache } from "react";

export class ReportsRepository {
  getInvoices = cache(async (tenantId: string, fromDate?: Date) => {
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
  });

  getExpenses = cache(async (tenantId: string, fromDate?: Date) => {
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
  });

  getAppointments = cache(async (tenantId: string) => {
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
  });

  getPatients = cache(async (tenantId: string, fromDate?: Date) => {
    return await prisma.patient.findMany({
      where: {
        tenantId,
        ...(fromDate && { createdAt: { gte: fromDate } }),
      },
      select: {
        createdAt: true,
      },
    });
  });

  getInventory = cache(async (tenantId: string) => {
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
  });
}
