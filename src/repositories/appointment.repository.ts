import prisma from "@/lib/prisma";
import { Appointment, Prisma } from "@prisma/client";

export class AppointmentRepository {
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    include?: Prisma.AppointmentInclude;
    orderBy?: Prisma.AppointmentOrderByWithRelationInput;
  }): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string, include?: Prisma.AppointmentInclude): Promise<Appointment | null> {
    return prisma.appointment.findFirst({
      where: {
        id,
        tenantId,
      },
      include,
    });
  }

  async create(tenantId: string, data: Omit<Prisma.AppointmentCreateInput, 'tenant'>): Promise<Appointment> {
    return prisma.appointment.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return prisma.appointment.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Appointment> {
    return prisma.appointment.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
