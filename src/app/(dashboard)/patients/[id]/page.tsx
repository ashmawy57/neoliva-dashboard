"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, Mail, Calendar as CalendarIcon, MapPin, Activity,
  FileText, Heart, Stethoscope, ArrowLeft, Image as ImageIcon, Pill, LayoutDashboard, ClipboardList, Smile, Lightbulb, MessageSquare, Plus
} from "lucide-react";
import Link from "next/link";
import { ToothChart } from "@/components/patients/ToothChart";
import { Periodontogram } from "@/components/patients/Periodontogram";
import { TreatmentPlans } from "@/components/patients/TreatmentPlans";
import { Prescriptions } from "@/components/patients/Prescriptions";
import { PatientDocuments } from "@/components/patients/PatientDocuments";

const visits = [
  { date: "Mar 15, 2024", treatment: "Root Canal Treatment", doctor: "Dr. Smith", notes: "Completed successful RCT on tooth #14. Prescribed Amoxicillin 500mg x 7 days.", tooth: "#14" },
  { date: "Feb 20, 2024", treatment: "Panoramic X-Ray & Examination", doctor: "Dr. Adams", notes: "Patient reported sensitivity to hot/cold. Full mouth X-rays taken. Identified cavity on #14.", tooth: "Full" },
  { date: "Jan 05, 2024", treatment: "Routine Cleaning & Polishing", doctor: "Dr. Lee", notes: "Standard prophylaxis. Gum health excellent. Next cleaning in 6 months.", tooth: "All" },
];

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [showInvoices, setShowInvoices] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-gray-500 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                EJ
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Emily Johnson</h1>
                <p className="text-sm text-gray-500">Patient ID: {resolvedParams.id} · Registered since Jan 2023</p>
              </div>
            </div>
            <Badge className="sm:ml-auto bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold w-fit">
              ● Active Patient
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+1 234-567-8900" },
                { icon: Mail, label: "Email", value: "emily.j@example.com" },
                { icon: CalendarIcon, label: "Date of Birth", value: "Jan 15, 1992 (32 years)" },
                { icon: MapPin, label: "Address", value: "123 Oak Avenue, Suite 400\nNew York, NY 10001" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
            <CardContent className="pt-5 pb-4">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Activity className="w-3.5 h-3.5" /> Allergies & Alerts
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="destructive" className="rounded-full text-xs">Penicillin</Badge>
                <Badge className="rounded-full text-xs bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Latex</Badge>
                <Badge variant="outline" className="rounded-full text-xs">Aspirin (mild)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Visits", value: "12" },
                  { label: "Outstanding", value: "$450" },
                  { label: "Last X-Ray", value: "Feb 2024" },
                  { label: "Insurance", value: "Delta" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-gray-50 text-center">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-[repeat(9,1fr)] gap-1">
              {[
                { value: "history", label: "History", icon: Stethoscope },
                { value: "medicalHistory", label: "Medical History", icon: ClipboardList },
                { value: "oralExamination", label: "Oral Exam", icon: Smile },
                { value: "odontogram", label: "Tooth Chart", icon: LayoutDashboard },
                { value: "periodontogram", label: "Periodonto", icon: Activity },
                { value: "plan", label: "Plans", icon: FileText },
                { value: "prescriptions", label: "Rx", icon: Pill },
                { value: "documents", label: "Documents", icon: ImageIcon },
                { value: "billing", label: "Billing", icon: FileText },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium py-2"
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="history" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="relative pl-6 border-l-2 border-blue-100 space-y-8">
                    {visits.map((visit, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 border-4 border-white" />
                        <div className="p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">{visit.treatment}</h3>
                            <Badge variant="outline" className="text-[10px] w-fit rounded-full">Tooth {visit.tooth}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{visit.date} · {visit.doctor}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{visit.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medicalHistory" className="mt-6 animate-fade-in-up">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" /> Medical Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hypertension</p>
                        <p className="text-xs text-gray-500">Diagnosed: 2018</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Controlled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Type 2 Diabetes</p>
                        <p className="text-xs text-gray-500">Diagnosed: 2020</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Managed</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" /> Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                         <Activity className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-900">Penicillin</p>
                        <p className="text-xs text-red-700 mt-0.5">Severe reaction (Anaphylaxis)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                         <Activity className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">Latex</p>
                        <p className="text-xs text-amber-700 mt-0.5">Mild skin irritation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm md:col-span-2">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-purple-500" /> Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                           <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Lisinopril 10mg</p>
                          <p className="text-xs text-gray-500 mt-1">1 tablet daily (Blood Pressure)</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                           <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Metformin 500mg</p>
                          <p className="text-xs text-gray-500 mt-1">Twice daily with meals (Diabetes)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="oralExamination" className="mt-6 animate-fade-in-up space-y-6">
              {/* Soft Tissue Examination */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-blue-500" /> Soft Tissue Examination
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { name: 'Salivary Glands', status: 'pathological', color: 'bg-red-500 text-white border-red-600' },
                    { name: 'Mucosa', status: 'healthy', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                    { name: 'Palate', status: 'needs attention', color: 'bg-blue-500 text-white border-blue-600' },
                    { name: 'Occlusion', status: 'needs attention', color: 'bg-blue-500 text-white border-blue-600' },
                    { name: 'Gingiva', status: 'needs attention', color: 'bg-blue-500 text-white border-blue-600' },
                    { name: 'Tongue', status: 'needs attention', color: 'bg-blue-500 text-white border-blue-600' },
                    { name: 'Lips', status: 'healthy', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <div className={`px-4 py-1 rounded-full text-xs font-semibold border ${item.color} w-32 text-center`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Diseases and conditions */}
              <Card className="border-0 shadow-sm bg-orange-50/50">
                <CardHeader className="pb-3 border-b border-orange-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                    Diseases and conditions of the mouth
                  </CardTitle>
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-center text-gray-700 font-medium shadow-sm">Erosion</div>
                     <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-center text-gray-700 font-medium shadow-sm">Gingivitis</div>
                     <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-center text-gray-700 font-medium shadow-sm">Herpes</div>
                     <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-center text-gray-700 font-medium shadow-sm">Xerostomia</div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="link" className="text-blue-600 text-xs gap-1 h-auto p-0 font-medium">
                      Manage the oral conditions list <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ml-1"><Plus className="w-3 h-3" /></div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Other Conditions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Other disease/health condition:
                  </CardTitle>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-600 transition">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm justify-start text-gray-500 flex gap-2 w-full min-h-[100px] cursor-text">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    note any important information regarding the patient's oral health
                  </div>
                </CardContent>
              </Card>

              {/* Diagnoses and prescriptions Buttons */}
              <div className="space-y-3 pt-2">
                 <div className="w-full bg-amber-100/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider py-2.5 text-center rounded-lg border border-amber-200">
                    Diagnoses and prescriptions
                 </div>
                 <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 uppercase tracking-wide">
                    Diagnosis & Chief Complaint
                 </Button>
                 <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 uppercase tracking-wide">
                    Prescription
                 </Button>
              </div>
            </TabsContent>

            <TabsContent value="odontogram" className="mt-6">
              <ToothChart />
            </TabsContent>

            <TabsContent value="periodontogram" className="mt-6">
              <Periodontogram />
            </TabsContent>

            <TabsContent value="plan" className="mt-6">
              <TreatmentPlans />
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-6">
              <Prescriptions />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <PatientDocuments />
            </TabsContent>

            <TabsContent value="billing" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Outstanding Balance</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">$450.00</p>
                      <p className="text-xs text-gray-500 mt-1">2 invoices pending payment</p>
                    </div>
                    <Button 
                       variant="outline" 
                       onClick={() => setShowInvoices(!showInvoices)}
                       className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      {showInvoices ? "Hide Invoices" : "View Invoices"}
                    </Button>
                  </div>

                  {showInvoices && (
                     <div className="space-y-4 animate-fade-in-up">
                       <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Pending Invoices</h3>
                       <div className="grid gap-3">
                         {[
                           { id: "INV-2024-001", date: "Mar 15, 2024", amount: "$300.00", status: "Overdue", treatment: "Root Canal Treatment" },
                           { id: "INV-2024-002", date: "Mar 20, 2024", amount: "$150.00", status: "Due in 5 days", treatment: "Panoramic X-Ray & Exam" }
                         ].map(inv => (
                           <div key={inv.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-blue-100 transition-colors">
                             <div>
                               <div className="flex flex-wrap items-center gap-2 mb-1">
                                 <p className="font-bold text-gray-900">{inv.id}</p>
                                 <Badge variant="outline" className={inv.status === "Overdue" ? "bg-red-50 text-red-600 border-red-200" : "bg-orange-50 text-orange-600 border-orange-200"}>{inv.status}</Badge>
                               </div>
                               <p className="text-sm text-gray-500">{inv.treatment} · {inv.date}</p>
                             </div>
                             <div className="mt-3 sm:mt-0 flex items-center gap-4">
                               <p className="font-bold text-xl text-gray-900">{inv.amount}</p>
                               <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm text-white font-medium px-4">Pay Now</Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
