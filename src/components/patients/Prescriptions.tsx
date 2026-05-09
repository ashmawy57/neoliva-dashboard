'use client'

import { PrescriptionList } from './prescriptions/PrescriptionList'

export function Prescriptions({ 
  patientId, 
  initialData = [], 
  patientName = "Patient" 
}: { 
  patientId: string, 
  initialData?: any[],
  patientName?: string
}) {
  return (
    <PrescriptionList 
      patientId={patientId} 
      prescriptions={initialData} 
      patientName={patientName} 
    />
  )
}
