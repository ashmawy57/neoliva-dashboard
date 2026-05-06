export const dynamic = 'force-dynamic';
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays, Clock, 
  CheckCircle2, XCircle
} from "lucide-react";
import { getAppointments, getAppointmentStats } from "@/app/actions/appointments";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";

export default async function AppointmentsPage() {
  const [appointmentsList, statsData] = await Promise.all([
    getAppointments(),
    getAppointmentStats()
  ]);

  const stats = [
    { label: "Total Today", value: statsData.totalToday.toString(), icon: CalendarDays, accent: "text-blue-600 bg-blue-50" },
    { label: "Completed", value: statsData.completed.toString(), icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
    { label: "In Progress", value: statsData.inProgress.toString(), icon: Clock, accent: "text-amber-600 bg-amber-50" },
    { label: "Cancelled", value: statsData.cancelled.toString(), icon: XCircle, accent: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all clinic appointments</p>
        </div>
        <NewAppointmentDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm card-hover">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.accent}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AppointmentsView initialAppointments={appointmentsList} />
    </div>
  );
}
