import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export class SettingsRepository {
  async findUnique(tenantId: string) {
    return prisma.clinicSettings.findUnique({
      where: { tenantId },
    });
  }

  async create(tenantId: string, clinicName: string, notificationsConfig: any) {
    return prisma.clinicSettings.create({
      data: {
        tenantId,
        clinicName,
        notificationsConfig: notificationsConfig as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(tenantId: string, data: Prisma.ClinicSettingsUpdateInput) {
    return prisma.clinicSettings.update({
      where: { tenantId },
      data,
    });
  }
}
