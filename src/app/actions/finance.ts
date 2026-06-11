'use server'

import { withPermission } from "@/lib/rbac/guard";


import { FinanceService } from "@/services/finance.service";




const financeService = new FinanceService();

export async function getFinancialDashboardAction(period: '7d' | '30d' | '12m' = '30d') {
  try {
    return await withPermission('billing', 'read', async (session) => {
      const tenantId = session.tenantId;
      // Strict RBAC Check
          
      
          const data = await financeService.getFinancialDashboard(tenantId, period);
          
          return { 
            success: true, error: undefined, 
            data: JSON.parse(JSON.stringify(data)) // Ensure plain objects for Server Action return
          };
    });
  } catch (error: any) {
    console.error("[getFinancialDashboardAction] Error:", error);
        return { 
          success: false, data: undefined, error: error.message || "Unauthorized or failed to fetch financial data" 
        };
  }
}

export async function createJournalEntryAction(data: {
  description: string;
  lines: { accountName: string; debit: number; credit: number }[];
}) {
  try {
    return await withPermission('billing', 'create', async (session) => {
      const tenantId = session.tenantId;
      const treasuryService = new (await import("@/services/treasury.service")).TreasuryService();
          const entry = await treasuryService.createJournalEntry(tenantId, data);
      
          return { success: true, error: undefined, data: JSON.parse(JSON.stringify(entry)) };
    });
  } catch (error: any) {
    console.error("[createJournalEntryAction] Error:", error);
        return { success: false, data: undefined, error: error.message || "Failed to create journal entry" };
  }
}

export async function getAccountsAction() {
  try {
    return await withPermission('billing', 'read', async (session) => {
      const tenantId = session.tenantId;
      const treasuryRepository = new (await import("@/repositories/treasury.repository")).TreasuryRepository();
          const accounts = await treasuryRepository.getAccounts(tenantId);
      
          return { success: true, error: undefined, data: JSON.parse(JSON.stringify(accounts)) };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function exportFinanceCSVAction() {
  try {
    return await withPermission('billing', 'read', async (session) => {
      const tenantId = session.tenantId;
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
      
          return { success: true, error: undefined, data: csvContent };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function getProfitLossReportAction() {
  try {
    return await withPermission('billing', 'read', async (session) => {
      const tenantId = session.tenantId;
      const treasuryService = new (await import("@/services/treasury.service")).TreasuryService();
          const data = await treasuryService.getProfitAndLoss(tenantId);
      
          return { success: true, error: undefined, data };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}
