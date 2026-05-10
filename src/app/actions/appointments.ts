'use server'

import { revalidatePath } from 'next/cache'
import { AppointmentService } from "@/services/appointment.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const appointmentService = new AppointmentService();

export async function getAppointmentsData() {
  try {
    return await appointmentService.getAppointmentsData();
  } catch (error) {
    console.error('Error fetching appointments data:', error);
    return { list: [], stats: { totalToday: 0, completed: 0, inProgress: 0, cancelled: 0 } };
  }
}

export async function getAppointmentFormData() {
  try {
    return await appointmentService.getAppointmentFormData();
  } catch (error) {
    console.error('Error fetching appointment form data:', error);
    return { patients: [], doctors: [], services: [] };
  }
}

export async function createAppointment(data: any) {
  try {
    const created = await appointmentService.createAppointment(data);
    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: created };
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    throw new Error(error.message || 'Failed to create appointment');
  }
}

export async function updateAppointmentStatus(id: string, status: any) {
  try {
    const updated = await appointmentService.updateStatus(id, status);
    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}
