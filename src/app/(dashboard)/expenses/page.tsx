import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingDown, ArrowUpRight } from "lucide-react";
import { NewExpenseDialog } from "@/components/expenses/NewExpenseDialog";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { getExpenses, getExpenseStats } from "@/app/actions/expenses";
import { ExportExpensesCSV } from "@/components/expenses/ExpenseClientActions";

export default async function ExpensesPage() {
  const [expenses, stats] = await Promise.all([
    getExpenses(),
    getExpenseStats()
  ]);

  const totalExpenses = stats?.totalThisMonth || 0;
  const pendingPayments = stats?.pendingAmount || 0;
  const largestCategory = stats?.largestCategory || 'None';
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const largestCategoryPercent = totalAmount > 0 ? Math.round(((stats?.largestCategoryAmount || 0) / totalAmount) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Manage and track your clinic's operating costs.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportExpensesCSV data={expenses} />
          <NewExpenseDialog />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-white/50 text-red-700 border-red-200">This Month</Badge>
            </div>
            <p className="text-sm font-semibold text-red-900 mb-1">Total Expenses</p>
            <h2 className="text-3xl font-bold text-red-700">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Pending Payments</p>
            <h2 className="text-3xl font-bold text-gray-900">${pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-gray-300" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-400 mb-1">Largest Category</p>
            <h2 className="text-2xl font-bold text-white capitalize">{largestCategory}</h2>
            <p className="text-sm text-gray-400 mt-1">{largestCategoryPercent}% of total</p>
          </CardContent>
        </Card>
      </div>

      <ExpensesTable initialExpenses={expenses} />
    </div>
  );
}
