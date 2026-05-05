"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, Mail, Calendar as CalendarIcon, MapPin, Activity as ActivityIcon,
  FileText, Heart, Stethoscope, ArrowLeft, Image as ImageIcon, Pill, LayoutDashboard, ClipboardList, Smile, Printer, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToothChart } from "@/components/patients/ToothChart";
import { Periodontogram } from "@/components/patients/Periodontogram";
import { TreatmentPlans } from "@/components/patients/TreatmentPlans";
import { Prescriptions } from "@/components/patients/Prescriptions";
import { PatientDocuments } from "@/components/patients/PatientDocuments";
import { OralExam } from "@/components/patients/OralExam";
import { MedicalHistory } from "@/components/patients/MedicalHistory";
import { VisitHistory } from "@/components/patients/VisitHistory";
import { updateInvoiceStatus } from "@/app/actions/patients";

export function PatientProfileContent({ patient: initialPatient }: { patient: any }) {
  const router = useRouter();
  const [showInvoices, setShowInvoices] = useState(false);
  const [patient, setPatient] = useState(initialPatient);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    try {
      const result = await updateInvoiceStatus(invoiceId, 'Paid', patient.id);
      if (result.success) {
        setPatient((prev: any) => {
          const invoiceToUpdate = prev.invoiceHistory?.find((i: any) => i.id === invoiceId);
          return {
            ...prev,
            invoiceHistory: prev.invoiceHistory?.map((inv: any) => 
              inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
            ),
            outstanding: Math.max(0, prev.outstanding - (invoiceToUpdate?.amount || 0))
          };
        });
      } else {
        alert("Failed to pay invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while paying the invoice.");
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const refreshData = () => {
    // In a server component world, we use router.refresh() to update data
    router.refresh();
  };

  const visits = patient.visitHistory || [];

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
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${patient.color} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20`}>
                {patient.avatar}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{patient.name}</h1>
                <p className="text-sm text-gray-500">Patient ID: {patient.id} · Registered since {patient.registeredSince}</p>
              </div>
            </div>
            <Badge className={`sm:ml-auto rounded-full px-3 py-1 text-xs font-semibold w-fit ${
              patient.status === "Active" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              ● {patient.status} Patient
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
                { icon: Phone, label: "Phone", value: patient.phone },
                { icon: Mail, label: "Email", value: patient.email },
                { icon: CalendarIcon, label: "Date of Birth", value: patient.dob },
                { icon: MapPin, label: "Address", value: patient.address },
              ].map((item: any) => (
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

          {(patient.allergies ?? []).length > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
            <CardContent className="pt-5 pb-4">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <ActivityIcon className="w-3.5 h-3.5" /> Allergies & Alerts
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                {patient.allergies.map((allergy: any) => (
                  <Badge 
                    key={allergy.id || allergy.allergen}
                    variant={allergy.severity === "High" ? "destructive" : "default"}
                    className={`rounded-full text-xs ${
                      allergy.severity === "Medium" ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100" : ""
                    }`}
                  >
                    {allergy.allergen || allergy.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Visits", value: String(patient.visits || patient.visitHistory?.length || 0) },
                  { label: "Outstanding", value: `$${Number(patient.outstanding ?? 0).toFixed(2)}` },
                  { label: "Last X-Ray", value: patient.lastXRay || 'None' },
                  { label: "Insurance", value: patient.insurance || 'None' },
                ].map((stat: any) => (
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
          <Tabs defaultValue="history" className="w-full max-w-full min-w-0">
            <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto flex overflow-x-auto w-full justify-start gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { value: "history", label: "History", icon: Stethoscope },
                { value: "medicalHistory", label: "Medical History", icon: ClipboardList },
                { value: "oralExamination", label: "Oral Exam", icon: Smile },
                { value: "odontogram", label: "Tooth Chart", icon: LayoutDashboard },
                { value: "periodontogram", label: "Periodonto", icon: ActivityIcon },
                { value: "plan", label: "Plans", icon: FileText },
                { value: "prescriptions", label: "Rx", icon: Pill },
                { value: "documents", label: "Documents", icon: ImageIcon },
                { value: "billing", label: "Billing", icon: FileText },
              ].map((tab: any) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium py-2 flex-shrink-0 whitespace-nowrap min-w-max px-4"
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="history" className="mt-6">
              <VisitHistory visits={visits} />
            </TabsContent>

            <TabsContent value="medicalHistory" className="mt-6 animate-fade-in-up">
              <MedicalHistory patient={patient} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="oralExamination" className="mt-6 animate-fade-in-up">
              <OralExam patient={patient} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="odontogram" className="mt-6">
              <ToothChart patient={patient} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="periodontogram" className="mt-6">
              <Periodontogram patient={patient} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="plan" className="mt-6">
              <TreatmentPlans patientId={patient.id} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-6">
              <Prescriptions patientId={patient.id} initialData={patient.prescriptions} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <PatientDocuments patientId={patient.id} initialData={patient.patient_documents} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="billing" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Outstanding Balance</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">${Number(patient.outstanding ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">{(patient.invoiceHistory ?? []).length} invoice{(patient.invoiceHistory ?? []).length !== 1 ? "s" : ""} pending payment</p>
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
                       {(patient.invoiceHistory ?? []).length > 0 ? (
                       <div className="grid gap-3">
                         {(patient.invoiceHistory ?? []).map((inv: any) => (
                           <div key={inv.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-blue-100 transition-colors">
                             <div>
                               <div className="flex flex-wrap items-center gap-2 mb-1">
                                 <p className="font-bold text-gray-900">{inv.id}</p>
                                 <Badge variant="outline" className={inv.status === "Overdue" ? "bg-red-50 text-red-600 border-red-200" : "bg-orange-50 text-orange-600 border-orange-200"}>{inv.status}</Badge>
                               </div>
                               <p className="text-sm text-gray-500">{inv.treatment} · {inv.date}</p>
                             </div>
                             <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-3">
                               <p className="font-bold text-xl text-gray-900 mr-2">{inv.amount}</p>
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="rounded-lg shadow-sm border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                 onClick={() => {
                                  const printWindow = window.open('', '_blank');
                                  if (!printWindow) return;
                                  
                                  const htmlContent = `
                                    <html>
                                      <head>
                                        <title>Invoice ${inv.id}</title>
                                        <style>
                                          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
                                          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); font-size: 16px; line-height: 24px; border-radius: 8px; }
                                          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                                          table td { padding: 5px; vertical-align: top; }
                                          table tr td:nth-child(2) { text-align: right; }
                                          table tr.top table td { padding-bottom: 20px; }
                                          table tr.top table td.title { font-size: 38px; line-height: 45px; color: #2563eb; font-weight: 800; text-transform: uppercase; letter-spacing: -1px; }
                                          table tr.information table td { padding-bottom: 40px; }
                                          table tr.heading td { background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-weight: bold; padding: 12px; }
                                          table tr.details td { padding-bottom: 20px; }
                                          table tr.item td { border-bottom: 1px solid #f1f5f9; padding: 12px; }
                                          table tr.item.last td { border-bottom: none; }
                                          table tr.total td:nth-child(2) { border-top: 2px solid #e2e8f0; font-weight: bold; font-size: 20px; padding-top: 15px;}
                                          .status { margin-top: 20px; padding: 10px 15px; background: ${inv.status === 'Overdue' ? '#fef2f2' : '#fff7ed'}; color: ${inv.status === 'Overdue' ? '#ef4444' : '#f97316'}; display: inline-block; border-radius: 6px; font-weight: bold; font-size: 14px; border: 1px solid ${inv.status === 'Overdue' ? '#fecaca' : '#fed7aa'}; }
                                          @media print { .invoice-box { box-shadow: none; border: 0; padding: 0; } }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="invoice-box">
                                          <table cellpadding="0" cellspacing="0">
                                            <tr class="top">
                                              <td colspan="2">
                                                <table><tr>
                                                  <td class="title">SmileCare</td>
                                                  <td style="color: #64748b;">
                                                    <strong>INVOICE #:</strong> ${inv.id}<br /> 
                                                    <strong>Date:</strong> ${inv.date}<br /> 
                                                    <strong>Due Date:</strong> Upon Receipt
                                                  </td>
                                                </tr></table>
                                              </td>
                                            </tr>
                                            <tr class="information">
                                              <td colspan="2">
                                                <table><tr>
                                                  <td style="color: #64748b;"><strong>CLINIC INFO</strong><br />SmileCare Dental Clinic<br /> 123 Main Street<br /> New York, NY 10001<br />+1 800-SMILE-99</td>
                                                  <td style="color: #64748b;"><strong>BILL TO</strong><br />${patient.name}<br /> ${patient.email}<br /> ${patient.phone}<br />${(patient.address ?? '').split('\n')[0]}</td>
                                                </tr></table>
                                              </td>
                                            </tr>
                                            <tr class="heading">
                                              <td>Treatment / Description</td>
                                              <td>Amount</td>
                                            </tr>
                                            <tr class="item last">
                                              <td><strong>${inv.treatment}</strong><br /><span style="font-size: 13px; color: #94a3b8;">Provided by Dr. Sarah Smith</span></td>
                                              <td style="font-weight: 500;">${inv.amount}</td>
                                            </tr>
                                            <tr class="total">
                                              <td></td>
                                              <td>Total: <span style="color: #2563eb;">${inv.amount}</span></td>
                                            </tr>
                                          </table>
                                          <div class="status">Payment Status: ${inv.status}</div>
                                          
                                          <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
                                            Thank you for trusting SmileCare with your dental health.<br/>
                                            For any questions regarding this invoice, please contact billing@smilecare.com.
                                          </div>
                                        </div>
                                        <script>
                                          window.onload = function() { 
                                            setTimeout(function() { 
                                              window.print();
                                            }, 500); 
                                          }
                                        </script>
                                      </body>
                                    </html>
                                  `;
                                  printWindow.document.write(htmlContent);
                                  printWindow.document.close();
                                 }}
                               >
                                 <Printer className="w-4 h-4" /> Print
                               </Button>
                               {inv.status !== 'Paid' && (
                                 <Button 
                                   size="sm" 
                                   className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm text-white font-medium px-4"
                                   onClick={() => handlePayInvoice(inv.id)}
                                   disabled={payingInvoiceId === inv.id}
                                 >
                                   {payingInvoiceId === inv.id ? (
                                     <Loader2 className="w-4 h-4 animate-spin" />
                                   ) : (
                                     "Pay Now"
                                   )}
                                 </Button>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                       ) : (
                         <p className="text-sm text-gray-400 text-center py-6">No pending invoices — all payments are up to date! ✅</p>
                       )}
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
