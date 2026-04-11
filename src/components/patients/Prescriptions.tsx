"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Printer, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialPrescriptions = [
  {
    id: "RX-8849",
    date: "Mar 15, 2024",
    doctor: "Dr. Smith",
    medications: [
      { name: "Amoxicillin 500mg", dosage: "1 tablet", frequency: "Every 8 hours", duration: "7 days" },
      { name: "Ibuprofen 400mg", dosage: "1 tablet", frequency: "As needed for pain", duration: "5 days" },
    ],
    notes: "Take with food to prevent stomach upset.",
  },
  {
    id: "RX-7721",
    date: "Nov 25, 2023",
    doctor: "Dr. Adams",
    medications: [
      { name: "Chlorhexidine Mouthwash", dosage: "15ml", frequency: "Twice daily", duration: "14 days" },
    ],
    notes: "Rinse gently after extraction.",
  },
];

export function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [open, setOpen] = useState(false);
  const [newRx, setNewRx] = useState({
    name: "", dosage: "", frequency: "", duration: "", notes: ""
  });

  const handleAddRx = () => {
    if (!newRx.name) return;
    
    const rxObj = {
      id: `RX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      doctor: "Current Doctor",
      medications: [
        { 
          name: newRx.name, 
          dosage: newRx.dosage || "1 tablet", 
          frequency: newRx.frequency || "Once daily", 
          duration: newRx.duration || "7 days" 
        }
      ],
      notes: newRx.notes
    };
    
    setPrescriptions([rxObj, ...prescriptions]);
    setOpen(false);
    setNewRx({ name: "", dosage: "", frequency: "", duration: "", notes: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">E-Prescriptions</h3>
          <p className="text-sm text-gray-500">View and generate medical prescriptions.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md text-white shadow-sm" />}>
            <Plus className="w-4 h-4 mr-2" /> New Rx
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Medication Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Amoxicillin 500mg" 
                  value={newRx.name} 
                  onChange={(e) => setNewRx({...newRx, name: e.target.value})}
                  className="rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage" className="text-sm font-semibold">Dosage</Label>
                  <Input 
                    id="dosage" 
                    placeholder="e.g. 1 tablet" 
                    value={newRx.dosage} 
                    onChange={(e) => setNewRx({...newRx, dosage: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-semibold">Duration</Label>
                  <Input 
                    id="duration" 
                    placeholder="e.g. 7 days" 
                    value={newRx.duration} 
                    onChange={(e) => setNewRx({...newRx, duration: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-semibold">Frequency</Label>
                <Input 
                  id="frequency" 
                  placeholder="e.g. Every 8 hours" 
                  value={newRx.frequency} 
                  onChange={(e) => setNewRx({...newRx, frequency: e.target.value})}
                  className="rounded-xl bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold">Doctor's Instructions</Label>
                <Input 
                  id="notes" 
                  placeholder="Take with food..." 
                  value={newRx.notes} 
                  onChange={(e) => setNewRx({...newRx, notes: e.target.value})}
                  className="rounded-xl bg-gray-50/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleAddRx} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">Generate Rx</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="border-0 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Pill className="w-24 h-24 text-emerald-500" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 leading-none">Prescription {rx.id}</h4>
                    <p className="text-xs text-gray-500 mt-1">{rx.date} · Prescribed by {rx.doctor}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200">
                  <Printer className="w-4 h-4 mr-2" /> Print Rx
                </Button>
              </div>

              <div className="space-y-4 mb-4">
                {rx.medications.map((med, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{med.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{med.dosage} · {med.frequency}</p>
                    </div>
                    <Badge variant="secondary" className="mt-2 sm:mt-0 bg-white border-gray-200 text-gray-600 rounded-md">
                      {med.duration}
                    </Badge>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">Doctor's Instructions</p>
                  <p className="text-sm text-amber-900">{rx.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
