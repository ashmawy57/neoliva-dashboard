export class AIInsightsService {
  static generateInsights(data: {
    revenueTrend: number[];
    expenseTrend: number[];
    profitTrend: number[];
    patientGrowth: number[];
    topTreatments: { name: string; value: number }[];
    lowStockItems: { name: string; currentStock: number }[];
  }): string[] {
    const insights: string[] = [];

    // Revenue insight
    if (data.revenueTrend.length >= 2) {
      const last = data.revenueTrend.at(-1) || 0;
      const prev = data.revenueTrend.at(-2) || 0;

      if (last > prev) {
        insights.push("📈 Revenue is increasing compared to last period.");
      } else if (last < prev && last > 0) {
        insights.push("⚠️ Revenue dropped compared to last period.");
      }
    }

    // Expense anomaly
    if (data.expenseTrend.length > 0) {
      const maxExpense = Math.max(...data.expenseTrend);
      const avgExpense = data.expenseTrend.reduce((a, b) => a + b, 0) / data.expenseTrend.length;
      if (maxExpense > 0 && maxExpense > avgExpense * 1.5) {
        insights.push("💸 Unusual spike detected in expenses.");
      }
    }

    // Patient growth
    if (data.patientGrowth.length >= 2) {
      const last = data.patientGrowth.at(-1) || 0;
      const prev = data.patientGrowth.at(-2) || 0;
      if (last < prev) {
        insights.push("📉 Patient growth is slowing down.");
      } else if (last > prev) {
        insights.push("👥 You are attracting more new patients this period!");
      }
    }

    // Inventory alert
    if (data.lowStockItems.length > 0) {
      insights.push(`⚠️ ${data.lowStockItems.length} items need restocking soon.`);
    }

    // Treatments
    if (data.topTreatments.length > 0) {
      insights.push(`🦷 Most popular treatment: ${data.topTreatments[0].name}`);
    }

    // Profitability
    if (data.profitTrend.length >= 2) {
      const lastProfit = data.profitTrend.at(-1) || 0;
      if (lastProfit < 0) {
        insights.push("🚨 Operational loss detected in the current period.");
      }
    }

    return insights;
  }
}
