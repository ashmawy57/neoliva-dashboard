import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/client";

export class EventRepository {
  async create(tenantId: string, data: {
    userId?: string | null;
    eventType: string;
    entityType: string;
    entityId?: string | null;
    metadata?: any;
  }) {
    return prisma.businessEvent.create({
      data: {
        tenantId,
        userId: data.userId,
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || {},
      },
    });
  }

  async findMany(tenantId: string, limit = 100) {
    return prisma.businessEvent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            memberships: {
              where: { tenantId },
              include: {
                staffProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findUnique(tenantId: string, id: string) {
    return prisma.businessEvent.findUnique({
      where: { id, tenantId },
    });
  }

  async getOperationalAlertsCount(tenantId: string, since: Date, eventTypes: string[]) {
    return prisma.businessEvent.groupBy({
      by: ['eventType'],
      where: {
        tenantId,
        createdAt: { gte: since },
        eventType: { in: eventTypes },
      },
      _count: { id: true },
    });
  }
}
