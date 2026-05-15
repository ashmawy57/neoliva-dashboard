'use server'

import { revalidatePath } from 'next/cache'
import { ExpenseService } from "@/services/expense.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";

const expenseService = new ExpenseService();

/**
 * Server Action: Fetches all expenses.
 */
export async function getExpenses(filters?: { search?: string, category?: string, status?: string }) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_VIEW);
    return await expenseService.getExpenses(tenantId, filters);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

/**
 * Server Action: Fetches expense statistics.
 */
export async function getExpenseStats() {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_VIEW);
    return await expenseService.getExpenseStats(tenantId);
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return null;
  }
}

/**
 * Server Action: Creates a new expense.
 */
export const createExpense = wrapAction(
  'EXPENSE_CREATE',
  async (data: { 
    title: string; 
    amount: number; 
    date: string; 
    category: string; 
    description?: string;
    notes?: string; 
    status?: string 
  }) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_EXPENSE_MANAGE);
    const result = await expenseService.createExpense(tenantId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'EXPENSE_CREATED',
      entityType: 'EXPENSE',
      entityId: result.id,
      metadata: { title: data.title, amount: data.amount, category: data.category }
    });

    revalidatePath('/expenses');
    return result;
  },
  { module: 'billing', entityType: 'EXPENSE' }
);

/**
 * Server Action: Updates an existing expense.
 */
export const updateExpense = wrapAction(
  'EXPENSE_UPDATE',
  async (id: string, updates: Partial<{ 
    title: string;
    description: string; 
    amount: number; 
    date: string; 
    category: string; 
    status: string; 
    notes: string 
  }>) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_EXPENSE_MANAGE);
    const result = await expenseService.updateExpense(tenantId, id, updates);

    await EventService.trackEvent({
      tenantId,
      eventType: 'EXPENSE_UPDATED',
      entityType: 'EXPENSE',
      entityId: id,
      metadata: { ...updates }
    });

    revalidatePath('/expenses');
    return result;
  },
  { module: 'billing', entityType: 'EXPENSE' }
);

/**
 * Server Action: Deletes an expense.
 */
export const deleteExpense = wrapAction(
  'EXPENSE_DELETE',
  async (id: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_EXPENSE_MANAGE);
    await expenseService.deleteExpense(tenantId, id);

    await EventService.trackEvent({
      tenantId,
      eventType: 'EXPENSE_DELETED',
      entityType: 'EXPENSE',
      entityId: id
    });

    revalidatePath('/expenses');
    return { success: true };
  },
  { module: 'billing', entityType: 'EXPENSE' }
);


