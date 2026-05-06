import { getInventory, getLowStockAlerts } from "@/app/actions/inventory";
import InventoryView from "@/components/inventory/InventoryView";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata = {
  title: "Inventory | Dental Clinic Dashboard",
  description: "Track and manage clinical stock and consumables automatically.",
};

export default async function InventoryPage() {
  const [items, lowStockItems] = await Promise.all([
    getInventory(),
    getLowStockAlerts()
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500">Track consumables and automate stock deduction.</p>
      </div>

      <Suspense fallback={<Loading />}>
        <InventoryView initialItems={items} lowStockCount={lowStockItems.length} />
      </Suspense>
    </div>
  );
}
