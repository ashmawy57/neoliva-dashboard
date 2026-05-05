import prisma from "@/lib/prisma";
import { Expense, Prisma } from "@prisma/client";

export class ExpenseRepository {
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput;
  }): Promise<Expense[]> {
    return prisma.expense.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.ExpenseCreateInput, 'tenant'>): Promise<Expense> {
    return prisma.expense.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return prisma.expense.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Expense> {
    return prisma.expense.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
