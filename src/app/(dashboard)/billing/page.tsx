"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DollarSign, CreditCard, ArrowUpRight, ArrowDownRight,
  Download, Printer, TrendingUp, Receipt, MoreHorizontal
} from "lucide-react";
import Link from "next/link";

const transactions = [
  { id: "INV-2024-001", patient: "Emily Johnson", date: "Today, 10:30 AM", status: "Paid", amount: 350, method: "Credit Card", avatar: "EJ", color: "from-blue-500 to-cyan-500" },
  { id: "INV-2024-002", patient: "Marcus Williams", date: "Today, 09:15 AM", status: "Pending", amount: 850, method: "—", avatar: "MW", color: "from-purple-500 to-pink-500" },
  { id: "INV-2024-003", patient: "Sarah Chen", date: "Yesterday", status: "Paid", amount: 120, method: "Cash", avatar: "SC", color: "from-amber-500 to-orange-500" },
  { id: "INV-2024-004", patient: "James Rodriguez", date: "Mar 25", status: "Overdue", amount: 2500, method: "—", avatar: "JR", color: "from-rose-500 to-red-500" },
  { id: "INV-2024-005", patient: "Aisha Patel", date: "Mar 24", status: "Paid", amount: 180, method: "Insurance", avatar: "AP", color: "from-emerald-500 to-teal-500" },
];

export default function BillingPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Billing & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Financial overview and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Link href="/billing/invoices">
            <Button variant="outline" className="rounded-xl h-10 text-sm">
              <Receipt className="mr-2 h-4 w-4" /> View Invoices
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger 
              render={
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium">
                  + New Invoice
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] p-6 bg-white border-0 shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
                <DialogDescription>
                  Enter the details for the new patient invoice.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <label htmlFor="patient" className="text-sm font-semibold text-gray-700">Patient Name</label>
                  <input id="patient" className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="Select or type patient name..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="amount" className="text-sm font-semibold text-gray-700">Amount ($)</label>
                    <input id="amount" type="number" className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="0.00" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="due_date" className="text-sm font-semibold text-gray-700">Due Date</label>
                    <input id="due_date" type="date" className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="method" className="text-sm font-semibold text-gray-700">Payment Status / Method</label>
                  <select id="method" className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                     <option>Pending (Not Paid)</option>
                     <option>Credit Card</option>
                     <option>Cash</option>
                     <option>Insurance Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl h-11 shadow-md shadow-blue-500/20 text-[15px] font-bold">Submit Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <Card className="card-hover border-0 shadow-sm bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Revenue (MTD)</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">$45,231</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="flex items-center gap-0.5 bg-white/15 rounded-full px-2 py-0.5 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" /> +20.1%
              </span>
              <span className="text-emerald-200 text-xs">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Paid Invoices</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">145</div>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding Payments</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">$12,450</div>
            <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> 18 invoices overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 rounded-lg">
            Export <Download className="ml-1.5 w-3 h-3" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="table-row-hover group">
                  <TableCell className="text-sm font-medium text-gray-500">{tx.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tx.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                        {tx.avatar}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{tx.patient}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{tx.date}</TableCell>
                  <TableCell className="text-sm text-gray-500">{tx.method}</TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] font-semibold rounded-full px-2.5 border-none ${
                      tx.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                      tx.status === "Pending" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-gray-900">${tx.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 rounded-lg"><Download className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 rounded-lg"><Printer className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
