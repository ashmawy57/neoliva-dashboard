'use client'

import { PrescriptionList } from './prescriptions/PrescriptionList'

export function Prescriptions({ 
  patientId, 
  initialData = [], 
  patientName = "Patient",
  onRefresh
}: { 
  patientId: string, 
  initialData?: any[],
  patientName?: string,
  onRefresh?: () => void
}) {
  return (
    <PrescriptionList 
      patientId={patientId} 
      prescriptions={initialData} 
      patientName={patientName} 
      onRefresh={onRefresh}
    />
  )
}
