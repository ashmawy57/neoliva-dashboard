'use server'

import { revalidatePath } from 'next/cache'
import { ExpenseService } from "@/services/expense.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const expenseService = new ExpenseService();

export async function getExpenses(filters?: { search?: string, category?: string, status?: string }) {
  try {
    const tenantId = await resolveTenantContext();
    return await expenseService.getExpenses(tenantId, filters);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function getExpenseStats() {
  try {
    const tenantId = await resolveTenantContext();
    return await expenseService.getExpenseStats(tenantId);
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return null;
  }
}

export async function createExpense(data: { 
  title: string; 
  amount: number; 
  date: string; 
  category: string; 
  description?: string;
  notes?: string; 
  status?: string 
}) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await expenseService.createExpense(tenantId, data);

    revalidatePath('/expenses');
    return result;
  } catch (error: any) {
    console.error('Error creating expense:', error);
    throw new Error('Failed to create expense');
  }
}

export async function updateExpense(id: string, updates: Partial<{ 
  title: string;
  description: string; 
  amount: number; 
  date: string; 
  category: string; 
  status: string; 
  notes: string 
}>) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await expenseService.updateExpense(tenantId, id, updates);

    revalidatePath('/expenses');
    return result;
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

