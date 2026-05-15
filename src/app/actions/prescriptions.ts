'use server'

import { prisma } from "@/lib/prisma"
import { resolveTenantContext } from '@/lib/tenant-context'
import { revalidatePath } from 'next/cache'
import { requirePermission } from "@/lib/rbac";
import { requireRecordAccess } from "@/lib/abac";
import { PermissionCode } from "@/types/permissions";

import { wrapAction } from "@/lib/observability/wrap-action";

/**
 * Server Action: Fetches all prescriptions for a patient.
 */
export async function getPrescriptions(patientId: string) {
  const { tenantId } = await resolveTenantContext()
  await requirePermission(PermissionCode.PATIENT_VIEW);
  await requireRecordAccess('patient', patientId);
  
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

/**
 * Server Action: Creates a new prescription.
 */
export const createPrescription = wrapAction(
  'PRESCRIPTION_CREATE',
  async (patientId: string, data: {
    notes?: string,
    doctorName?: string,
    doctorId?: string,
    items: {
      medicationName: string,
      dosage?: string,
      frequency?: string,
      duration?: string
    }[]
  }) => {
    const { tenantId } = await resolveTenantContext()
    await requirePermission(PermissionCode.CLINICAL_PRESCRIPTION_MANAGE);
    await requireRecordAccess('patient', patientId);

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
    return prescription;
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);

/**
 * Server Action: Deletes a prescription.
 */
export const deletePrescription = wrapAction(
  'PRESCRIPTION_DELETE',
  async (id: string, patientId: string) => {
    const { tenantId } = await resolveTenantContext()
    await requirePermission(PermissionCode.CLINICAL_PRESCRIPTION_MANAGE);
    await requireRecordAccess('patient', patientId);

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
    return { success: true };
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);

/**
 * Server Action: Duplicates an existing prescription.
 */
export const duplicatePrescription = wrapAction(
  'PRESCRIPTION_DUPLICATE',
  async (id: string, patientId: string) => {
    const { tenantId } = await resolveTenantContext()
    await requirePermission(PermissionCode.CLINICAL_PRESCRIPTION_MANAGE);
    await requireRecordAccess('patient', patientId);

    const source = await prisma.prescription.findUnique({
      where: { id, tenantId },
      include: { items: true }
    })

    if (!source) throw new Error('Prescription not found');

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
    return newPrescription;
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);

