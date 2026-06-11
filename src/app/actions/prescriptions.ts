'use server'

import { withPermission } from "@/lib/rbac/guard";


import { PrescriptionRepository } from "@/repositories/prescription.repository"

import { revalidatePath } from 'next/cache'

import { requireRecordAccess } from "@/lib/abac";


import { wrapAction } from "@/lib/observability/wrap-action";

const prescriptionRepository = new PrescriptionRepository();

/**
 * Server Action: Fetches all prescriptions for a patient.
 */
export async function getPrescriptions(patientId: string) {
  return withPermission('clinical', 'read', async (session) => {
    const tenantId = session.tenantId;
    await requireRecordAccess('patient', patientId);
      
      return prescriptionRepository.findMany(tenantId, patientId);
  });
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
    return withPermission('clinical', 'create', async (session) => {
      const tenantId = session.tenantId;
      await requireRecordAccess('patient', patientId);
      
          const prescription = await prescriptionRepository.create(tenantId, patientId, data);
      
          revalidatePath(`/patients/${patientId}`)
          return prescription;
    });
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);

/**
 * Server Action: Deletes a prescription.
 */
export const deletePrescription = wrapAction(
  'PRESCRIPTION_DELETE',
  async (id: string, patientId: string) => {
    return withPermission('clinical', 'delete', async (session) => {
      const tenantId = session.tenantId;
      await requireRecordAccess('patient', patientId);
      
          await prescriptionRepository.delete(tenantId, id);
      
          revalidatePath(`/patients/${patientId}`)
          return { success: true, error: undefined };
    });
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);

/**
 * Server Action: Duplicates an existing prescription.
 */
export const duplicatePrescription = wrapAction(
  'PRESCRIPTION_DUPLICATE',
  async (id: string, patientId: string) => {
    return withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await requireRecordAccess('patient', patientId);
      
          const source = await prescriptionRepository.findUnique(tenantId, id);
      
          if (!source) throw new Error('Prescription not found');
      
          const newPrescription = await prescriptionRepository.create(tenantId, patientId, {
            notes: source.notes || undefined,
            doctorName: source.doctorName || undefined,
            doctorId: source.doctorId || undefined,
            items: source.items.map(item => ({
              medicationName: item.medicationName,
              dosage: item.dosage || undefined,
              frequency: item.frequency || undefined,
              duration: item.duration || undefined
            }))
          });
      
          revalidatePath(`/patients/${patientId}`)
          return newPrescription;
    });
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);


