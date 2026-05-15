'use server'

import { revalidatePath } from 'next/cache'
import { AppointmentService } from "@/services/appointment.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { requireRecordAccess } from "@/lib/abac";
import { PermissionCode } from "@/types/permissions";
import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";
const appointmentService = new AppointmentService();

export async function getAppointmentsData() {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.APPOINTMENT_VIEW);
    return await appointmentService.getAppointmentsData(tenantId);
  } catch (error) {
    console.error('Error fetching appointments data:', error);
    return { list: [], stats: { totalToday: 0, completed: 0, inProgress: 0, cancelled: 0 } };
  }
}

export async function getAppointmentFormData() {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.APPOINTMENT_VIEW);
    return await appointmentService.getAppointmentFormData(tenantId);
  } catch (error) {
    console.error('Error fetching appointment form data:', error);
    return { patients: [], doctors: [], services: [] };
  }
}

export const createAppointment = wrapAction(
  'APPOINTMENT_CREATE',
  async (data: any) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.APPOINTMENT_CREATE);
    const created = await appointmentService.createAppointment(tenantId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'APPOINTMENT_SCHEDULED',
      entityType: 'APPOINTMENT',
      entityId: created.id,
      metadata: { 
        patientId: created.patientId, 
        doctorId: created.doctorId,
        serviceId: created.serviceId,
        date: created.date 
      }
    });

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return created;
  },
  { module: 'appointments', entityType: 'APPOINTMENT' }
);

export const updateAppointmentStatus = wrapAction(
  'APPOINTMENT_STATUS_UPDATE',
  async (id: string, status: any) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.APPOINTMENT_EDIT);
    await requireRecordAccess('appointment', id);
    const updated = await appointmentService.updateStatus(tenantId, id, status);
    
    await EventService.trackEvent({
      tenantId,
      eventType: status === 'COMPLETED' ? 'APPOINTMENT_COMPLETED' : 'APPOINTMENT_STATUS_CHANGED',
      entityType: 'APPOINTMENT',
      entityId: id,
      metadata: { status }
    });

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return updated;
  },
  { module: 'appointments', entityType: 'APPOINTMENT' }
);

export const cancelAppointment = wrapAction(
  'APPOINTMENT_CANCEL',
  async (id: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.APPOINTMENT_DELETE);
    await requireRecordAccess('appointment', id);
    const result = await appointmentService.cancelAppointment(tenantId, id);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'APPOINTMENT_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: id,
    });

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return result;
  },
  { module: 'appointments', entityType: 'APPOINTMENT' }
);

