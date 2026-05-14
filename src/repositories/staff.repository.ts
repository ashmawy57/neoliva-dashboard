import { prisma } from "@/lib/prisma";
import { Staff, Prisma } from "@/generated/client";

export class StaffRepository {
  async findMembers(tenantId: string): Promise<any[]> {
    return prisma.tenantMembership.findMany({
      where: { tenantId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        },
        staffProfile: true
      },
      orderBy: { joinedAt: 'desc' }
    });
  }

  async findInvitations(tenantId: string): Promise<any[]> {
    return prisma.staffInvitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(tenantId: string, id: string): Promise<Staff | null> {
    return prisma.staff.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async createInvitation(tenantId: string, data: any) {
    return prisma.staffInvitation.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  async update(tenantId: string, id: string, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return prisma.staff.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Staff> {
    return prisma.staff.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
