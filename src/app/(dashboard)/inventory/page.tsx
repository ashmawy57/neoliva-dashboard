"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, PlusCircle, Search, Package, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const inventory = [
  { id: "INV-01", name: "Lidocaine 2%", category: "Anesthetics", quantity: 5, minLevel: 10, unit: "Vials" },
  { id: "INV-02", name: "Composite Resin A2", category: "Materials", quantity: 45, minLevel: 20, unit: "Syringes" },
  { id: "INV-03", name: "Dental Bibs", category: "Disposables", quantity: 80, minLevel: 200, unit: "Boxes" },
  { id: "INV-04", name: "Sterilization Pouches", category: "Disposables", quantity: 800, minLevel: 500, unit: "Pcs" },
  { id: "INV-05", name: "Alginate Impression", category: "Materials", quantity: 3, minLevel: 15, unit: "Bags" },
  { id: "INV-06", name: "Disposable Gloves (M)", category: "Disposables", quantity: 1200, minLevel: 500, unit: "Pcs" },
  { id: "INV-07", name: "Fluoride Varnish", category: "Preventive", quantity: 8, minLevel: 25, unit: "Tubes" },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const lowItems = inventory.filter((i) => i.quantity <= i.minLevel);
  const filtered = inventory.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Supply management and stock tracking</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Alert Banner */}
      {lowItems.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl animate-scale-in">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Low Stock Alert</p>
            <p className="text-xs text-red-600">{lowItems.length} items are below minimum stock levels and need immediate restocking.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 text-xs flex-shrink-0">
            Reorder All
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              <p className="text-xs text-gray-500">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{lowItems.length}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm card-hover hidden md:flex">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inventory.length - lowItems.length}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or category..."
          className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
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
              const pct = Math.min((item.quantity / item.minLevel) * 100, 100);
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
                          className={`h-full rounded-full transition-all ${
                            isLow ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] font-semibold rounded-full px-2.5 border-none ${
                      isLow ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {isLow ? "Low" : "OK"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
