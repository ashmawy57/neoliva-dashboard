import { AppointmentRepository } from "@/repositories/appointment.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { InventoryService } from "./inventory.service";

const appointmentRepository = new AppointmentRepository();
const inventoryService = new InventoryService();

export class AppointmentService {
  /**
   * Get formatted list of appointments for the main table/list view
   */
  async getAppointmentsList() {
    const tenantId = await resolveTenantContext();
    const appointments = await appointmentRepository.findMany(tenantId);

    return appointments.map(apt => ({
      id: apt.id,
      patient: apt.patient?.name || "Unknown Patient",
      doctor: apt.staff?.name ? `Dr. ${apt.staff.name}` : "No Doctor",
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      type: apt.type,
      notes: apt.notes,
      hasInvoice: !!apt.invoice,
      invoiceStatus: apt.invoice?.status,
      invoiceAmount: apt.invoice?.amount ? Number(apt.invoice.amount) : 0
    }));
  }

  /**
   * Get appointments formatted for Calendar view
   */
  async getAppointmentsCalendarView() {
    const tenantId = await resolveTenantContext();
    const appointments = await appointmentRepository.findMany(tenantId);

    return appointments.map(apt => ({
      id: apt.id,
      title: `${apt.patient?.name || "Unknown"} - ${apt.type}`,
      start: apt.startTime,
      end: apt.endTime,
      extendedProps: {
        status: apt.status,
        doctor: apt.staff?.name ? `Dr. ${apt.staff.name}` : "No Doctor",
        patientId: apt.patientId
      }
    }));
  }

  /**
   * Get summary stats for today's appointments
   */
  async getAppointmentStats() {
    const tenantId = await resolveTenantContext();
    const appointments = await appointmentRepository.findMany(tenantId);
    
    const today = new Date().toDateString();
    const todayApts = appointments.filter(a => new Date(a.startTime).toDateString() === today);

    return {
      totalToday: todayApts.length,
      completed: todayApts.filter(a => a.status === 'COMPLETED').length,
      inProgress: todayApts.filter(a => a.status === 'IN_PROGRESS').length,
      cancelled: todayApts.filter(a => a.status === 'CANCELLED').length
    };
  }

  /**
   * Get detailed info for a single appointment
   */
  async getAppointmentDetails(id: string) {
    const tenantId = await resolveTenantContext();
    return await appointmentRepository.findUnique(id, tenantId);
  }

  /**
   * Create a new appointment
   */
  async createAppointment(data: {
    patientId: string;
    staffId: string;
    startTime: Date;
    endTime: Date;
    type: string;
    notes?: string;
  }) {
    const tenantId = await resolveTenantContext();
    return await appointmentRepository.create({
      ...data,
      tenantId,
      status: 'SCHEDULED'
    });
  }

  /**
   * Update appointment status and handle automatic triggers
   */
  async updateStatus(id: string, status: string) {
    const tenantId = await resolveTenantContext();
    
    // 1. Fetch current appointment to get serviceId
    const appointment = await appointmentRepository.findUnique(id, tenantId);
    
    // 2. Update status
    const updated = await appointmentRepository.update(id, tenantId, { status });

    // 3. If completed, trigger smart logic
    if (status === 'COMPLETED' && appointment?.serviceId) {
      await inventoryService.consumeItemsFromService(appointment.serviceId);
    }

    return updated;
  }

  /**
   * Cancel/Delete appointment
   */
  async cancelAppointment(id: string) {
    const tenantId = await resolveTenantContext();
    return await appointmentRepository.delete(id, tenantId);
  }
}
