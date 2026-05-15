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
import { Search, MoreHorizontal, Eye, Trash2, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateLabOrderStatusAction, deleteLabOrderAction } from "@/app/actions/lab-orders";
import { toast } from "sonner";
import { LabOrderStatus } from "@/generated/client";

export function LabOrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredOrders = initialOrders.filter(e => {
    const matchesSearch = 
      (e.patientName?.toLowerCase().includes(search.toLowerCase())) ||
      (e.displayId?.toLowerCase().includes(search.toLowerCase())) ||
      (e.itemType?.toLowerCase().includes(search.toLowerCase())) ||
      (e.labName?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filter === "All" || e.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = async (id: string, status: LabOrderStatus) => {
    const res = await updateLabOrderStatusAction(id, status);
    if (res.success) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab order?")) return;
    const res = await deleteLabOrderAction(id);
    if (res.success) {
      toast.success("Lab order deleted");
    } else {
      toast.error(res.error || "Failed to delete lab order");
    }
  };

  const getStatusBadge = (status: LabOrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">PENDING</Badge>;
      case "SENT":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">SENT</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">IN PROGRESS</Badge>;
      case "RECEIVED":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">RECEIVED</Badge>;
      case "DELIVERED":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">DELIVERED</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">CANCELLED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm animate-fade-in">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient, ID or lab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {["All", "PENDING", "SENT", "IN_PROGRESS", "RECEIVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200" 
                  : "text-gray-500 bg-white border border-gray-100 hover:bg-gray-50"
              }`}
            >
              {tab === "All" ? "ALL ORDERS" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-b-gray-100 hover:bg-transparent">
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest pl-6">Order ID / Lab</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Patient</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Item / Tooth</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Timelines</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Cost</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id} className="border-b-gray-50 hover:bg-purple-50/30 transition-colors group">
              <TableCell className="pl-6 py-4">
                <p className="font-bold text-gray-900 text-sm font-mono">{order.displayId || order.id.slice(0,8)}</p>
                <p className="text-[11px] font-semibold text-purple-600 mt-1 flex items-center gap-1 uppercase tracking-wider">
                  <Beaker className="w-3 h-3" /> {order.labName}
                </p>
              </TableCell>
              <TableCell>
                <Link href={`/patients/${order.patientId}`} className="font-bold text-gray-800 hover:text-purple-700 transition-colors">
                  {order.patientName}
                </Link>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 tracking-wider">#{order.patientDisplayId || 'PAT-ID'}</p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-[11px] font-bold rounded-md border border-gray-200">
                    {order.itemType}
                  </span>
                  {order.toothNumber && (
                    <span className="text-[10px] font-bold text-gray-400 px-2 uppercase">Tooth: {order.toothNumber}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-[11px] space-y-1">
                  {order.sentAt && (
                    <p className="text-gray-500 flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-gray-400" /> 
                      <span className="font-medium">Sent:</span> {new Date(order.sentAt).toLocaleDateString()}
                    </p>
                  )}
                  {order.dueDate && (
                    <p className="text-amber-700 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3 h-3 text-amber-500" /> 
                      <span className="font-bold">Due:</span> {new Date(order.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <p className="font-bold text-gray-900 text-sm">${order.cost?.toLocaleString() || 0}</p>
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(order.status)}
              </TableCell>
              <TableCell className="pr-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-100 text-gray-400 hover:text-purple-600 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-widest p-2">Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/patients/${order.patientId}`} className="flex items-center gap-2 cursor-pointer rounded-lg py-2">
                          <Eye className="w-4 h-4 text-gray-500" /> View Patient
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-widest p-2">Update Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "SENT")} className="flex items-center gap-2 cursor-pointer rounded-lg text-blue-600 font-semibold py-2">
                        <Truck className="w-4 h-4" /> Mark as Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "RECEIVED")} className="flex items-center gap-2 cursor-pointer rounded-lg text-emerald-600 font-semibold py-2">
                        <CheckCircle className="w-4 h-4" /> Mark as Received
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "DELIVERED")} className="flex items-center gap-2 cursor-pointer rounded-lg text-gray-600 font-semibold py-2">
                        <CheckCircle className="w-4 h-4" /> Mark as Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "CANCELLED")} className="flex items-center gap-2 cursor-pointer rounded-lg text-rose-600 font-semibold py-2">
                        <AlertCircle className="w-4 h-4" /> Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleDelete(order.id)} className="flex items-center gap-2 cursor-pointer rounded-lg text-rose-500 font-medium py-2">
                        <Trash2 className="w-4 h-4" /> Delete Order
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filteredOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center bg-gray-50/30">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Beaker className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium">No lab orders found matching your search.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Beaker(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
  );
}
