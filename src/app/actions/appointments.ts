'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function getAppointments() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name
      ),
      staff (
        id,
        name
      )
    `)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data.map((appt: any) => {
    return {
      id: appt.id,
      displayId: appt.display_id,
      patient: appt.patients?.name || 'Unknown Patient',
      patientId: appt.patient_id,
      doctor: appt.staff?.name || 'Unknown Doctor',
      doctorId: appt.doctor_id,
      treatment: appt.treatment || 'Consultation',
      date: appt.date,
      time: appt.time,
      duration: appt.duration,
      status: appt.status || 'Scheduled',
      color: appt.color || 'from-blue-500 to-indigo-600',
      notes: appt.notes,
      avatar: appt.patients?.name ? appt.patients.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'P',
    }
  });
}

export async function createAppointment(formData: { 
  patientId: string; 
  doctorId: string; 
  treatment: string; 
  date: string; 
  time: string; 
  duration?: string; 
  status?: string;
  notes?: string;
  color?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      id: crypto.randomUUID(),
      display_id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: formData.patientId,
      doctor_id: formData.doctorId,
      treatment: formData.treatment,
      date: formData.date,
      time: formData.time,
      duration: formData.duration || '30',
      status: formData.status || 'Scheduled',
      notes: formData.notes,
      color: formData.color || 'from-blue-500 to-indigo-600'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }

  revalidatePath('/appointments');
  return data;
}

export async function updateAppointment(id: string, updates: any) {
  const supabase = await createClient();
  
  const formattedUpdates: any = { ...updates };
  if (formattedUpdates.displayId) {
    formattedUpdates.display_id = formattedUpdates.displayId;
    delete formattedUpdates.displayId;
  }
  if (formattedUpdates.patientId) {
    formattedUpdates.patient_id = formattedUpdates.patientId;
    delete formattedUpdates.patientId;
  }
  if (formattedUpdates.doctorId) {
    formattedUpdates.doctor_id = formattedUpdates.doctorId;
    delete formattedUpdates.doctorId;
  }
  
  formattedUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }

  revalidatePath('/appointments');
  return data;
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }

  revalidatePath('/appointments');
  return true;
}

