'use client'

import React from 'react'
import { Pill, Phone, MapPin, Globe, Activity } from 'lucide-react'

interface PrescriptionPrintProps {
  prescription: any
  patientName: string
}

export function PrescriptionPrint({ prescription, patientName }: PrescriptionPrintProps) {
  if (!prescription) return null

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-lg print:shadow-none print:m-0 print:p-[10mm] relative flex flex-col font-sans text-gray-900 border border-gray-100 print-rx">
      
      {/* Clinic Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">NEOLIVA <span className="text-blue-500 font-light">DENTAL</span></h1>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Premium Dental Care & Implantology</p>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-lg font-bold text-gray-900">Dr. {prescription.doctorName || prescription.doctor?.name || 'Ahmed Ashmawy'}</h2>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Orthodontist & Oral Surgeon</p>
          <div className="flex flex-col gap-1 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center justify-end gap-1"><MapPin className="w-3 h-3" /> 123 Dental St, Clinic Tower, Cairo</span>
            <span className="flex items-center justify-end gap-1"><Phone className="w-3 h-3" /> +20 123 456 7890</span>
            <span className="flex items-center justify-end gap-1"><Globe className="w-3 h-3" /> www.neoliva.com</span>
          </div>
        </div>
      </div>

      {/* Patient & Date Info */}
      <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</p>
          <p className="text-base font-bold text-gray-900">{patientName}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prescription Date</p>
          <p className="text-base font-bold text-gray-900">{new Date(prescription.date || prescription.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* RX Icon Section */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-5xl font-serif font-black text-blue-600 italic">Rx</span>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
      </div>

      {/* Medications List */}
      <div className="flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</th>
              <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medication & Strength</th>
              <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dosage</th>
              <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequency</th>
              <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.items.map((item: any, idx: number) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-5 text-sm font-bold text-blue-600 w-8">{idx + 1}.</td>
                <td className="py-5">
                  <p className="text-base font-bold text-gray-900">{item.medicationName}</p>
                </td>
                <td className="py-5">
                  <p className="text-sm text-gray-600 font-medium">{item.dosage}</p>
                </td>
                <td className="py-5">
                  <p className="text-sm text-gray-600 font-medium">{item.frequency}</p>
                </td>
                <td className="py-5 text-right">
                  <p className="text-sm font-bold text-gray-900">{item.duration}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prescription.notes && (
          <div className="mt-12 p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Special Instructions</h4>
            <p className="text-sm text-gray-700 leading-relaxed italic">{prescription.notes}</p>
          </div>
        )}
      </div>

      {/* Footer / Signature */}
      <div className="mt-auto pt-10 flex justify-between items-end">
        <div className="text-[10px] text-gray-400 max-w-[300px]">
          <p className="font-bold mb-1 uppercase tracking-widest text-gray-300">Disclaimer</p>
          <p>This is a computer-generated prescription. Please consult your dentist if you experience any side effects. Validity 30 days from date of issue.</p>
        </div>
        <div className="text-center w-[200px]">
          <div className="h-[1px] bg-gray-200 mb-2"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Doctor's Signature & Stamp</p>
          <div className="w-24 h-24 border-2 border-blue-100 rounded-full mx-auto opacity-20 flex items-center justify-center">
            <Pill className="w-10 h-10 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Arabic Version Hint (Optional) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
        <h1 className="text-[150px] font-black uppercase">Prescription</h1>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-rx, .print-rx * {
            visibility: visible;
          }
          .print-rx {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
export default PrescriptionPrint
