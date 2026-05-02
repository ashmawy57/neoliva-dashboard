'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      appointments (
        id,
        date,
        status
      ),
      invoices (
        id,
        amount,
        status,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching patients:', error)
    return []
  }

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
      displayId: patient.display_id,
      name: patient.name,
      email: patient.email || '—',
      phone: patient.phone || '—',
      gender: patient.gender,
      lastVisit: lastVisit ? new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits',
      nextAppt: nextAppt ? new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
      status: patient.status || 'Active',
      visits: appts.filter((a: any) => a.status === 'Completed').length,
      avatar: patient.avatar_initials || getInitials(patient.name),
      color: patient.color_gradient || 'from-blue-500 to-indigo-600',
      registeredSince: patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
      outstanding: (patient.invoices || [])
        .filter((i: any) => i.status === 'Unpaid' || i.status === 'Pending')
        .reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0)
    }
  })
}

export async function createPatient(formData: FormData) {
  const supabase = await createClient()
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
    display_id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name,
    phone: phone,
    phone2: rawFormData.phone2 as string || null,
    email: rawFormData.email as string || null,
    address: rawFormData.address as string || null,
    post_code: rawFormData.postCode as string || null,
    city: rawFormData.city as string || null,
    dob: rawFormData.dob as string || null,
    gender: rawFormData.gender as string || null,
    marital_status: rawFormData.maritalStatus as string || null,
    occupation: rawFormData.occupation as string || null,
    insurance: rawFormData.insurance as string || null,
    ssn: rawFormData.ssn as string || null,
    id_number: rawFormData.idNumber as string || null,
    medical_alert: rawFormData.medicalAlert as string || null,
    referred_by: rawFormData.referredBy as string || null,
    notes: rawFormData.notes as string || null,
    is_deceased: rawFormData.isDeceased === 'true',
    is_signed: rawFormData.isSigned === 'true',
    avatar_initials: initials,
    color_gradient: gradients[Math.floor(Math.random() * gradients.length)],
    status: 'Active'
  }

  const { error } = await supabase
    .from('patients')
    .insert(patientData);

  if (error) {
    console.error('Error creating patient:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/patients');
  return { success: true };
}

export async function updatePatient(id: string, formData: FormData) {
  const supabase = await createClient();
  const rawFormData = Object.fromEntries(formData.entries());

  const updates: any = {
    name: rawFormData.name as string,
    phone: rawFormData.phone1 as string,
    phone2: rawFormData.phone2 as string,
    email: rawFormData.email as string,
    address: rawFormData.address as string,
    post_code: rawFormData.postCode as string,
    city: rawFormData.city as string,
    dob: rawFormData.dob as string || null,
    gender: rawFormData.gender as string,
    marital_status: rawFormData.maritalStatus as string,
    occupation: rawFormData.occupation as string,
    insurance: rawFormData.insurance as string,
    ssn: rawFormData.ssn as string,
    id_number: rawFormData.idNumber as string,
    medical_alert: rawFormData.medicalAlert as string,
    referred_by: rawFormData.referredBy as string,
    notes: rawFormData.notes as string,
    is_deceased: rawFormData.isDeceased === 'true',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  return { success: true, data };
}

export async function deletePatient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patient:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/patients');
  return { success: true };
}

export async function getPatientById(id: string) {
  if (!id) return null;
  const supabase = await createClient()
  
  // Use explicit column selection to avoid PostgREST ambiguities
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      appointments (
        id,
        date,
        time,
        status,
        notes,
        treatment
      ),
      invoices (
        id,
        amount,
        status,
        created_at,
        treatment
      ),
      patient_allergies (*),
      medical_conditions (*),
      patient_medications (*),
      patient_surgeries (*),
      patient_family_history (*),
      visit_records (*),
      oral_tissue_findings (*),
      tooth_conditions (*),
      periodontal_measurements (*),
      prescriptions (*, prescription_items (*)),
      patient_documents (*),
      oral_conditions (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching patient by id:', error)
    return null
  }

  if (!data) return null

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

  const avatar = data.avatar_initials || getInitials(data.name)

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-indigo-500 to-violet-500',
    'from-rose-500 to-red-500'
  ];
  const colorIndex = (data.name || '').length % colors.length;

  // Combine appointment history with clinical visit records
  const visitHistory = [
    ...(data.visit_records || []).map((vr: any) => ({
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
    displayId: data.display_id,
    name: data.name,
    phone: data.phone || '—',
    phone2: data.phone2 || '—',
    email: data.email || '—',
    dob: data.dob ? `${new Date(data.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${age} years)` : '—',
    address: data.address || '—',
    city: data.city || '—',
    postCode: data.post_code || '—',
    maritalStatus: data.marital_status || '—',
    occupation: data.occupation || '—',
    insurance: data.insurance || '—',
    ssn: data.ssn || '—',
    idNumber: data.id_number || '—',
    medicalAlert: data.medical_alert || 'None',
    referredBy: data.referred_by || 'Direct',
    notes: data.notes || 'No notes',
    isDeceased: data.is_deceased || false,
    isSigned: data.is_signed || false,
    lastVisit: pastAppts.length > 0 ? new Date(pastAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    nextAppt: futureAppts.length > 0 ? new Date(futureAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    status: data.status || 'Active',
    avatar,
    color: data.color_gradient || colors[colorIndex],
    registeredSince: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
    outstanding,
    bloodGroup: data.blood_group || '',
    smokingStatus: data.smoking_status || 'Never',
    alcoholUse: data.alcohol_use || 'None',
    generalMedicalNotes: data.medical_notes || '',
    allergies: data.patient_allergies || [],
    conditions: data.medical_conditions || [],
    medications: data.patient_medications || [],
    surgeries: data.patient_surgeries || [],
    familyHistory: data.patient_family_history || [],
    oralTissueFindings: data.oral_tissue_findings || [],
    toothConditions: data.tooth_conditions || [],
    periodontalMeasurements: data.periodontal_measurements || [],
    oralConditions: data.oral_conditions || [],
    visitHistory,
    invoiceHistory: invoices.map((i: any) => ({
      id: i.id,
      amount: i.amount,
      status: i.status,
      treatment: i.treatment || '—',
      date: i.created_at ? new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
    })),
    patient_documents: data.patient_documents || [],
    prescriptions: data.prescriptions || []
  }
}

export async function updateOralCondition(patientId: string, name: string, active: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('oral_conditions')
    .upsert({
      patient_id: patientId,
      name: name,
      active: active,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id,name'
    })

  if (error) {
    console.error('Error updating oral condition:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updateOralTissue(patientId: string, tissue: string, status: string, notes: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('oral_tissue_findings')
    .upsert({
      patient_id: patientId,
      name: tissue,
      status: status,
      notes: notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id,name'
    })

  if (error) {
    console.error('Error updating oral tissue:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addVisitRecord(patientId: string, visit: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('visit_records')
    .insert({
      patient_id: patientId,
      date: visit.date || new Date().toISOString(),
      doctor: visit.doctor,
      treatment: visit.treatment,
      notes: visit.notes,
      tooth: visit.tooth
    })

  if (error) {
    console.error('Error adding visit record:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updateToothCondition(patientId: string, toothNumber: number, condition: string, notes: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tooth_conditions')
    .upsert({
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      notes: notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id,tooth_number'
    })

  if (error) {
    console.error('Error updating tooth condition:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePeriodontalMeasurement(patientId: string, measurement: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('periodontal_measurements')
    .insert({
      patient_id: patientId,
      tooth_number: measurement.toothNumber,
      parameter_name: measurement.parameterName,
      buccal_values: measurement.buccalValues,
      lingual_values: measurement.lingualValues,
      single_value: measurement.singleValue,
      measurement_date: measurement.date || new Date().toISOString()
    })

  if (error) {
    console.error('Error updating periodontal measurement:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePatientNotes(patientId: string, notes: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('patients')
    .update({ notes })
    .eq('id', patientId)

  if (error) {
    console.error('Error updating patient notes:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addMedicalCondition(
  patientId: string, 
  condition: { name: string; status: string; diagnosed?: string; notes?: string }
) {
  if (!patientId || !condition?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and condition name are required' }
  }
  
  const supabase = await createClient()
  const { error } = await supabase.from('medical_conditions').insert({
    patient_id: patientId,
    condition_name: condition.name.trim(),
    status: condition.status,
    diagnosed_date: condition.diagnosed || null,
    notes: condition.notes?.trim() || null
  })
  if (error) {
    console.error('Error adding condition:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteMedicalCondition(id: string, patientId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('medical_conditions').delete().eq('id', id)
  if (error) {
    console.error('Error deleting condition:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addAllergy(
  patientId: string, 
  allergy: { name: string; severity: string; reaction?: string; notes?: string }
) {
  if (!patientId || !allergy?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and allergy name are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('patient_allergies').insert({
    patient_id: patientId,
    allergen: allergy.name.trim(),
    severity: allergy.severity,
    reaction: allergy.reaction?.trim() || null,
    notes: allergy.notes?.trim() || null
  })
  if (error) {
    console.error('Error adding allergy:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteAllergy(id: string, patientId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patient_allergies').delete().eq('id', id)
  if (error) {
    console.error('Error deleting allergy:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addMedication(
  patientId: string, 
  med: { name: string; dosage?: string; frequency?: string; prescribedFor?: string }
) {
  if (!patientId || !med?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and medication name are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('patient_medications').insert({
    patient_id: patientId,
    medication_name: med.name.trim(),
    dosage: med.dosage?.trim() || null,
    frequency: med.frequency?.trim() || null,
    notes: med.prescribedFor?.trim() || null
  })
  if (error) {
    console.error('Error adding medication:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteMedication(id: string, patientId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patient_medications').delete().eq('id', id)
  if (error) {
    console.error('Error deleting medication:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addSurgery(
  patientId: string, 
  surgery: { name: string; date?: string; notes?: string }
) {
  if (!patientId || !surgery?.name?.trim()) {
    return { success: false, error: 'Valid patient ID and surgery name are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('patient_surgeries').insert({
    patient_id: patientId,
    surgery_name: surgery.name.trim(),
    surgery_date: surgery.date || null,
    notes: surgery.notes?.trim() || null
  })
  if (error) {
    console.error('Error adding surgery:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteSurgery(id: string, patientId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patient_surgeries').delete().eq('id', id)
  if (error) {
    console.error('Error deleting surgery:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addFamilyHistory(
  patientId: string, 
  history: { condition: string; relation?: string }
) {
  if (!patientId || !history?.condition?.trim()) {
    return { success: false, error: 'Valid patient ID and condition name are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('patient_family_history').insert({
    patient_id: patientId,
    condition_name: history.condition.trim(),
    relation: history.relation?.trim() || null
  })
  if (error) {
    console.error('Error adding family history:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteFamilyHistory(id: string, patientId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patient_family_history').delete().eq('id', id)
  if (error) {
    console.error('Error deleting family history:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePatientVitals(patientId: string, vitals: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('patients').update({
    blood_group: vitals.bloodType,
    smoking_status: vitals.smoking,
    alcohol_use: vitals.alcohol
  }).eq('id', patientId)
  
  if (error) {
    console.error('Error updating patient vitals:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updateGeneralMedicalNotes(patientId: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patients').update({
    medical_notes: notes
  }).eq('id', patientId)
  
  if (error) {
    console.error('Error updating medical notes:', error)
    return { success: false, error: error.message }
  }
  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function addPrescription(patientId: string, data: { doctor_name: string, notes: string, medications: { name: string, dosage: string, frequency: string, duration: string }[] }) {
  const supabase = await createClient()
  
  if (!patientId || !data.medications || data.medications.length === 0) {
    return { success: false, error: "Missing required prescription data" };
  }

  // Insert into prescriptions
  const { data: rx, error: rxError } = await supabase.from('prescriptions').insert({
    patient_id: patientId,
    doctor_name: data.doctor_name,
    notes: data.notes
  }).select('id').single()

  if (rxError) {
    console.error('Error adding prescription:', rxError)
    return { success: false, error: rxError.message }
  }

  // Insert into prescription_items
  const items = data.medications.map(med => ({
    prescription_id: rx.id,
    medication_name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    duration: med.duration
  }))

  const { error: itemsError } = await supabase.from('prescription_items').insert(items)

  if (itemsError) {
    console.error('Error adding prescription items:', itemsError)
    return { success: false, error: itemsError.message }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true, data: rx }
}

export async function addPatientDocument(patientId: string, documentData: { name: string; type: string; file_url: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patient_documents")
    .insert([
      {
        patient_id: patientId,
        name: documentData.name,
        type: documentData.type,
        file_url: documentData.file_url,
        upload_date: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding patient document:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  return { success: true, data };
}

export async function updateInvoiceStatus(invoiceId: string, status: string, patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  return { success: true, data };
}

export async function deletePrescription(id: string, patientId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("prescriptions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting prescription:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/patients/${patientId}`);
  return { success: true };
}

export async function deleteVisitRecord(id: string, patientId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("visit_records")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting visit record:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/patients/${patientId}`);
  return { success: true };
}
