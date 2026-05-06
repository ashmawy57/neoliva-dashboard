'use server'

import { revalidatePath } from 'next/cache'
import { AppointmentService } from "@/services/appointment.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const appointmentService = new AppointmentService();

export async function getAppointments() {
  try {
    return await appointmentService.getAppointmentsList();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function getAppointmentStats() {
  try {
    return await appointmentService.getAppointmentStats();
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return { totalToday: 0, completed: 0, inProgress: 0, cancelled: 0 };
  }
}

export async function createAppointment(data: any) {
  try {
    const tenantId = await resolveTenantContext();
    // Logic will be handled in service in next step
    // For now, let's ensure we have a standard pattern
    revalidatePath('/appointments');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const tenantId = await resolveTenantContext();
    // Logic will be handled in service
    revalidatePath('/appointments');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}
