import { ExpenseRepository } from "@/repositories/expense.repository";
import { Expense, Prisma } from "@/generated/client";

export class ExpenseService {
  private repository = new ExpenseRepository();

  async getExpenses(tenantId: string, filters?: { search?: string, category?: string, status?: string }) {
    const where: Prisma.ExpenseWhereInput = {};
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status as any;
    }

    const expenses = await this.repository.findMany(tenantId, {
      where,
      orderBy: { date: 'desc' }
    });

    return expenses.map(e => this.mapToUI(e));
  }

  async getExpenseStats(tenantId: string) {
    const stats = await this.repository.getExpensesStats(tenantId);
    return {
      ...stats,
      totalThisMonthFormatted: this.formatCurrency(stats.totalThisMonth),
      pendingAmountFormatted: this.formatCurrency(stats.pendingAmount),
    };
  }

  async createExpense(tenantId: string, data: any) {
    if (!data.title || !data.amount || !data.category || !data.date) {
      throw new Error("Missing required fields");
    }

    return this.repository.create(tenantId, {
      title: data.title,
      amount: new Prisma.Decimal(data.amount),
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      status: data.status?.toUpperCase() || 'PAID',
      notes: data.notes
    });
  }

  async changeExpenseStatus(tenantId: string, id: string, status: string) {
    return this.repository.update(tenantId, id, {
      status: status.toUpperCase() as any
    });
  }

  async updateExpense(tenantId: string, id: string, updates: any) {
    return this.repository.update(tenantId, id, {
      ...updates,
      ...(updates.date ? { date: new Date(updates.date) } : {}),
      ...(updates.amount ? { amount: new Prisma.Decimal(updates.amount) } : {}),
      updatedAt: new Date()
    });
  }

  async deleteExpense(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }

  private mapToUI(expense: Expense) {
    return {
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      amountFormatted: this.formatCurrency(expense.amount),
      category: expense.category,
      description: expense.description,
      date: expense.date,
      dateFormatted: new Date(expense.date).toLocaleDateString(),
      status: expense.status,
      notes: expense.notes
    };
  }

  private formatCurrency(amount: any) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  }
}
