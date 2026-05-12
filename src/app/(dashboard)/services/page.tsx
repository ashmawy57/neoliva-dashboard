export const dynamic = 'force-dynamic';

import { ServiceService } from "@/services/service.service";
import { ServicesView } from "@/components/services/ServicesView";
import { NewServiceDialog } from "@/components/services/NewServiceDialog";
import { 
  Sparkles, 
  LayoutGrid, 
  Zap, 
  BarChart3 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { resolveTenantContext } from "@/lib/tenant-context";

export default async function ServicesPage() {
  const tenantId = await resolveTenantContext();
  const serviceService = new ServiceService();
  const services = await serviceService.getServices(tenantId);

  // Mock stats for the top row (could be expanded to be real later)
  const stats = [
    { label: "Active Services", value: services.length, icon: LayoutGrid, color: "text-blue-600 bg-blue-50" },
    { label: "Most Popular", value: services.filter(s => s.popular).length, icon: Sparkles, color: "text-amber-600 bg-amber-50" },
    { label: "Revenue Driver", value: services.length > 0 ? "Premium" : "None", icon: Zap, color: "text-indigo-600 bg-indigo-50" },
    { label: "Avg. Duration", value: services.length > 0 
      ? `${Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length)}m` 
      : "0m", icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Services & Pricing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage clinic treatments and centralized pricing</p>
        </div>
        <NewServiceDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm card-hover bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ServicesView initialServices={services} />
    </div>
  );
}
