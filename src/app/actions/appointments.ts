'use server'

import { revalidatePath } from 'next/cache'
import { AppointmentService } from "@/services/appointment.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const appointmentService = new AppointmentService();

export async function getAppointments() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await appointmentService.getAppointments(tenantId);

    return data.map((appt) => {
      return {
        id: appt.id,
        displayId: appt.displayId,
        patient: (appt as any).patient?.name || 'Unknown Patient',
        patientId: appt.patientId,
        doctor: (appt as any).doctor?.name || 'Unknown Doctor',
        doctorId: appt.doctorId,
        treatment: appt.treatment || 'Consultation',
        date: appt.date,
        time: appt.time,
        duration: appt.duration,
        status: appt.status || 'Scheduled',
        color: appt.color || 'from-blue-500 to-indigo-600',
        notes: appt.notes,
        avatar: (appt as any).patient?.name 
          ? (appt as any).patient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
          : 'P',
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
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
  try {
    const tenantId = await resolveTenantContext();
    const data = await appointmentService.createAppointment(tenantId, formData);

    revalidatePath('/appointments');
    return data;
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
}

export async function updateAppointment(id: string, updates: any) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await appointmentService.updateAppointment(tenantId, id, updates);

    revalidatePath('/appointments');
    return data;
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}

export async function deleteAppointment(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await appointmentService.deleteAppointment(tenantId, id);

    revalidatePath('/appointments');
    return true;
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
}

