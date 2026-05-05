"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useState } from "react";

export function ExpensesTable({ initialExpenses }: { initialExpenses: any[] }) {
  const [search, setSearch] = useState("");

  const filteredExpenses = initialExpenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                No expenses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
