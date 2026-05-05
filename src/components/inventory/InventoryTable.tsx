"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function InventoryTable({ initialInventory }: { initialInventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = initialInventory.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or category..."
          className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Level</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const isLow = item.quantity <= item.minLevel;
              const pct = Math.min((item.quantity / (item.minLevel || 1)) * 100, 100);
              return (
                <TableRow key={item.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] rounded-full border-gray-200 text-gray-600">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-sm font-bold ${isLow ? "text-red-600" : "text-gray-700"}`}>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{item.minLevel} {item.unit}</TableCell>
                  <TableCell>
                    <div className="w-24">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] font-semibold rounded-full px-2.5 border-none ${isLow ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                      {isLow ? "Low" : "OK"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
