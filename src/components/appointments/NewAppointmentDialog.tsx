"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  UserPlus, 
  Stethoscope, 
  ClipboardList,
  Palette
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
import { toast } from "sonner";

interface NewAppointmentDialogProps {
  patients: any[];
  doctors: any[];
  services: any[];
}

export function NewAppointmentDialog({ patients, doctors, services }: NewAppointmentDialogProps) {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" /> Patient
                </Label>
                <Select value={formData.patientId} onValueChange={(val) => setFormData({ ...formData, patientId: val })}>
                  <SelectTrigger className="h-10 md:h-12 border-gray-200 focus:ring-blue-500/20 rounded-xl md:rounded-2xl bg-gray-50/50">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl md:rounded-2xl border-gray-100 shadow-xl p-1">
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id} className="rounded-lg md:rounded-xl my-0.5">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
