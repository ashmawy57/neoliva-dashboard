'use server'

import { TreasuryService } from "@/services/treasury.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { revalidatePath } from "next/cache";

const treasuryService = new TreasuryService();

async function getTenant() {
  const tenantId = await resolveTenantContext();
  // Financial access is sensitive - only Admin/Owner
  await requirePermission(PermissionCode.ADMIN_TENANT_MANAGE);
  return tenantId;
}

export async function getTrialBalanceAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getTrialBalance(tenantId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch trial balance" };
  }
}

export async function getProfitAndLossAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getProfitAndLoss(tenantId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch P&L" };
  }
}

export async function getCashFlowAction() {
  try {
    const tenantId = await getTenant();
    const data = await treasuryService.getCashFlow(tenantId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch cash flow" };
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
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create journal entry" };
  }
}
