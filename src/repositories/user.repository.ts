import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export class UserRepository {
  async findUnique(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findBySupabaseId(supabaseId: string) {
    return prisma.user.findUnique({
      where: { supabaseId }
    });
  }

  async findUniqueWithActiveMembership(supabaseId: string) {
    return prisma.user.findUnique({
      where: { supabaseId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { tenant: true },
          take: 1
        }
      }
    });
  }
}
