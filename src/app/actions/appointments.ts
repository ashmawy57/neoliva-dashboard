'use server'

import { revalidatePath } from 'next/cache'
import { AppointmentService } from "@/services/appointment.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const appointmentService = new AppointmentService();

export async function getAppointmentsData() {
  try {
    const tenantId = await resolveTenantContext();
    return await appointmentService.getAppointmentsData(tenantId);
  } catch (error) {
    console.error('Error fetching appointments data:', error);
    return { list: [], stats: { totalToday: 0, completed: 0, inProgress: 0, cancelled: 0 } };
  }
}

export async function getAppointmentFormData() {
  try {
    const tenantId = await resolveTenantContext();
    return await appointmentService.getAppointmentFormData(tenantId);
  } catch (error) {
    console.error('Error fetching appointment form data:', error);
    return { patients: [], doctors: [], services: [] };
  }
}

export async function createAppointment(data: any) {
  try {
    const tenantId = await resolveTenantContext();
    const created = await appointmentService.createAppointment(tenantId, data);
    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: created };
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return { success: false, error: error.message || 'Failed to create appointment' };
  }
}

export async function updateAppointmentStatus(id: string, status: any) {
  try {
    const tenantId = await resolveTenantContext();
    const updated = await appointmentService.updateStatus(tenantId, id, status);
    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return { success: false, error: error.message || 'Failed to update appointment' };
  }
}

export async function cancelAppointment(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await appointmentService.cancelAppointment(tenantId, id);
    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error: error.message || 'Failed to cancel appointment' };
  }
}
