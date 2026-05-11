import { DashboardRepository } from "@/repositories/dashboard.repository";
import { subMonths, startOfMonth } from "date-fns";

export class DashboardService {
  private dashboardRepo = new DashboardRepository();

  async getDashboardData(tenantId: string) {
    const [
      dailyRevenueRaw,
      appointmentsToday,
      pendingPaymentsRaw,
      inventoryItems,
      revenueVsExpensesRaw,
      weeklyAppointmentsRaw,
      recentPatientsRaw
    ] = await Promise.all([
      this.dashboardRepo.getDailyRevenue(tenantId),
      this.dashboardRepo.getTodayAppointments(tenantId),
      this.dashboardRepo.getPendingPayments(tenantId),
      this.dashboardRepo.getInventoryItems(tenantId),
      this.dashboardRepo.getRevenueVsExpenses(tenantId),
      this.dashboardRepo.getWeeklyAppointments(tenantId),
      this.dashboardRepo.getRecentPatients(tenantId)
    ]);

    // 1. KPI Normalization
    const dailyRevenue = Number(dailyRevenueRaw || 0);
    const pendingPayments = Number(pendingPaymentsRaw || 0);
    
    const appointments = {
      total: appointmentsToday.length,
      completed: appointmentsToday.filter(a => a.status === 'COMPLETED').length,
      pending: appointmentsToday.filter(a => ['SCHEDULED', 'WAITING', 'IN_PROGRESS'].includes(a.status || '')).length
    };

    // 2. Inventory Calculation
    let lowInventoryCount = 0;
    inventoryItems.forEach(item => {
      const currentStock = item.stockEntries.reduce((acc, entry) => {
        if (entry.type === 'IN') return acc + entry.quantity;
        if (entry.type === 'OUT') return acc - entry.quantity;
        return acc;
      }, 0);
      if (currentStock <= item.minimumStock) {
        lowInventoryCount++;
      }
    });

    // 3. Chart: Revenue vs Expenses
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
    for (let i = 0; i <= 6; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = monthDate.toLocaleString('en-US', { month: 'short' });
      monthlyData[monthKey] = { revenue: 0, expenses: 0 };
    }

    revenueVsExpensesRaw.invoices.forEach(inv => {
      const monthKey = new Date(inv.createdAt!).toLocaleString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += Number(inv.totalAmount || 0);
      }
    });

    revenueVsExpensesRaw.expenses.forEach(exp => {
      const monthKey = new Date(exp.date).toLocaleString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].expenses += Number(exp.amount || 0);
      }
    });

    const revenueVsExpenses = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .reverse();

    // 4. Chart: Weekly Appointments
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyCounts: Record<string, number> = {};
    days.forEach(d => dailyCounts[d] = 0);

    weeklyAppointmentsRaw.forEach(a => {
      const dayName = new Date(a.date).toLocaleString('en-US', { weekday: 'short' });
      if (dailyCounts[dayName] !== undefined) {
        dailyCounts[dayName]++;
      }
    });

    const weeklyAppointments = days.map(day => ({
      day,
      count: dailyCounts[day]
    }));

    // 5. Recent Patients with Treatment Normalization
    const colors = ["from-blue-400 to-blue-600", "from-indigo-400 to-indigo-600", "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600", "from-rose-400 to-rose-600"];
    
    const recentPatients = recentPatientsRaw.map((apt, i) => ({
      id: apt.patientId,
      name: apt.patient.name,
      treatment: this.normalizeTreatment(apt.treatment),
      time: new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: apt.status,
      avatar: apt.patient.name.charAt(0),
      color: colors[i % colors.length]
    }));

    return {
      kpis: {
        dailyRevenue,
        appointments,
        pendingPayments,
        lowInventory: lowInventoryCount
      },
      charts: {
        revenueVsExpenses,
        weeklyAppointments
      },
      recentPatients
    };
  }

  private normalizeTreatment(treatment?: string | null): string {
    if (!treatment || treatment.trim() === "") {
      return "General Checkup";
    }
    return treatment;
  }
}
