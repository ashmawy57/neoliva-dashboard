import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class AppointmentRepository {
  /**
   * Fetch all appointments for a specific tenant with related patient and doctor info
   */
  async findMany(tenantId: string, params?: {
    where?: Prisma.AppointmentWhereInput;
    include?: Prisma.AppointmentInclude;
    orderBy?: Prisma.AppointmentOrderByWithRelationInput | Prisma.AppointmentOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }) {
    return await prisma.appointment.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId
      },
      include: params?.include || {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
          }
        },
        invoice: {
          select: {
            id: true,
            status: true,
            amount: true
          }
        }
      },
      orderBy: params?.orderBy || [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
  }

  /**
   * Find a specific appointment by ID within a tenant context
   */
  async findUnique(id: string, tenantId: string) {
    return await prisma.appointment.findUnique({
      where: { id, tenantId },
      include: {
        patient: true,
        doctor: true,
        service: true,
        invoice: true
      }
    });
  }

  /**
   * Create a new appointment
   */
  async create(data: Prisma.AppointmentUncheckedCreateInput) {
    return await prisma.appointment.create({
      data
    });
  }

  /**
   * Update an appointment status or details
   */
  async update(id: string, tenantId: string, data: Prisma.AppointmentUncheckedUpdateInput) {
    return await prisma.appointment.update({
      where: { id, tenantId },
      data
    });
  }

  /**
   * Delete/Cancel an appointment
   */
  async delete(id: string, tenantId: string) {
    return await prisma.appointment.delete({
      where: { id, tenantId }
    });
  }
}
