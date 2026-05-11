export interface FinancialTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface AppointmentAnalytics {
  total: number;
  completed: number;
  pending: number;
  canceled: number;
}

export interface TreatmentDistribution {
  name: string;
  value: number;
}

export interface PatientGrowth {
  month: string;
  count: number;
}

export interface InventoryItemInsight {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  category: string;
  unit: string;
}

export interface InventoryInsights {
  all: InventoryItemInsight[];
  lowStock: InventoryItemInsight[];
}

export interface ReportsKPIData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalPatients: number;
}

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
