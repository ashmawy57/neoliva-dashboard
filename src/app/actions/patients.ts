'use server'

import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from 'next/cache'
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { requireRecordAccess } from "@/lib/abac";
import { EventService } from "@/services/event.service";

const patientService = new PatientService();
import { wrapAction } from "@/lib/observability/wrap-action";


function getInitials(name: string) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function getPatients() {
  await requirePermission(PermissionCode.PATIENT_VIEW);
  const { tenantId } = await resolveTenantContext();
  return patientService.getPatientsList(tenantId);
}

export const createPatient = wrapAction(
  'PATIENT_CREATE',
  async (formData: FormData) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.PATIENT_CREATE);
    
    const rawFormData = Object.fromEntries(formData.entries());

    const name = rawFormData.name as string
    const phone = rawFormData.phone1 as string

    if (!name || !phone) {
      throw new Error('Missing name or phone')
    }

    const initials = getInitials(name)
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-600'
    ]

    const patientData = {
      displayId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name,
      phone: phone,
      phone2: rawFormData.phone2 as string || null,
      email: rawFormData.email as string || null,
      address: rawFormData.address as string || null,
      postCode: rawFormData.postCode as string || null,
      city: rawFormData.city as string || null,
      dob: rawFormData.dob ? new Date(rawFormData.dob as string) : null,
      gender: rawFormData.gender as string || null,
      maritalStatus: rawFormData.maritalStatus as string || null,
      occupation: rawFormData.occupation as string || null,
      insurance: rawFormData.insurance as string || null,
      ssn: rawFormData.ssn as string || null,
      idNumber: rawFormData.idNumber as string || null,
      medicalAlert: rawFormData.medicalAlert as string || null,
      referredBy: rawFormData.referredBy as string || null,
      notes: rawFormData.notes as string || null,
      isDeceased: rawFormData.isDeceased === 'true',
      isSigned: rawFormData.isSigned === 'true',
      avatarInitials: initials,
      colorGradient: gradients[Math.floor(Math.random() * gradients.length)],
      status: 'Active'
    }

    const patient = await patientService.createPatient(tenantId, patientData);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CREATED',
      entityType: 'PATIENT',
      entityId: patient.id,
      metadata: { 
        name: patient.name, 
        displayId: patient.displayId,
        referredBy: patient.referredBy,
        insurance: patient.insurance 
      }
    });

    revalidatePath('/patients');
    return { id: patient.id };
  },
  { module: 'patients', entityType: 'PATIENT' }
);


export const updatePatient = wrapAction(
  'PATIENT_UPDATE',
  async (id: string, formData: FormData) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.PATIENT_EDIT);
    await requireRecordAccess('patient', id);
    
    const rawFormData = Object.fromEntries(formData.entries());

    const updates: any = {
      name: rawFormData.name as string,
      phone: rawFormData.phone1 as string,
      phone2: rawFormData.phone2 as string || null,
      email: rawFormData.email as string || null,
      address: rawFormData.address as string || null,
      postCode: rawFormData.postCode as string || null,
      city: rawFormData.city as string || null,
      dob: rawFormData.dob ? new Date(rawFormData.dob as string) : null,
      gender: rawFormData.gender as string || null,
      maritalStatus: rawFormData.maritalStatus as string || null,
      occupation: rawFormData.occupation as string || null,
      insurance: rawFormData.insurance as string || null,
      ssn: rawFormData.ssn as string || null,
      idNumber: rawFormData.idNumber as string || null,
      medicalAlert: rawFormData.medicalAlert as string || null,
      referredBy: rawFormData.referredBy as string || null,
      notes: rawFormData.notes as string || null,
      bloodGroup: rawFormData.bloodGroup as string || null,
      medicalNotes: rawFormData.medicalNotes as string || null,
      isDeceased: rawFormData.isDeceased === 'true',
      updatedAt: new Date()
    };

    const data = await patientService.updatePatient(tenantId, id, updates);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_UPDATED',
      entityType: 'PATIENT',
      entityId: id,
      metadata: { fields: Object.keys(updates) }
    });

    revalidatePath('/patients');
    revalidatePath(`/patients/${id}`);
    return { id, updates: Object.keys(updates) };
  },
  { module: 'patients', entityType: 'PATIENT' }
);


export const deletePatient = wrapAction(
  'PATIENT_DELETE',
  async (id: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.PATIENT_DELETE);
    await requireRecordAccess('patient', id);
    
    await patientService.deletePatient(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_DELETED',
      entityType: 'PATIENT',
      entityId: id,
    });

    revalidatePath('/patients');
    return { id };
  },
  { module: 'patients', entityType: 'PATIENT' }
);


export async function getPatientById(id: string) {
  if (!id) return null;
  await requirePermission(PermissionCode.PATIENT_VIEW);
  const { tenantId } = await resolveTenantContext();
  await requireRecordAccess('patient', id);
  
  return patientService.getPatientProfile(tenantId, id);
}

export const updateOralCondition = wrapAction(
  'PATIENT_ORAL_CONDITION_UPDATE',
  async (patientId: string, name: string, active: boolean) => {
    await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    await patientService.updateOralCondition(tenantId, patientId, name, active);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CHART_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'OralCondition', name, active }
    });

    revalidatePath(`/patients/${patientId}`);
    return { patientId, name, active };
  },
  { module: 'clinical', entityType: 'PATIENT' }
);


export const updateOralTissue = wrapAction(
  'PATIENT_ORAL_TISSUE_UPDATE',
  async (patientId: string, tissue: string, status: string, notes: string) => {
    await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    await patientService.updateOralTissue(tenantId, patientId, tissue, status, notes);

    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CHART_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'OralTissue', tissue, status }
    });

    revalidatePath(`/patients/${patientId}`);
    return { patientId, tissue, status };
  },
  { module: 'clinical', entityType: 'PATIENT' }
);


export const addVisitRecord = wrapAction(
  'CLINICAL_VISIT_CREATE',
  async (patientId: string, visit: any) => {
    await requirePermission(PermissionCode.CLINICAL_NOTES_EDIT);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    const data = await patientService.addVisitRecord(tenantId, patientId, {
      date: visit.date ? new Date(visit.date) : new Date(),
      doctor: visit.doctor,
      treatment: visit.treatment,
      notes: visit.notes,
      tooth: visit.tooth
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'CLINICAL_NOTE_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { doctor: visit.doctor, treatment: visit.treatment }
    });

    revalidatePath(`/patients/${patientId}`);
    return { patientId, visitId: data.id };
  },
  { module: 'clinical', entityType: 'PATIENT' }
);


export async function deleteVisitRecord(patientId: string, visitId: string) {
  await requirePermission(PermissionCode.CLINICAL_NOTES_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteVisitRecord(tenantId, visitId);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'CLINICAL_NOTE_ADDED', // Or create a DELETED one, but for now we track the action
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', visitId }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting visit record:', error);
    return { success: false, error: error.message };
  }
}

export const updateToothCondition = wrapAction(
  'PATIENT_TOOTH_UPDATE',
  async (patientId: string, toothNumber: number, condition: string, isMissing: boolean, notes: string) => {
    await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    await patientService.updateToothCondition(tenantId, patientId, toothNumber, condition, isMissing, notes);

    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CHART_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'ToothCondition', toothNumber, condition }
    });

    revalidatePath(`/patients/${patientId}`);
    return { patientId, toothNumber, condition };
  },
  { module: 'clinical', entityType: 'PATIENT' }
);


export async function updatePatientNotes(patientId: string, notes: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, { notes });
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { fields: ['notes'] }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patient notes:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadToothPhoto(patientId: string, toothNumber: number, formData: FormData) {
  await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${tenantId}/${patientId}/teeth/${toothNumber}/${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from('patient-photos').getPublicUrl(path);

    const doc = await patientService.addDocument(tenantId, patientId, {
      name: `tooth-${toothNumber}-${file.name}`,
      type: `TOOTH_PHOTO_${toothNumber}`,
      fileUrl: urlData.publicUrl,
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'DOCUMENT_UPLOADED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'TOOTH_PHOTO', toothNumber }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true, document: doc };
  } catch (error: any) {
    console.error('Error uploading tooth photo:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteToothPhoto(patientId: string, documentId: string, fileUrl: string) {
  await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    try {
      const url = new URL(fileUrl);
      const storagePath = url.pathname.split('/patient-photos/')[1];
      if (storagePath) {
        await supabase.storage.from('patient-photos').remove([storagePath]);
      }
    } catch {
      // Storage cleanup failed — log but continue to remove DB record
      console.warn('Storage file removal failed for:', fileUrl);
    }

    await patientService.deleteDocument(tenantId, documentId);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'DOCUMENT_UPLOADED', // Tracking the action on the entity
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', documentId }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting tooth photo:', error);
    return { success: false, error: error.message };
  }
}


export async function updatePeriodontalMeasurement(patientId: string, measurement: any) {
  await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.updatePeriodontalMeasurement(tenantId, patientId, {
      toothNumber: measurement.toothNumber,
      parameterName: measurement.parameterName,
      buccalValues: measurement.buccalValues,
      lingualValues: measurement.lingualValues,
      singleValue: measurement.singleValue ?? null,
      measurementDate: measurement.date ? new Date(measurement.date) : new Date()
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CHART_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'Periodontal', toothNumber: measurement.toothNumber, parameter: measurement.parameterName }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating periodontal measurement:', error);
    return { success: false, error: error.message };
  }
}

export async function clearPeriodontalMeasurements(patientId: string) {
  await requirePermission(PermissionCode.CLINICAL_CHART_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.clearPeriodontalMeasurements(tenantId, patientId);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_CHART_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { type: 'Periodontal', action: 'CLEARED' }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing periodontal measurements:', error);
    return { success: false, error: error.message };
  }
}


export async function addMedicalCondition(
  patientId: string, 
  condition: { name: string; status: string; diagnosed?: string; notes?: string }
) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  if (!patientId || !condition?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and condition name are required' }
  }
  
  try {
    await patientService.addMedicalCondition(tenantId, patientId, {
      conditionName: condition.name.trim(),
      status: condition.status,
      diagnosedDate: condition.diagnosed ? new Date(condition.diagnosed) : null,
      notes: condition.notes?.trim() || null
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'MEDICAL_CONDITION_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { condition: condition.name.trim(), status: condition.status }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding condition:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMedicalCondition(id: string, patientId: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteMedicalCondition(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'MEDICAL_CONDITION_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', conditionId: id }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting condition:', error);
    return { success: false, error: error.message };
  }
}

export async function addAllergy(
  patientId: string, 
  allergy: { name: string; severity: string; reaction?: string; notes?: string }
) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  if (!patientId || !allergy?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and allergy name are required' }
  }

  try {
    await patientService.addAllergy(tenantId, patientId, {
      allergen: allergy.name.trim(),
      severity: allergy.severity,
      reaction: allergy.reaction?.trim() || null,
      notes: allergy.notes?.trim() || null
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'ALLERGY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { allergen: allergy.name.trim(), severity: allergy.severity }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding allergy:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAllergy(id: string, patientId: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteAllergy(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'ALLERGY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', allergyId: id }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting allergy:', error);
    return { success: false, error: error.message };
  }
}

export async function addMedication(
  patientId: string, 
  med: { name: string; dosage?: string; frequency?: string; prescribedFor?: string }
) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  if (!patientId || !med?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and medication name are required' }
  }

  try {
    await patientService.addMedication(tenantId, patientId, {
      medicationName: med.name.trim(),
      dosage: med.dosage?.trim() || null,
      frequency: med.frequency?.trim() || null,
      notes: med.prescribedFor?.trim() || null
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'MEDICATION_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { medication: med.name.trim(), dosage: med.dosage }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding medication:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMedication(id: string, patientId: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteMedication(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'MEDICATION_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', medicationId: id }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting medication:', error);
    return { success: false, error: error.message };
  }
}

export async function addSurgery(
  patientId: string, 
  surgery: { name: string; date?: string; notes?: string }
) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  if (!patientId || !surgery?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and surgery name are required' }
  }

  try {
    await patientService.addSurgery(tenantId, patientId, {
      surgeryName: surgery.name.trim(),
      surgeryDate: surgery.date ? new Date(surgery.date) : null,
      notes: surgery.notes?.trim() || null
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'SURGERY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { surgery: surgery.name.trim(), date: surgery.date }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding surgery:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSurgery(id: string, patientId: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteSurgery(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'SURGERY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', surgeryId: id }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting surgery:', error);
    return { success: false, error: error.message };
  }
}

export async function addFamilyHistory(
  patientId: string, 
  history: { condition: string; relation?: string }
) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  if (!patientId || !history?.condition?.trim()) {
    return { success: false, error: 'Valid patient ID and condition name are required' }
  }

  try {
    await patientService.addFamilyHistory(tenantId, patientId, {
      conditionName: history.condition.trim(),
      relation: history.relation?.trim() || null
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'FAMILY_HISTORY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { condition: history.condition.trim(), relation: history.relation }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding family history:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFamilyHistory(id: string, patientId: string) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deleteFamilyHistory(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'FAMILY_HISTORY_ADDED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', historyId: id }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting family history:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePatientVitals(patientId: string, vitals: any) {
  await requirePermission(PermissionCode.PATIENT_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, {
      bloodGroup: vitals.bloodType,
      smokingStatus: vitals.smoking,
      alcoholUse: vitals.alcohol
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { fields: ['bloodGroup', 'smokingStatus', 'alcoholUse'] }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patient vitals:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGeneralMedicalNotes(patientId: string, notes: string) {
  await requirePermission(PermissionCode.CLINICAL_NOTES_EDIT);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, {
      medicalNotes: notes
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'PATIENT_UPDATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { fields: ['medicalNotes'] }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating medical notes:', error);
    return { success: false, error: error.message };
  }
}

export const addPrescription = wrapAction(
  'PRESCRIPTION_CREATE',
  async (patientId: string, data: { doctor_name: string, notes: string, medications: { name: string, dosage: string, frequency: string, duration: string }[] }) => {
    await requirePermission(PermissionCode.CLINICAL_PRESCRIPTION_MANAGE);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    if (!patientId || !data.medications || data.medications.length === 0) {
      throw new Error("Missing required prescription data");
    }

    const rx = await patientService.addPrescription(tenantId, patientId, {
      doctorName: data.doctor_name,
      notes: data.notes,
      items: data.medications.map(med => ({
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        tenantId
      }))
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'PRESCRIPTION_CREATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { doctorName: data.doctor_name, itemCount: data.medications.length }
    });

    revalidatePath(`/patients/${patientId}`);
    return { rxId: rx.id };
  },
  { module: 'clinical', entityType: 'PRESCRIPTION' }
);


export async function addPatientDocument(patientId: string, documentData: { name: string; type: string; file_url: string }) {
  await requirePermission(PermissionCode.PATIENT_DOCUMENT_MANAGE);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    const data = await patientService.addDocument(tenantId, patientId, {
      name: documentData.name,
      type: documentData.type,
      fileUrl: documentData.file_url,
      uploadDate: new Date()
    });

    await EventService.trackEvent({
      tenantId,
      eventType: 'DOCUMENT_UPLOADED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { name: documentData.name, type: documentData.type }
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error adding patient document:", error);
    return { success: false, error: error.message };
  }
}

export const updateInvoiceStatus = wrapAction(
  'INVOICE_STATUS_UPDATE',
  async (invoiceId: string, status: string, patientId: string) => {
    await requirePermission(PermissionCode.BILLING_INVOICE_EDIT);
    await requireRecordAccess('patient', patientId);
    const { tenantId } = await resolveTenantContext();
    
    await patientService.updateInvoiceStatus(tenantId, invoiceId, status);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVOICE_UPDATED',
      entityType: 'INVOICE',
      entityId: invoiceId,
      metadata: { status, patientId }
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);
    return { invoiceId, status };
  },
  { module: 'billing', entityType: 'INVOICE' }
);



export async function deletePrescription(id: string, patientId: string) {
  await requirePermission(PermissionCode.CLINICAL_PRESCRIPTION_MANAGE);
  await requireRecordAccess('patient', patientId);
  const { tenantId } = await resolveTenantContext();
  try {
    await patientService.deletePrescription(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'PRESCRIPTION_CREATED',
      entityType: 'PATIENT',
      entityId: patientId,
      metadata: { action: 'DELETED', prescriptionId: id, doctorName: 'N/A', itemCount: 0 }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting prescription:", error);
    return { success: false, error: error.message };
  }
}

