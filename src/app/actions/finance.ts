'use server'

import { FinanceService } from "@/services/finance.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

const financeService = new FinanceService();

export async function getFinancialDashboardAction(period: '7d' | '30d' | '12m' = '30d') {
  try {
    const tenantId = await resolveTenantContext();
    
    // Strict RBAC Check
    await requirePermission(PermissionCode.FINANCE_VIEW);

    const data = await financeService.getFinancialDashboard(tenantId, period);
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(data)) // Ensure plain objects for Server Action return
    };
  } catch (error: any) {
    console.error("[getFinancialDashboardAction] Error:", error);
    return { 
      success: false, 
      error: error.message || "Unauthorized or failed to fetch financial data" 
    };
  }
}

export async function createJournalEntryAction(data: {
  description: string;
  lines: { accountName: string; debit: number; credit: number }[];
}) {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.FINANCE_VIEW);

    const treasuryService = new (await import("@/services/treasury.service")).TreasuryService();
    const entry = await treasuryService.createJournalEntry(tenantId, data);

    return { success: true, data: JSON.parse(JSON.stringify(entry)) };
  } catch (error: any) {
    console.error("[createJournalEntryAction] Error:", error);
    return { success: false, error: error.message || "Failed to create journal entry" };
  }
}

export async function getAccountsAction() {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.FINANCE_VIEW);

    const treasuryRepository = new (await import("@/repositories/treasury.repository")).TreasuryRepository();
    const accounts = await treasuryRepository.getAccounts(tenantId);

    return { success: true, data: JSON.parse(JSON.stringify(accounts)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportFinanceCSVAction() {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.FINANCE_VIEW);

    const financeService = new FinanceService();
    const dashboardData = await financeService.getFinancialDashboard(tenantId, '30d');

    // Generate CSV content
    const headers = ["Category", "Total", "Trend"];
    const rows = [
      ["Revenue (Today)", dashboardData.kpis.revenueToday, "N/A"],
      ["Revenue (Month)", dashboardData.kpis.revenueMonth, "N/A"],
      ["Expenses (Month)", dashboardData.kpis.expensesMonth, "N/A"],
      ["Net Profit", dashboardData.kpis.netProfit, "N/A"],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    return { success: true, data: csvContent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProfitLossReportAction() {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.FINANCE_VIEW);

    const treasuryService = new (await import("@/services/treasury.service")).TreasuryService();
    const data = await treasuryService.getProfitAndLoss(tenantId);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
