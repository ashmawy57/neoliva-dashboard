import { prisma } from "@/lib/prisma";

export class SessionRepository {
  async findUnique(id: string) {
    return prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        userId: true,
        ipAddress: true,
      },
    });
  }
}
