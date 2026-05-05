'use server'

import { revalidatePath } from 'next/cache'
import { ExpenseService } from "@/services/expense.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const expenseService = new ExpenseService();

export async function getExpenses() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await expenseService.getExpenses(tenantId);

    return data.map((expense) => ({
      id: expense.id,
      date: new Date(expense.date || expense.createdAt).toLocaleDateString(),
      category: expense.category || 'General',
      description: expense.description || 'No description',
      amount: Number(expense.amount) || 0,
      status: expense.status || 'Paid',
      notes: expense.notes
    }))
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function createExpense(formData: { description: string; amount: number; date: string; category: string; notes?: string; status?: string }) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await expenseService.createExpense(tenantId, formData);

    revalidatePath('/expenses');
    return data;
  } catch (error: any) {
    console.error('Error creating expense:', error);
    throw new Error('Failed to create expense');
  }
}

export async function updateExpense(id: string, updates: Partial<{ description: string; amount: number; date: string; category: string; status: string; notes: string }>) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await expenseService.updateExpense(tenantId, id, updates);

    revalidatePath('/expenses');
    return data;
  } catch (error: any) {
    console.error('Error updating expense:', error);
    throw new Error('Failed to update expense');
  }
}

export async function deleteExpense(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await expenseService.deleteExpense(tenantId, id);

    revalidatePath('/expenses');
    return true;
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    throw new Error('Failed to delete expense');
  }
}

