import { AppointmentRepository } from "@/repositories/appointment.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { InventoryService } from "./inventory.service";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const appointmentRepository = new AppointmentRepository();
const inventoryService = new InventoryService();

export class AppointmentService {
  /**
   * Get formatted list of appointments for the main table/list view
   */
  async getAppointmentsList(tenantId: string) {
    console.log(`[AppointmentService] Fetching appointments for tenant: ${tenantId}`);
    const appointments = await appointmentRepository.findMany(tenantId);

    return appointments.map(apt => {
      const start = new Date(apt.date);
      const time = new Date(apt.time);
      start.setHours(time.getHours(), time.getMinutes());
      
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + apt.duration);

      // Helper for initials
      const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      return {
        id: apt.id,
        patient: apt.patient?.name || "Unknown Patient",
        patientId: apt.patientId,
        doctor: apt.doctor?.name ? `Dr. ${apt.doctor.name}` : "No Doctor",
        doctorId: apt.doctorId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        date: new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(apt.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: apt.status,
        treatment: apt.service?.name || apt.treatment || 'No treatment',
        notes: apt.notes,
        hasInvoice: !!apt.invoice,
        invoiceStatus: apt.invoice?.status,
        invoiceAmount: apt.invoice?.amount ? Number(apt.invoice.amount) : 0,
        avatar: getInitials(apt.patient?.name || ""),
        color: apt.color || 'from-blue-500 to-indigo-600'
      };
    });
  }

  /**
   * Get summary stats and list in one call for Gold Standard implementation
   */
  async getAppointmentsData() {
    const tenantId = await resolveTenantContext();
    const list = await this.getAppointmentsList(tenantId);
    
    const today = new Date().toDateString();
    const todayApts = list.filter(a => new Date(a.startTime).toDateString() === today);

    const stats = {
      totalToday: todayApts.length,
      completed: todayApts.filter(a => a.status === 'COMPLETED').length,
      inProgress: todayApts.filter(a => a.status === 'IN_PROGRESS').length,
      cancelled: todayApts.filter(a => a.status === 'CANCELLED').length
    };

    console.log(`[AppointmentService] Stats calculated:`, stats);

    return {
      list,
      stats
    };
  }

  /**
   * Get all data needed for creation forms (patients, doctors, services)
   */
  async getAppointmentFormData() {
    const tenantId = await resolveTenantContext();
    const [patients, doctors, servicesRaw] = await Promise.all([
      prisma.patient.findMany({ where: { tenantId }, select: { id: true, name: true, phone: true } }),
      prisma.staff.findMany({ where: { tenantId, role: 'DOCTOR' }, select: { id: true, name: true } }),
      prisma.service.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true, duration: true, price: true } })
    ]);

    const services = servicesRaw.map(s => ({
      ...s,
      price: s.price ? Number(s.price) : 0
    }));

    return {
      patients,
      doctors,
      services
    };
  }

  /**
   * Get detailed info for a single appointment
   */
  async getAppointmentDetails(id: string) {
    const tenantId = await resolveTenantContext();
    const apt = await appointmentRepository.findUnique(id, tenantId);
    return this.serializeAppointment(apt);
  }

  async createAppointment(data: {
    patientId: string;
    doctorId: string;
    serviceId?: string;
    date: string; // ISO string or YYYY-MM-DD
    time: string; // HH:MM
    duration: number;
    treatment: string;
    notes?: string;
    color?: string;
  }) {
    const tenantId = await resolveTenantContext();
    console.log(`[AppointmentService] Creating appointment for tenant: ${tenantId}`, data);
    
    // Convert time HH:MM to a full Date object for the time field (Prisma @db.Time requires a Date)
    const timeDate = new Date();
    const [hours, minutes] = data.time.split(':');
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const result = await appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      serviceId: data.serviceId,
      date: new Date(data.date),
      time: timeDate,
      duration: data.duration,
      treatment: data.treatment,
      notes: data.notes,
      color: data.color,
      tenantId,
      status: 'SCHEDULED'
    });

    return this.serializeAppointment(result);
  }

  /**
   * Update appointment status and handle automatic triggers
   */
  async updateStatus(id: string, status: AppointmentStatus) {
    const tenantId = await resolveTenantContext();
    
    // 1. Fetch current appointment to get serviceId
    const appointment = await appointmentRepository.findUnique(id, tenantId);
    
    // 2. Update status
    const updated = await appointmentRepository.update(id, tenantId, { status });

    // 3. If completed, trigger smart logic
    if (status === 'COMPLETED' && appointment?.serviceId) {
      await inventoryService.consumeItemsFromService(appointment.serviceId);
    }

    return this.serializeAppointment(updated);
  }

  /**
   * Cancel/Delete appointment
   */
  async cancelAppointment(id: string) {
    const tenantId = await resolveTenantContext();
    const result = await appointmentRepository.delete(id, tenantId);
    return this.serializeAppointment(result);
  }

  /**
   * Helper to serialize appointment objects for Client Components
   */
  private serializeAppointment(apt: any) {
    if (!apt) return null;
    
    const serialized = { ...apt };
    
    // Handle nested service price
    if (serialized.service) {
      serialized.service = {
        ...serialized.service,
        price: serialized.service.price ? Number(serialized.service.price) : 0
      };
    }
    
    // Handle nested invoice amount
    if (serialized.invoice) {
      serialized.invoice = {
        ...serialized.invoice,
        amount: serialized.invoice.amount ? Number(serialized.invoice.amount) : 0
      };
    }

    // Convert dates to ISO strings if needed (Prisma dates can usually be passed, but ISO is safer)
    if (serialized.date instanceof Date) serialized.date = serialized.date.toISOString();
    if (serialized.time instanceof Date) serialized.time = serialized.time.toISOString();
    if (serialized.createdAt instanceof Date) serialized.createdAt = serialized.createdAt.toISOString();
    if (serialized.updatedAt instanceof Date) serialized.updatedAt = serialized.updatedAt.toISOString();

    return serialized;
  }
}
