"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer, MoreHorizontal, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { deleteExpense, updateExpense } from "@/app/actions/expenses";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string | Date;
  status: string;
  description?: string;
}

export function ExportExpensesCSV({ data }: { data: Expense[] }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const headers = ["Date", "Category", "Title", "Description", "Amount", "Status"];
      const rows = data.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.title,
        e.description || "",
        e.amount.toString(),
        e.status
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV export successful");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export CSV");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs text-gray-600 rounded-xl h-9 border-gray-200"
      onClick={exportToCSV}
    >
      <Download className="mr-2 w-3.5 h-3.5" /> Export CSV
    </Button>
  );
}

export function ExpenseRowActions({ expense }: { expense: Expense }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expense.id);
        toast.success("Expense deleted successfully");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  const toggleStatus = async () => {
    const newStatus = expense.status === "PAID" ? "PENDING" : "PAID";
    try {
      await updateExpense(expense.id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </Button>
    </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl border-gray-100">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-gray-400 px-2 py-1.5 uppercase">Actions</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={toggleStatus}
            className="rounded-lg gap-2 cursor-pointer focus:bg-gray-50 focus:text-gray-900"
          >
            {expense.status === "PAID" ? (
              <Clock className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
            Mark as {expense.status === "PAID" ? "Pending" : "Paid"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-50" />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 rounded-lg gap-2 cursor-pointer focus:bg-red-50 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Expense
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
