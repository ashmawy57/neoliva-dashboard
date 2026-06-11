'use server'

import { withPermission } from "@/lib/rbac/guard";


import { EventRepository } from '@/repositories/event.repository';

import { EventService } from '@/services/event.service';
import { revalidatePath } from 'next/cache';

const eventRepository = new EventRepository();

export async function getEvents(limit = 100) {
  return withPermission('reports', 'read', async (session) => {
    const tenantId = session.tenantId;
    return eventRepository.findMany(tenantId, limit);
  });
}

export async function replayEvent(eventId: string) {
  return withPermission('reports', 'read', async (session) => {
    const tenantId = session.tenantId;
    const event = await eventRepository.findUnique(tenantId, eventId);
    
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
      return { success: true, error: undefined };
  });
}

