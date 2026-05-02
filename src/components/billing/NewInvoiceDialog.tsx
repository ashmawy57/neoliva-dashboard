"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Receipt, Loader2, DollarSign, Calendar as CalendarIcon, User, Activity as ActivityIcon } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { getPatients } from "@/app/actions/patients";
import { getServices } from "@/app/actions/services";
import { toast } from "sonner";

export function NewInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [method, setMethod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [treatment, setTreatment] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  async function fetchInitialData() {
    setFetchingData(true);
    try {
      const [patientsData, servicesData] = await Promise.all([
        getPatients(),
        getServices()
      ]);
      setPatients(patientsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to load patients and services");
    } finally {
      setFetchingData(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createInvoice({
        patientId: selectedPatientId,
        amount: parseFloat(amount),
        status,
        dueDate: dueDate || undefined,
        method: method || undefined,
        treatment: treatment || undefined,
      });
      
      toast.success("Invoice created successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setAmount("");
    setStatus("Pending");
    setMethod("");
    setDueDate("");
    setTreatment("");
    setSelectedServiceId("");
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setAmount(service.price.toString());
      setTreatment(service.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        } 
      />
      
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <Receipt className="h-5 w-5 text-blue-600" />
            </span>
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden max-h-[85vh]">
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-5">
            
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Patient <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPatientId} onValueChange={(val) => setSelectedPatientId(val ?? "")}>
                <SelectTrigger id="patient" className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm">
                  <SelectValue placeholder={fetchingData ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id} className="rounded-lg">
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Selection (Optional shortcut) */}
            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-gray-400" /> Quick Service Select
              </Label>
              <Select value={selectedServiceId} onValueChange={(val: string | null) => handleServiceChange(val ?? "")}>
                <SelectTrigger id="service" className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm">
                  <SelectValue placeholder={fetchingData ? "Loading services..." : "Select a service to auto-fill"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id} className="rounded-lg">
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm" 
                    placeholder="0.00" 
                    required
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" /> Due Date
                </Label>
                <Input 
                  id="due_date" 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm" 
                />
              </div>
            </div>

            {/* Status & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val ?? "Pending")}>
                  <SelectTrigger id="status" className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="Pending" className="rounded-lg text-amber-600 font-medium">Pending</SelectItem>
                    <SelectItem value="Paid" className="rounded-lg text-emerald-600 font-medium">Paid</SelectItem>
                    <SelectItem value="Cancelled" className="rounded-lg text-red-600 font-medium">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method" className="text-sm font-semibold text-gray-700">Payment Method</Label>
                <Select value={method} onValueChange={(val) => setMethod(val ?? "")}>
                  <SelectTrigger id="method" className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="Cash" className="rounded-lg">Cash</SelectItem>
                    <SelectItem value="Credit Card" className="rounded-lg">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer" className="rounded-lg">Bank Transfer</SelectItem>
                    <SelectItem value="Insurance" className="rounded-lg">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Treatment Description */}
            <div className="space-y-2">
              <Label htmlFor="treatment" className="text-sm font-semibold text-gray-700">Treatment / Description</Label>
              <Input 
                id="treatment" 
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="e.g. Root Canal Treatment, Consultation" 
                className="h-11 bg-white border-gray-200 focus:ring-blue-500 rounded-xl shadow-sm"
              />
            </div>

          </div>
          
          <DialogFooter className="bg-white px-6 py-4 border-t flex gap-3 shrink-0 w-full sm:justify-between items-center sm:flex-row flex-col-reverse">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11 shadow-sm font-medium w-full sm:w-auto"
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 min-w-[160px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 h-11 font-semibold w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  CREATING...
                </>
              ) : (
                "GENERATE INVOICE"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
