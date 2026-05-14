import { prisma } from "@/lib/prisma";
import { NotificationPreference, NotificationType, NotificationChannelType, Prisma } from "@/generated/client";

export class NotificationPreferenceRepository {
  /**
   * Find a specific preference for a user
   */
  async findUnique(tenantId: string, userId: string, type: NotificationType, channel: NotificationChannelType): Promise<NotificationPreference | null> {
    return prisma.notificationPreference.findUnique({
      where: {
        tenantId_userId_type_channel: {
          tenantId,
          userId,
          type,
          channel
        }
      }
    });
  }

  /**
   * List all preferences for a user
   */
  async findMany(tenantId: string, userId: string): Promise<NotificationPreference[]> {
    return prisma.notificationPreference.findMany({
      where: {
        tenantId,
        userId
      }
    });
  }

  /**
   * Upsert a preference (Enable/Disable a specific channel for a type)
   */
  async upsert(tenantId: string, userId: string, type: NotificationType, channel: NotificationChannelType, enabled: boolean): Promise<NotificationPreference> {
    return prisma.notificationPreference.upsert({
      where: {
        tenantId_userId_type_channel: {
          tenantId,
          userId,
          type,
          channel
        }
      },
      update: { 
        enabled,
        updatedAt: new Date()
      },
      create: {
        tenantId,
        userId,
        type,
        channel,
        enabled
      }
    });
  }
}
