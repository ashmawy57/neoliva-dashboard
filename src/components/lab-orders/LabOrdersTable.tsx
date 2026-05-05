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
import Link from "next/link";

export function LabOrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredOrders = initialOrders.filter(e => {
    const matchesSearch = e.patient.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.item.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "All" || e.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient, ID or case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["All", "In Progress", "Received", "Pending"].map((tab) => (
            <Badge 
              key={tab} 
              variant="outline" 
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${filter === tab ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600 bg-white hover:bg-gray-100"}`}
            >
              {tab}
            </Badge>
          ))}
        </div>
      </div>
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
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
