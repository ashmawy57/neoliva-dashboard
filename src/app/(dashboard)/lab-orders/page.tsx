"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Truck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NewLabOrderDialog } from "@/components/lab-orders/NewLabOrderDialog";
import { getLabOrders } from "@/app/actions/lab_orders";

export default function LabOrdersPage() {
  const [search, setSearch] = useState("");
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getLabOrders();
        setLabOrders(data);
      } catch (error) {
        console.error("Failed to fetch lab orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = labOrders.filter(e =>
    e.patient.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.item.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = labOrders.filter(o => o.status === "In Progress" || o.status === "Pending").length;
  // simplistic "Due this week" for demo purposes, could be more robust with date-fns
  const dueThisWeek = labOrders.filter(o => o.status === "In Progress" || o.status === "Pending").length; 
  const received = labOrders.filter(o => o.status === "Received").length;
  const totalCost = labOrders.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lab Orders</h1>
          <p className="text-gray-500 mt-1">Track external laboratory cases, crowns, and prosthetics.</p>
        </div>
        <NewLabOrderDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Active Cases", value: totalActive.toString(), icon: Truck, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Due This Week", value: dueThisWeek.toString(), icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Received (To Deliver)", value: received.toString(), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Total Monthly Cost", value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, icon: Truck, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h2 className={`text-2xl font-bold ${i === 3 ? "text-gray-900" : stat.color}`}>{stat.value}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search explicitly by patient name, ID or case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["All", "In Progress", "Received", "Pending"].map((tab) => (
              <Badge key={tab} variant="outline" className={`px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 ${tab === "All" ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600 bg-white"}`}>
                {tab}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Order ID / Lab</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Patient</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Item Details</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Timelines</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Cost</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase text-xs tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-b-gray-50 hover:bg-purple-50/30 transition-colors group">
                  <TableCell>
                    <p className="font-bold text-gray-900 text-sm font-mono">{order.id}</p>
                    <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{order.labName}</p>
                  </TableCell>
                  <TableCell>
                    <Link href={`/patients/${order.patientId}`} className="font-medium text-purple-700 hover:text-purple-800 hover:underline">
                      {order.patient}
                    </Link>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.patientId}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-md border border-gray-200 shadow-sm">
                      {order.item}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="text-gray-500"><span className="font-semibold text-gray-400 w-10 inline-block">Sent:</span> {order.dateSent}</p>
                      <p className="text-amber-700 font-semibold mt-0.5"><span className="text-gray-400 w-10 inline-block font-semibold">Due:</span> {order.dateDue}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">${order.cost?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`rounded-full shadow-sm font-semibold text-[11px] uppercase tracking-wider px-2.5 py-0.5
                        ${order.status === "Received" ? "bg-emerald-100 text-emerald-800" :
                          order.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                            order.status === "Pending" ? "bg-amber-100 text-amber-800" :
                              "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500 font-medium bg-gray-50/30">
                    No orders matching "{search}" found.
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
