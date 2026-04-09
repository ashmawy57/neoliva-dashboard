"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar as CalendarIcon, Beaker, Truck, FileText } from "lucide-react";

export function NewLabOrderDialog() {
  const [open, setOpen] = useState(false);
  
  // Form State
  const [labName, setLabName] = useState("");
  const [patient, setPatient] = useState("");
  const [item, setItem] = useState("");
  const [sentDate, setSentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [cost, setCost] = useState("");
  const [status, setStatus] = useState("Pending");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 rounded-xl h-10 px-5 text-sm font-medium border-0 cursor-pointer">
        <Plus className="mr-2 h-4 w-4" /> New Order
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-xl p-0 overflow-hidden bg-gray-50 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-purple-100 p-2 rounded-xl">
              <Beaker className="h-5 w-5 text-purple-600" />
            </span>
            Create New Lab Order
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); setOpen(false); }} 
          className="flex-1 flex flex-col overflow-hidden max-h-[85vh]"
        >
          <div className="flex-1 overflow-y-auto w-full p-6 space-y-6">
            
            {/* Context/Info Box */}
            <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-sm text-purple-800 font-medium leading-relaxed">
                Fill in the details to submit a new lab order. Make sure to specify the accurate timelines and laboratory name.
              </p>
            </div>

            {/* Patient Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search patient by name or ID..." 
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus-visible:ring-purple-500 rounded-xl shadow-sm h-11" 
                />
              </div>
            </div>

            {/* Lab & Item Details */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Laboratory</Label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="e.g. Elite Dental Labs" 
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus-visible:ring-purple-500 rounded-xl shadow-sm h-11" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Item Details</Label>
                <Input 
                  placeholder="e.g. PFM Crown (Tooth #16)" 
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="bg-white border-gray-200 focus-visible:ring-purple-500 rounded-xl shadow-sm h-11" 
                />
              </div>
            </div>

            {/* Timelines */}
            <div className="grid sm:grid-cols-2 gap-5 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Date Sent</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    type="date"
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-purple-500 rounded-lg shadow-sm h-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Date Due</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="pl-10 bg-amber-50/50 border-amber-200 focus-visible:ring-amber-500 rounded-lg shadow-sm h-10 font-medium text-amber-800" 
                  />
                </div>
              </div>
            </div>

            {/* Cost & Status */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Estimated Cost ($)</Label>
                <Input 
                  type="number"
                  min="0"
                  placeholder="0.00" 
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="bg-white border-gray-200 focus-visible:ring-purple-500 rounded-xl shadow-sm h-11 font-mono font-semibold text-gray-800" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Initial Status</Label>
                <div className="flex bg-gray-100/80 rounded-xl overflow-hidden border border-gray-100 p-1">
                  {["Pending", "Sent", "In Progress"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 rounded-lg font-semibold text-[11px] uppercase tracking-wider h-9 transition-all duration-300 ${
                        status === s 
                          ? "bg-purple-600 text-white shadow-md ring-1 ring-black/5" 
                          : "text-gray-500 hover:text-gray-800 hover:bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Additional Instructions</Label>
              <Textarea 
                placeholder="Include shade, material specifics, or special requests for the lab..." 
                className="bg-white border-gray-200 focus-visible:ring-purple-500 rounded-xl shadow-sm min-h-[80px] resize-none text-sm" 
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
              DISCARD
            </Button>
            <Button 
              type="submit" 
              className="px-8 min-w-[160px] rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 h-11 font-semibold w-full sm:w-auto"
            >
              SUBMIT ORDER
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
