import { Card, CardContent } from "@/components/ui/card";
import { Truck, AlertCircle, CheckCircle } from "lucide-react";
import { NewLabOrderDialog } from "@/components/lab-orders/NewLabOrderDialog";
import { LabOrdersTable } from "@/components/lab-orders/LabOrdersTable";
import { getLabOrders } from "@/app/actions/lab_orders";

export default async function LabOrdersPage() {
  const labOrders = await getLabOrders();

  const totalActive = labOrders.filter(o => o.status === "IN_PROGRESS" || o.status === "SENT").length;
  const dueThisWeek = labOrders.filter(o => o.status === "IN_PROGRESS" || o.status === "SENT").length; 
  const received = labOrders.filter(o => o.status === "RECEIVED").length;
  const totalCost = labOrders.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const stats = [
    { label: "Total Active Cases", value: totalActive.toString(), icon: Truck, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Due This Week", value: dueThisWeek.toString(), icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Received (To Deliver)", value: received.toString(), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Total Monthly Cost", value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, icon: Truck, color: "text-purple-600", bg: "bg-purple-100" },
  ];

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
        {stats.map((stat, i) => (
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

      <LabOrdersTable initialOrders={labOrders} />
    </div>
  );
}
