'use server';

import { prisma } from '@/lib/prisma';
import { resolveTenantContext } from '@/lib/tenant-context';
import { EventService } from '@/services/event.service';
import { revalidatePath } from 'next/cache';

export async function getEvents(limit = 100) {
  const { tenantId } = await resolveTenantContext();
  
  return prisma.businessEvent.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        include: {
          staff: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function replayEvent(eventId: string) {
  const { tenantId } = await resolveTenantContext();
  
  const event = await prisma.businessEvent.findUnique({
    where: { id: eventId, tenantId },
  });

  if (!event) throw new Error('Event not found');

  // Simulate replay by tracking a similar event with a "REPLAYED_" prefix or metadata
  await EventService.trackEvent({
    tenantId: event.tenantId,
    userId: event.userId || undefined,
    eventType: event.eventType as any,
    entityType: event.entityType as any,
    entityId: event.entityId || undefined,
    metadata: {
      ...(event.metadata as any),
      _replayedFrom: event.id,
      _replayedAt: new Date().toISOString(),
    },
  });

  revalidatePath('/dashboard/events-debug');
  return { success: true };
}
