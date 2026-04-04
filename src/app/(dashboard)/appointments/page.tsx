"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PlusCircle, Search, CalendarDays, Clock, Filter,
  CheckCircle2, XCircle, AlertCircle, MoreHorizontal, LayoutList, Calendar as CalendarIcon
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const appointments = [
  { id: "APT-1001", patient: "Emily Johnson", doctor: "Dr. Sarah Smith", treatment: "Teeth Cleaning", date: "2024-03-28", time: "09:00 AM", status: "Completed", avatar: "EJ", color: "from-blue-500 to-cyan-500" },
  { id: "APT-1002", patient: "Marcus Williams", doctor: "Dr. Sarah Smith", treatment: "Root Canal", date: "2024-03-28", time: "10:30 AM", status: "In Progress", avatar: "MW", color: "from-purple-500 to-pink-500" },
  { id: "APT-1003", patient: "Sarah Chen", doctor: "Dr. James Adams", treatment: "Orthodontic Consultation", date: "2024-03-28", time: "11:15 AM", status: "Scheduled", avatar: "SC", color: "from-amber-500 to-orange-500" },
  { id: "APT-1004", patient: "James Rodriguez", doctor: "Dr. James Adams", treatment: "Dental Implant Review", date: "2024-03-29", time: "01:00 PM", status: "Scheduled", avatar: "JR", color: "from-emerald-500 to-teal-500" },
  { id: "APT-1005", patient: "Aisha Patel", doctor: "Dr. Lisa Lee", treatment: "Teeth Whitening", date: "2024-03-29", time: "02:30 PM", status: "Cancelled", avatar: "AP", color: "from-rose-500 to-pink-500" },
  { id: "APT-1006", patient: "David Kim", doctor: "Dr. Lisa Lee", treatment: "Composite Filling", date: "2024-03-30", time: "09:00 AM", status: "Scheduled", avatar: "DK", color: "from-indigo-500 to-violet-500" },
];

const statusConfig: Record<string, { icon: any; className: string }> = {
  Completed: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  "In Progress": { icon: AlertCircle, className: "bg-blue-50 text-blue-700 border-blue-100" },
  Scheduled: { icon: Clock, className: "bg-slate-50 text-slate-600 border-slate-100" },
  Cancelled: { icon: XCircle, className: "bg-red-50 text-red-600 border-red-100" },
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView] = useState<"list" | "calendar">("calendar");

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all clinic appointments</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium">
          <PlusCircle className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "Total Today", value: "24", icon: CalendarDays, accent: "text-blue-600 bg-blue-50" },
          { label: "Completed", value: "8", icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
          { label: "In Progress", value: "2", icon: Clock, accent: "text-amber-600 bg-amber-50" },
          { label: "Cancelled", value: "1", icon: XCircle, accent: "text-red-600 bg-red-50" },
        ].map((stat) => (
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient or treatment..."
            className="pl-10 h-10 rounded-xl bg-white border-gray-200 focus-visible:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-xl">
          {["All", "Scheduled", "In Progress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterStatus === status
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl">
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
            <LayoutList className="w-4 h-4" />
          </button>
          <button onClick={() => setView("calendar")} className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${view === "calendar" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
             <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {view === "list" ? (
      <Card className="border-0 shadow-sm overflow-hidden animate-fade-in-up">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Treatment</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((apt) => {
              const config = statusConfig[apt.status];
              const StatusIcon = config.icon;
              return (
                <TableRow key={apt.id} className="table-row-hover group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${apt.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                        {apt.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{apt.patient}</p>
                        <p className="text-xs text-gray-400">{apt.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{apt.doctor}</TableCell>
                  <TableCell className="text-sm text-gray-700 font-medium">{apt.treatment}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700">{apt.date}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${config.className} border text-[11px] font-semibold rounded-full px-2.5 hover:${config.className.split(' ')[0]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {apt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 rounded-lg inline-flex items-center justify-center hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem className="text-sm rounded-lg">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-sm rounded-lg">Reschedule</DropdownMenuItem>
                        <DropdownMenuItem className="text-sm text-red-600 rounded-lg">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      ) : (
        <CalendarView items={filtered} />
      )}
    </div>
  );
}

function CalendarView({ items }: { items: typeof appointments }) {
  const daysInMonth = 31;
  const startDay = 5; // Assuming March 2024 starts on Friday (5)
  const weeks = [];
  let currentWeek: any[] = Array(7).fill(null);

  for (let i = 0; i < startDay; i++) currentWeek[i] = { date: null };
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startDay + day - 1) % 7;
    const dateStr = `2024-03-${day.toString().padStart(2, '0')}`;
    const dayApps = items.filter(a => a.date === dateStr);

    currentWeek[dayOfWeek] = { date: day, apps: dayApps };
    if (dayOfWeek === 6 || day === daysInMonth) {
      if (day === daysInMonth && dayOfWeek < 6) {
        for (let j = dayOfWeek + 1; j < 7; j++) currentWeek[j] = { date: null };
      }
      weeks.push([...currentWeek]);
      currentWeek = Array(7).fill(null);
    }
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden py-0 px-0 animate-fade-in-up bg-white">
      <div className="flex bg-white justify-between items-center px-6 py-4 border-b border-gray-100">
         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <CalendarDays className="w-5 h-5 text-blue-600" /> March 2024
         </h3>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-gray-500">&lt;</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg font-semibold text-gray-700">Today</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-gray-500">&gt;</Button>
         </div>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r last:border-r-0 border-gray-100">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-gray-200/50 gap-[1px]">
        {weeks.map((week, idx) => (
          <div key={idx} className="grid grid-cols-7 gap-[1px]">
            {week.map((day, i) => (
              <div key={i} className={`min-h-[140px] bg-white p-2 flex flex-col ${!day?.date ? 'bg-gray-50/50 opacity-50' : 'hover:bg-blue-50/10'}`}>
                {day?.date && (
                  <span className={`text-sm font-semibold mb-2 w-8 h-8 flex items-center justify-center rounded-full ${day.apps?.length ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                    {day.date}
                  </span>
                )}
                <div className="flex flex-col gap-1.5 overflow-y-auto mt-1 scrollbar-hide max-h-[100px] pb-2">
                  {day?.apps?.map((app: any) => (
                    <div key={app.id} className="text-[10px] p-2 rounded-lg border border-gray-100 flex items-start gap-1.5 cursor-pointer hover:shadow-md transition-all bg-white relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${app.color} opacity-80`} />
                      <div className="pl-2 leading-tight flex-1">
                        <p className="font-bold text-gray-800 truncate mb-0.5">{app.time}</p>
                        <p className="text-gray-600 font-medium truncate group-hover:text-blue-600 transition-colors">{app.patient}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
