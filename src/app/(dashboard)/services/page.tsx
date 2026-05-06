export const dynamic = 'force-dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles } from "lucide-react";
import { NewServiceDialog } from "@/components/services/NewServiceDialog";
import { getServices } from "@/app/actions/services";

const categoryColors: Record<string, string> = {
  Preventive: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Restorative: "bg-blue-50 text-blue-700 border-blue-100",
  Cosmetic: "bg-purple-50 text-purple-700 border-purple-100",
  Surgical: "bg-red-50 text-red-700 border-red-100",
  Orthodontics: "bg-amber-50 text-amber-700 border-amber-100",
};

export default async function ServicesPage() {
  const servicesList = await getServices();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Services & Pricing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage clinic treatments and pricing structure</p>
        </div>
        <NewServiceDialog />
      </div>

      {servicesList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No services found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {servicesList.map((service) => (
            <Card key={service.id} className="border-0 shadow-sm card-hover overflow-hidden group relative">
              {service.popular && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none text-[10px] font-bold rounded-full px-2 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 mr-1" /> Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{service.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{service.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" /> {service.duration} min
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-full border ${categoryColors[service.category] || ""}`}>
                      {service.category}
                    </Badge>
                  </div>
                  <p className="text-base font-bold text-gray-900">${service.price}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
