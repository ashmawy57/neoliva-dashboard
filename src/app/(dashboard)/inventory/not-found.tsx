import { Button } from "@/components/ui/button";
import { PackageSearch, Home } from "lucide-react";
import Link from "next/link";

export default function InventoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-6">
        <PackageSearch className="w-12 h-12" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        The inventory item or category you are looking for could not be found in the current stock list.
      </p>

      <Link href="/inventory">
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-lg shadow-blue-200">
          <Home className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
      </Link>
    </div>
  );
}
