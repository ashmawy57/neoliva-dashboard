import { ExpenseRepository } from "@/repositories/expense.repository";
import { Expense, Prisma } from "@/generated/client";

export class ExpenseService {
  private repository = new ExpenseRepository();

  async getExpenses(tenantId: string) {
    return this.repository.findMany(tenantId, {
      orderBy: { createdAt: 'desc' }
    });
  }

  async createExpense(tenantId: string, data: any) {
    return this.repository.create(tenantId, {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      amount: data.amount,
      status: (data.status as any) || 'PAID'
    });
  }

  async updateExpense(tenantId: string, id: string, updates: any) {
    return this.repository.update(tenantId, id, {
      ...updates,
      ...(updates.date ? { date: new Date(updates.date) } : {}),
      updatedAt: new Date()
    });
  }

  async deleteExpense(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
