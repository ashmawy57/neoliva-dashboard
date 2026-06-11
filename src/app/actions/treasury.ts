'use server'

import { withPermission } from "@/lib/rbac/guard";


import { TreasuryService } from "@/services/treasury.service";



import { revalidatePath } from "next/cache";

const treasuryService = new TreasuryService();

async function getTenant() {
  return withPermission('billing', 'read', async (session) => {
    return session.tenantId;
  });
}

export async function getTrialBalanceAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getTrialBalance(tenantId);
    return { success: true, error: undefined, data };
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message || "Failed to fetch trial balance" };
  }
}

export async function getProfitAndLossAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getProfitAndLoss(tenantId);
    return { success: true, error: undefined, data };
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message || "Failed to fetch P&L" };
  }
}

export async function getCashFlowAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getCashFlow(tenantId);
    return { success: true, error: undefined, data };
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message || "Failed to fetch cash flow" };
  }
}

export async function manualJournalEntryAction(data: {
  reference?: string;
  description?: string;
  lines: { accountName: string; debit: number; credit: number }[];
}) {
  try {
    const tenantId = await getTenant();
    await treasuryService.createJournalEntry(tenantId, {
      ...data,
      createdBy: "Manual Entry",
    });
    revalidatePath("/dashboard/treasury");
    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message || "Failed to create journal entry" };
  }
}
