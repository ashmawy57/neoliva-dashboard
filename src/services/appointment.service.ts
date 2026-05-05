import { AppointmentRepository } from "@/repositories/appointment.repository";
import { Appointment, Prisma } from "@prisma/client";

export class AppointmentService {
  private repository = new AppointmentRepository();

  async getAppointments(tenantId: string) {
    return this.repository.findAll(tenantId, {
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });
  }

  async createAppointment(tenantId: string, data: any) {
    const { patientId, doctorId, serviceId, ...rest } = data;
    
    return this.repository.create(tenantId, {
      ...rest,
      displayId: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date(data.date),
      time: new Date(`${data.date}T${data.time}:00`),
      duration: parseInt(data.duration || '30'),
      status: (data.status as any) || 'SCHEDULED',
      patient: { connect: { id: patientId } },
      doctor: { connect: { id: doctorId } },
      ...(serviceId ? { service: { connect: { id: serviceId } } } : {})
    });
  }

  async updateAppointment(tenantId: string, id: string, updates: any) {
    const { patientId, doctorId, serviceId, ...rest } = updates;
    
    return this.repository.update(tenantId, id, {
      ...rest,
      ...(updates.date ? { date: new Date(updates.date) } : {}),
      ...(updates.time && updates.date ? { time: new Date(`${updates.date}T${updates.time}:00`) } : {}),
      ...(patientId ? { patient: { connect: { id: patientId } } } : {}),
      ...(doctorId ? { doctor: { connect: { id: doctorId } } } : {}),
      ...(serviceId ? { service: { connect: { id: serviceId } } } : {}),
      updatedAt: new Date()
    });
  }

  async deleteAppointment(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
