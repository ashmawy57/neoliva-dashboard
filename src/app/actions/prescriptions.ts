'use server'

import { prisma } from "@/lib/prisma"
import { resolveTenantContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'

export async function getPrescriptions(patientId: string) {
  const tenantId = await resolveTenantContext()
  
  return prisma.prescription.findMany({
    where: {
      tenantId,
      patientId
    },
    include: {
      items: true,
      doctor: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createPrescription(patientId: string, data: {
  notes?: string,
  doctorName?: string,
  doctorId?: string,
  items: {
    medicationName: string,
    dosage?: string,
    frequency?: string,
    duration?: string
  }[]
}) {
  const tenantId = await resolveTenantContext()

  try {
    const prescription = await prisma.prescription.create({
      data: {
        tenantId,
        patientId,
        notes: data.notes,
        doctorName: data.doctorName,
        doctorId: data.doctorId,
        items: {
          create: data.items.map(item => ({
            ...item,
            tenantId
          }))
        }
      },
      include: {
        items: true
      }
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true, data: prescription }
  } catch (error) {
    console.error('Failed to create prescription:', error)
    return { success: false, error: 'Failed to create prescription' }
  }
}

export async function deletePrescription(id: string, patientId: string) {
  const tenantId = await resolveTenantContext()

  try {
    // Delete items first if not using cascade delete in prisma (checking schema...)
    // Schema shows: prescription Prescription @relation(fields: [prescriptionId], references: [id], onDelete: NoAction, onUpdate: NoAction)
    // So we need to delete items manually or update schema. For now, manual.
    
    await prisma.prescriptionItem.deleteMany({
      where: {
        prescriptionId: id,
        tenantId
      }
    })

    await prisma.prescription.delete({
      where: {
        id,
        tenantId
      }
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete prescription:', error)
    return { success: false, error: 'Failed to delete prescription' }
  }
}

export async function duplicatePrescription(id: string, patientId: string) {
  const tenantId = await resolveTenantContext()

  try {
    const source = await prisma.prescription.findUnique({
      where: { id, tenantId },
      include: { items: true }
    })

    if (!source) return { success: false, error: 'Prescription not found' }

    const newPrescription = await prisma.prescription.create({
      data: {
        tenantId,
        patientId,
        notes: source.notes,
        doctorName: source.doctorName,
        doctorId: source.doctorId,
        items: {
          create: source.items.map(item => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            tenantId
          }))
        }
      }
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true, data: newPrescription }
  } catch (error) {
    console.error('Failed to duplicate prescription:', error)
    return { success: false, error: 'Failed to duplicate prescription' }
  }
}
