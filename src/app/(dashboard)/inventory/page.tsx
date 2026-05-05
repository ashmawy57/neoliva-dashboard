import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewInventoryItemDialog } from "@/components/inventory/NewInventoryItemDialog";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { getInventory } from "@/app/actions/inventory";

export default async function InventoryPage() {
  const inventoryList = await getInventory();
  const lowItems = inventoryList.filter((i) => i.quantity <= i.minLevel);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Supply management and stock tracking</p>
        </div>
        <NewInventoryItemDialog />
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
              <p className="text-2xl font-bold text-gray-900">{inventoryList.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{inventoryList.length - lowItems.length}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryTable initialInventory={inventoryList} />
    </div>
  );
}
