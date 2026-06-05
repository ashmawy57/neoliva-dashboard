"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  UserPlus, 
  Stethoscope, 
  ClipboardList,
  Palette,
  User,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAppointment } from "@/app/actions/appointments";
import { searchPatients } from "@/app/actions/patients";
import { toast } from "sonner";

interface NewAppointmentDialogProps {
  doctors: any[];
  services: any[];
}

export function NewAppointmentDialog({ doctors, services }: NewAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    serviceId: "",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    treatment: "",
    notes: "",
    color: "from-blue-500 to-indigo-600"
  });

  // Client-side Async Search State
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const resetForm = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      serviceId: "",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      treatment: "",
      notes: "",
      color: "from-blue-500 to-indigo-600"
    });
    setPatientQuery("");
    setPatientResults([]);
    setSelectedPatientName("");
    setShowDropdown(false);
  };

  const handleSearch = async (val: string) => {
    setPatientQuery(val);
    if (val.trim().length === 0) {
      setPatientResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const results = await searchPatients(val);
      setPatientResults(results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (id: string, name: string) => {
    setFormData({ ...formData, patientId: id });
    setSelectedPatientName(name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorId) {
      toast.error("Please select a patient and a doctor");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      
      const res = await createAppointment({
        ...formData,
        duration: selectedService?.duration || 30,
        treatment: formData.treatment || selectedService?.name || "General Checkup"
      });

      if (res.success) {
        toast.success("Appointment created successfully!");
        setIsOpen(false);
        resetForm();
      } else {
        toast.error(res.error || "Failed to create appointment");
      }
    } catch (error) {
      toast.error("An error occurred while creating appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    { name: "Blue", value: "from-blue-500 to-indigo-600" },
    { name: "Emerald", value: "from-emerald-500 to-teal-600" },
    { name: "Amber", value: "from-amber-500 to-orange-600" },
    { name: "Rose", value: "from-rose-500 to-pink-600" },
    { name: "Purple", value: "from-purple-500 to-violet-600" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 md:px-6 h-10 md:h-12 rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 border-0 cursor-pointer">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">New Appointment</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl md:rounded-3xl">
        <DialogHeader className="px-6 md:px-8 py-4 md:py-6 border-b border-gray-100 bg-gray-50 flex flex-row items-center justify-between m-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8 space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Patient Selection (Async Combobox Search) */}
              <div className="space-y-2 relative">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" /> Patient
                </Label>
                {formData.patientId ? (
                  <div className="flex items-center justify-between h-10 md:h-12 px-4 border border-blue-200 bg-blue-50/30 rounded-xl md:rounded-2xl">
                    <div className="flex items-center gap-2 text-sm text-blue-900 font-medium">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold">
                        {selectedPatientName.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{selectedPatientName}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFormData({ ...formData, patientId: "" });
                        setSelectedPatientName("");
                        setPatientQuery("");
                        setPatientResults([]);
                      }}
                      className="h-7 px-2 text-xs text-blue-600 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input 
                        placeholder="Search patient by name or phone..." 
                        className="h-10 md:h-12 pl-10 pr-10 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50"
                        value={patientQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => { if (patientQuery.trim().length > 0) setShowDropdown(true); }}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                        
                        <div className="absolute top-full left-0 right-0 mt-2 z-20 max-h-[200px] overflow-y-auto bg-white border border-gray-100 shadow-xl rounded-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                          {patientResults.length === 0 ? (
                            <div className="p-3 text-xs text-gray-500 text-center">No patients found.</div>
                          ) : (
                            patientResults.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectPatient(p.id, p.name)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors flex flex-col cursor-pointer"
                              >
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-[10px] text-gray-500">{p.phone ? p.phone : p.displayId}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" /> Doctor
                </Label>
                <Select value={formData.doctorId} onValueChange={(val) => setFormData({ ...formData, doctorId: val })}>
                  <SelectTrigger className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl md:rounded-2xl border-gray-100 shadow-xl p-1">
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id} className="rounded-lg md:rounded-xl my-0.5">Dr. {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-500" /> Service
                </Label>
                <Select value={formData.serviceId} onValueChange={(val) => setFormData({ ...formData, serviceId: val })}>
                  <SelectTrigger className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl md:rounded-2xl border-gray-100 shadow-xl p-1">
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id} className="rounded-lg md:rounded-xl my-0.5">{s.name} (${s.price})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Treatment Name */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-500" /> Treatment
                </Label>
                <Input 
                  placeholder="e.g. Tooth Extraction" 
                  className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" /> Date
                </Label>
                <Input 
                  type="date" 
                  className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Time
                </Label>
                <Input 
                  type="time" 
                  className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                Theme Color
              </Label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} transition-all ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Clinical Notes</Label>
              <Textarea 
                placeholder="Any special instructions or clinical notes..." 
                className="min-h-[100px] border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="px-6 md:px-8 py-4 md:py-6 border-t border-gray-100 bg-gray-50 flex gap-3 sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="h-10 md:h-12 px-6 rounded-xl md:rounded-2xl font-semibold border-gray-200 hover:bg-white cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-10 md:h-12 px-8 rounded-xl md:rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
