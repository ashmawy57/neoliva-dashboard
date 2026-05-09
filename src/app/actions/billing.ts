'use server'

import { PatientService } from "@/services/patient.service"
import { resolveTenantContext } from "@/lib/tenant-context"
import { revalidatePath } from 'next/cache'

const patientService = new PatientService()

export async function createInvoice(patientId: string, invoiceData: {
  amount: number;
  treatment: string;
  dueDate?: Date;
  items: { name: string; amount: number }[];
}) {
  const tenantId = await resolveTenantContext()
  try {
    const data = await patientService.createInvoice(tenantId, patientId, {
      ...invoiceData,
      status: 'PENDING'
    })
    revalidatePath(`/patients/${patientId}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    return { success: false, error: error.message }
  }
}

export async function addPayment(patientId: string, invoiceId: string, paymentData: {
  amount: number;
  method: string;
  notes?: string;
  date?: Date;
}) {
  const tenantId = await resolveTenantContext()
  try {
    const data = await patientService.addPayment(tenantId, invoiceId, paymentData)
    revalidatePath(`/patients/${patientId}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error adding payment:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteInvoice(patientId: string, invoiceId: string) {
  const tenantId = await resolveTenantContext()
  try {
    await patientService.deleteInvoice(tenantId, invoiceId)
    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting invoice:", error)
    return { success: false, error: error.message }
  }
}
