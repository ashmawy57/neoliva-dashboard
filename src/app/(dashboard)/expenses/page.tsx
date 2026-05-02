"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Wallet, TrendingDown, ArrowUpRight, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { NewExpenseDialog } from "@/components/expenses/NewExpenseDialog";
import { getExpenses } from "@/app/actions/expenses";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayments = expenses.filter(e => e.status !== "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  
  // Find largest category
  const categories: Record<string, number> = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });
  const largestCategory = Object.entries(categories).reduce((acc, curr) => curr[1] > acc[1] ? curr : acc, ["None", 0]);
  const largestCategoryPercent = totalExpenses > 0 ? Math.round((largestCategory[1] / totalExpenses) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Manage and track your clinic's operating costs.</p>
        </div>
        <NewExpenseDialog />
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
            <h2 className="text-3xl font-bold text-white">{largestCategory[0]}</h2>
            <p className="text-sm text-gray-400 mt-1">{largestCategoryPercent}% of total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Date</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Category</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Description</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Amount</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="border-b-gray-50 hover:bg-red-50/30 transition-colors cursor-pointer group">
                  <TableCell className="font-medium text-gray-900 text-sm">{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 rounded-full font-medium shadow-sm">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <span className="block">{expense.description}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{expense.id.toString().substring(0, 8)}</span>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`rounded-full shadow-sm font-semibold ${expense.status === "Paid" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                    >
                      {expense.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-medium bg-gray-50/30">
                    No expenses matching "{search}" found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
