'use server'

import { PatientService } from "@/services/patient.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from 'next/cache'

const patientService = new PatientService();

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
  const tenantId = await resolveTenantContext();
  const data = await patientService.getAllPatients(tenantId);

  return data.map((patient: any) => {
    const appts = patient.appointments || []
    const nextAppt = appts
      .filter((a: any) => a.date && new Date(a.date) > new Date() && a.status !== 'Cancelled')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

    const lastVisit = appts
      .filter((a: any) => a.date && new Date(a.date) < new Date() && a.status === 'Completed')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return {
      id: patient.id,
      displayId: patient.displayId,
      name: patient.name,
      email: patient.email || '—',
      phone: patient.phone || '—',
      gender: patient.gender,
      lastVisit: lastVisit ? new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits',
      nextAppt: nextAppt ? new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
      status: patient.status || 'Active',
      visits: appts.filter((a: any) => a.status === 'Completed').length,
      avatar: patient.avatarInitials || getInitials(patient.name),
      color: patient.colorGradient || 'from-blue-500 to-indigo-600',
      registeredSince: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
      outstanding: (patient.invoices || [])
        .filter((i: any) => i.status === 'Unpaid' || i.status === 'Pending')
        .reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0)
    }
  })
}

export async function createPatient(formData: FormData) {
  const tenantId = await resolveTenantContext();
  const rawFormData = Object.fromEntries(formData.entries());

  const name = rawFormData.name as string
  const phone = rawFormData.phone1 as string

  if (!name || !phone) {
    return { success: false, error: 'Missing name or phone' }
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

  try {
    await patientService.createPatient(tenantId, patientData);
    revalidatePath('/patients');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePatient(id: string, formData: FormData) {
  const tenantId = await resolveTenantContext();
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

  try {
    const data = await patientService.updatePatient(tenantId, id, updates);
    revalidatePath('/patients');
    revalidatePath(`/patients/${id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating patient:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePatient(id: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deletePatient(tenantId, id);
    revalidatePath('/patients');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting patient:', error);
    return { success: false, error: error.message };
  }
}

export async function getPatientById(id: string) {
  if (!id) return null;
  const tenantId = await resolveTenantContext();

  try {
    const data = await patientService.getPatientById(tenantId, id);
    if (!data) return null;

    const age = data.dob ? Math.floor((new Date().getTime() - new Date(data.dob).getTime()) / 31557600000) : null
    
    const appointments = data.appointments || []
    const pastAppts = appointments
      .filter((a: any) => a.date && new Date(a.date) < new Date() && a.status === 'Completed')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const futureAppts = appointments
      .filter((a: any) => a.date && new Date(a.date) > new Date() && a.status !== 'Cancelled')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const invoices = data.invoices || []
    const outstanding = invoices
      .filter((i: any) => i.status === 'Unpaid' || i.status === 'Pending' || i.status === 'Overdue')
      .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)

    const avatar = data.avatarInitials || getInitials(data.name)

    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-emerald-500 to-teal-500',
      'from-indigo-500 to-violet-500',
      'from-rose-500 to-red-500'
    ];
    const colorIndex = (data.name || '').length % colors.length;

    const visitHistory = [
      ...(data.visitRecords || []).map((vr: any) => ({
        id: vr.id,
        date: vr.date ? new Date(vr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        time: '',
        status: 'Completed',
        treatment: vr.treatment,
        doctor: vr.doctor,
        notes: vr.notes || '',
        tooth: vr.tooth || '',
        isClinicalRecord: true
      })),
      ...appointments.map((a: any) => ({
        id: a.id,
        date: a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        time: a.time || '—',
        status: a.status,
        treatment: a.treatment || '—',
        notes: a.notes || "No notes",
        isClinicalRecord: false
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      id: data.id,
      displayId: data.displayId,
      name: data.name,
      phone: data.phone || '—',
      phone2: data.phone2 || '—',
      email: data.email || '—',
      dob: data.dob ? `${new Date(data.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${age} years)` : '—',
      address: data.address || '—',
      city: data.city || '—',
      postCode: data.postCode || '—',
      maritalStatus: data.maritalStatus || '—',
      occupation: data.occupation || '—',
      insurance: data.insurance || '—',
      ssn: data.ssn || '—',
      idNumber: data.idNumber || '—',
      medicalAlert: data.medicalAlert || 'None',
      referredBy: data.referredBy || 'Direct',
      notes: data.notes || 'No notes',
      isDeceased: data.isDeceased || false,
      isSigned: data.isSigned || false,
      lastVisit: pastAppts.length > 0 ? new Date(pastAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      nextAppt: futureAppts.length > 0 ? new Date(futureAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      status: data.status || 'Active',
      avatar,
      color: data.colorGradient || colors[colorIndex],
      registeredSince: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
      outstanding,
      bloodGroup: data.bloodGroup || '',
      smokingStatus: data.smokingStatus || 'Never',
      alcoholUse: data.alcoholUse || 'None',
      generalMedicalNotes: data.medicalNotes || '',
      allergies: data.patientAllergies || [],
      conditions: data.medicalConditions || [],
      medications: data.patientMedications || [],
      surgeries: data.patientSurgeries || [],
      familyHistory: data.patientFamilyHistory || [],
      oralTissueFindings: data.oralTissueFindings || [],
      toothConditions: data.toothConditions || [],
      periodontalMeasurements: data.periodontalMeasurements || [],
      oralConditions: data.oralConditions || [],
      visitHistory,
      invoiceHistory: invoices.map((i: any) => ({
        id: i.id,
        amount: i.amount,
        status: i.status,
        treatment: i.treatment || '—',
        date: i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      })),
      patient_documents: data.patientDocuments || [],
      prescriptions: data.prescriptions || []
    }
  } catch (error) {
    console.error('Error fetching patient by id:', error);
    return null;
  }
}

export async function updateOralCondition(patientId: string, name: string, active: boolean) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updateOralCondition(tenantId, patientId, name, active);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating oral condition:', error);
    return { success: false, error: error.message };
  }
}

export async function updateOralTissue(patientId: string, tissue: string, status: string, notes: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updateOralTissue(tenantId, patientId, tissue, status, notes);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating oral tissue:', error);
    return { success: false, error: error.message };
  }
}

export async function addVisitRecord(patientId: string, visit: any) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.addVisitRecord(tenantId, patientId, {
      date: visit.date ? new Date(visit.date) : new Date(),
      doctor: visit.doctor,
      treatment: visit.treatment,
      notes: visit.notes,
      tooth: visit.tooth
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding visit record:', error);
    return { success: false, error: error.message };
  }
}

export async function updateToothCondition(patientId: string, toothNumber: number, condition: string, notes: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updateToothCondition(tenantId, patientId, toothNumber, condition, notes);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating tooth condition:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePeriodontalMeasurement(patientId: string, measurement: any) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updatePeriodontalMeasurement(tenantId, patientId, {
      toothNumber: measurement.toothNumber,
      parameterName: measurement.parameterName,
      buccalValues: measurement.buccalValues,
      lingualValues: measurement.lingualValues,
      singleValue: measurement.singleValue,
      measurementDate: measurement.date ? new Date(measurement.date) : new Date()
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating periodontal measurement:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePatientNotes(patientId: string, notes: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, { notes });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patient notes:', error);
    return { success: false, error: error.message };
  }
}

export async function addMedicalCondition(
  patientId: string, 
  condition: { name: string; status: string; diagnosed?: string; notes?: string }
) {
  const tenantId = await resolveTenantContext();
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
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding condition:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMedicalCondition(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteMedicalCondition(tenantId, id);
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
  const tenantId = await resolveTenantContext();
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
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding allergy:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAllergy(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteAllergy(tenantId, id);
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
  const tenantId = await resolveTenantContext();
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
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding medication:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMedication(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteMedication(tenantId, id);
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
  const tenantId = await resolveTenantContext();
  if (!patientId || !surgery?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and surgery name are required' }
  }

  try {
    await patientService.addSurgery(tenantId, patientId, {
      surgeryName: surgery.name.trim(),
      surgeryDate: surgery.date ? new Date(surgery.date) : null,
      notes: surgery.notes?.trim() || null
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding surgery:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSurgery(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteSurgery(tenantId, id);
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
  const tenantId = await resolveTenantContext();
  if (!patientId || !history?.condition?.trim()) {
    return { success: false, error: 'Valid patient ID and condition name are required' }
  }

  try {
    await patientService.addFamilyHistory(tenantId, patientId, {
      conditionName: history.condition.trim(),
      relation: history.relation?.trim() || null
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding family history:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFamilyHistory(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteFamilyHistory(tenantId, id);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting family history:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePatientVitals(patientId: string, vitals: any) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, {
      bloodGroup: vitals.bloodType,
      smokingStatus: vitals.smoking,
      alcoholUse: vitals.alcohol
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patient vitals:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGeneralMedicalNotes(patientId: string, notes: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.updatePatient(tenantId, patientId, {
      medicalNotes: notes
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating medical notes:', error);
    return { success: false, error: error.message };
  }
}

export async function addPrescription(patientId: string, data: { doctor_name: string, notes: string, medications: { name: string, dosage: string, frequency: string, duration: string }[] }) {
  const tenantId = await resolveTenantContext();
  if (!patientId || !data.medications || data.medications.length === 0) {
    return { success: false, error: "Missing required prescription data" };
  }

  try {
    const rx = await patientService.addPrescription(tenantId, patientId, {
      doctorName: data.doctor_name,
      notes: data.notes,
      items: data.medications.map(med => ({
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        tenantId // items also need tenantId if they have it
      }))
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true, data: rx };
  } catch (error: any) {
    console.error('Error adding prescription:', error);
    return { success: false, error: error.message };
  }
}

export async function addPatientDocument(patientId: string, documentData: { name: string; type: string; file_url: string }) {
  const tenantId = await resolveTenantContext();
  try {
    const data = await patientService.addDocument(tenantId, patientId, {
      name: documentData.name,
      type: documentData.type,
      fileUrl: documentData.file_url,
      uploadDate: new Date()
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error adding patient document:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    const data = await patientService.updateInvoiceStatus(tenantId, invoiceId, status);

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePrescription(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deletePrescription(tenantId, id);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting prescription:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVisitRecord(id: string, patientId: string) {
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteVisitRecord(tenantId, id);
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting visit record:", error);
    return { success: false, error: error.message };
  }
}
