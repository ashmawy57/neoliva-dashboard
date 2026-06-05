import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export class TenantRepository {
  async findMany() {
    return prisma.tenant.findMany({
      include: {
        _count: {
          select: { staff: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUnique(id: string) {
    return prisma.tenant.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: Prisma.TenantUpdateInput) {
    return prisma.tenant.update({
      where: { id },
      data
    });
  }
}
