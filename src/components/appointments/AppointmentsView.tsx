"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, CalendarDays, Clock, 
  CheckCircle2, XCircle, AlertCircle, MoreHorizontal, LayoutList, Calendar as CalendarIcon,
  Receipt, DollarSign
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { generateInvoiceFromAppointment } from "@/app/actions/billing";
import { toast } from "sonner";

const statusConfig: Record<string, { icon: any; className: string }> = {
  Completed: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  "In Progress": { icon: AlertCircle, className: "bg-blue-50 text-blue-700 border-blue-100" },
  Scheduled: { icon: Clock, className: "bg-slate-50 text-slate-600 border-slate-100" },
  Cancelled: { icon: XCircle, className: "bg-red-50 text-red-600 border-red-100" },
};

export function AppointmentsView({ initialAppointments }: { initialAppointments: any[] }) {
  const [appointmentsList, setAppointmentsList] = useState<any[]>(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [editingApt, setEditingApt] = useState<any>(null);
  const [reschedulingApt, setReschedulingApt] = useState<any>(null);
  const [generatingInvoiceApt, setGeneratingInvoiceApt] = useState<any>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<string>("100.00");
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = appointmentsList.filter((a) => {
    const matchesSearch =
      a.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
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
        <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
          {["All", "Scheduled", "In Progress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${filterStatus === status
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
                const config = statusConfig[apt.status] || statusConfig.Scheduled;
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
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer border-0 bg-transparent">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 border p-1">
                          <DropdownMenuItem onClick={() => setEditingApt(apt)} className="text-sm rounded-lg font-medium text-gray-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReschedulingApt({ ...apt, newDate: apt.date, newTime: apt.time })} className="text-sm rounded-lg font-medium text-gray-700 focus:bg-gray-100 cursor-pointer">Reschedule</DropdownMenuItem>
                          
                          {!apt.hasInvoice && apt.status === "Completed" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setGeneratingInvoiceApt(apt);
                                  setInvoiceAmount("100.00"); // Default amount
                                }} 
                                className="text-sm rounded-lg font-semibold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                Generate Invoice
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuItem onClick={() => {
                            setAppointmentsList(prev => prev.map(a => a.id === apt.id ? { ...a, status: "Cancelled" } : a));
                          }} className="text-sm text-red-600 rounded-lg font-medium focus:bg-red-50 focus:text-red-700 cursor-pointer">
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <CalendarView items={filtered} />
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingApt} onOpenChange={(open) => !open && setEditingApt(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-row items-center justify-between m-0">
            <DialogTitle className="text-lg font-bold text-gray-800">Edit Appointment</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${editingApt?.color || 'from-gray-400 to-gray-500'} shadow-md`}>
                {editingApt?.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{editingApt?.patient}</h3>
                <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mt-1">{editingApt?.treatment}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Update Status</label>
              <div className="grid grid-cols-2 gap-3">
                {["Scheduled", "In Progress", "Completed", "Cancelled"].map(s => {
                  const Icon = statusConfig[s]?.icon || Clock;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setAppointmentsList(prev => prev.map(a => a.id === editingApt.id ? { ...a, status: s } : a));
                        setEditingApt(null);
                      }}
                      className={`p-3 border rounded-xl flex items-center gap-2 font-semibold text-sm transition-all shadow-sm ${editingApt?.status === s
                          ? 'ring-2 ring-blue-500 border-transparent bg-blue-50 shadow-blue-500/20 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${editingApt?.status === s ? 'text-blue-600' : 'text-gray-400'}`} />
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Reschedule Dialog */}
      <Dialog open={!!reschedulingApt} onOpenChange={(open) => !open && setReschedulingApt(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-row items-center justify-between m-0">
            <DialogTitle className="text-lg font-bold text-gray-800">Reschedule Appointment</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${reschedulingApt?.color || 'from-gray-400 to-gray-500'} shadow-md`}>
                {reschedulingApt?.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{reschedulingApt?.patient}</h3>
                <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mt-1">{reschedulingApt?.treatment}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Date</label>
                <Input
                  type="date"
                  value={reschedulingApt?.newDate || ''}
                  onChange={(e) => setReschedulingApt({ ...reschedulingApt, newDate: e.target.value })}
                  className="border-gray-200 focus:ring-blue-500/20 rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Time</label>
                <Input
                  type="time"
                  value={reschedulingApt?.newTime ? (() => {
                    const time = reschedulingApt.newTime;
                    if (!time.includes(' ')) return time;
                    const [timePart, ampm] = time.split(' ');
                    let [h, m] = timePart.split(':');
                    if (ampm === 'PM' && h !== '12') h = (parseInt(h) + 12).toString();
                    else if (ampm === 'AM' && h === '12') h = '00';
                    return `${h.padStart(2, '0')}:${m}`;
                  })() : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    let [h, m] = val.split(':');
                    let ampm = 'AM';
                    let hi = parseInt(h);
                    if (hi >= 12) { ampm = 'PM'; if (hi > 12) hi -= 12; }
                    else if (hi === 0) { hi = 12; }

                    setReschedulingApt({ ...reschedulingApt, newTime: `${hi.toString().padStart(2, '0')}:${m} ${ampm}` })
                  }}
                  className="border-gray-200 focus:ring-blue-500/20 rounded-xl bg-gray-50/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setReschedulingApt(null)} className="rounded-xl font-medium border-gray-200">Cancel</Button>
            <Button onClick={() => {
              setAppointmentsList(prev => prev.map(a => a.id === reschedulingApt.id ? { ...a, date: reschedulingApt.newDate, time: reschedulingApt.newTime } : a));
              setReschedulingApt(null);
            }} className="rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Invoice Dialog */}
      <Dialog open={!!generatingInvoiceApt} onOpenChange={(open) => !open && setGeneratingInvoiceApt(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-row items-center justify-between m-0">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Generate Patient Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-emerald-600 shadow-md`}>
                {generatingInvoiceApt?.patient?.[0] || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{generatingInvoiceApt?.patient}</h3>
                <p className="text-xs font-semibold text-emerald-600 tracking-wider uppercase mt-1">
                  {generatingInvoiceApt?.type} - {generatingInvoiceApt?.date}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="pl-10 border-gray-200 focus:ring-emerald-500/20 rounded-xl bg-gray-50/50 font-bold text-lg"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Confirm the total amount for the services provided during this visit.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setGeneratingInvoiceApt(null)} className="rounded-xl font-medium border-gray-200" disabled={isGenerating}>Cancel</Button>
            <Button 
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                const res = await generateInvoiceFromAppointment(generatingInvoiceApt.id, parseFloat(invoiceAmount));
                setIsGenerating(false);
                
                if (res.success) {
                  toast.success("Invoice generated successfully!");
                  setGeneratingInvoiceApt(null);
                  // Optionally refresh state or wait for revalidatePath
                } else {
                  toast.error(res.error || "Failed to generate invoice");
                }
              }} 
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
            >
              {isGenerating ? "Generating..." : "Confirm & Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarView({ items }: { items: any[] }) {
  const daysInMonth = 31;
  const startDay = 5; // Assuming March 2024 starts on Friday (5)
  const weeks = [];
  let currentWeek: any[] = Array(7).fill(null);

  for (let i = 0; i < startDay; i++) currentWeek[i] = { date: null };
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startDay + day - 1) % 7;
    const dateStr = `2024-03-${day.toString().padStart(2, '0')}`;
    const dayApps = items.filter((a: any) => a.date === dateStr);

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
