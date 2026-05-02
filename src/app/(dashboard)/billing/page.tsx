"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, CreditCard, ArrowUpRight, ArrowDownRight,
  Download, Printer, TrendingUp, Receipt, MoreHorizontal, Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getInvoices } from "@/app/actions/invoices";
import { NewInvoiceDialog } from "@/components/billing/NewInvoiceDialog";



export default function BillingPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getInvoices();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const totalRevenue = transactions.filter(t => t.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const paidCount = transactions.filter(t => t.status === "Paid").length;
  const outstandingAmount = transactions.filter(t => t.status !== "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingCount = transactions.filter(t => t.status !== "Paid").length;

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
          <NewInvoiceDialog />

        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-3 stagger-children">
        <Card className="card-hover border-0 shadow-sm bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
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
            <div className="text-3xl font-bold text-gray-900">{paidCount}</div>
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
            <div className="text-3xl font-bold text-red-600">${outstandingAmount.toLocaleString()}</div>
            <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> {outstandingCount} invoices overdue
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
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
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
                    <TableCell className="text-sm font-medium text-gray-500">
                      {tx.id.toString().substring(0, 8)}
                    </TableCell>
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
                      <Badge className={`text-[11px] font-semibold rounded-full px-2.5 border-none ${tx.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
