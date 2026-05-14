import { BusinessEvent } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { enqueueJob, JOB_TYPE } from '@/services/job.service';

/**
 * Derived Intelligence Engine
 *
 * Listens to incoming business events and schedules secondary
 * derived-event checks via the database job queue (no Redis required).
 *
 * All scheduling calls are idempotent via content-hash dedup keys.
 */
export async function triggerDerivedEvents(event: BusinessEvent) {
  switch (event.eventType) {
    case 'APPOINTMENT_SCHEDULED':
      await scheduleNoShowCheck(event);
      break;

    case 'INVOICE_CREATED':
      await scheduleOverdueCheck(event);
      break;

    case 'ALLERGY_ADDED':
      await handleHighSeverityAllergy(event);
      break;

    case 'APPOINTMENT_COMPLETED':
      await checkTreatmentProgress(event);
      break;

    case 'TREATMENT_PLAN_CREATED':
    case 'TREATMENT_PLAN_STATUS_CHANGED': {
      const meta = event.metadata as any;
      if (event.eventType === 'TREATMENT_PLAN_CREATED' || meta?.action === 'PHASE_ADDED') {
        await scheduleTreatmentDelayedChecks(event);
      }
      break;
    }

    default:
      break;
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleHighSeverityAllergy(event: BusinessEvent) {
  const metadata = event.metadata as any;
  const severity = metadata?.severity?.toLowerCase();

  if (severity === 'high' || severity === 'severe') {
    logger.warn('HIGH SEVERITY ALLERGY DETECTED', {
      patientId: event.entityId,
      allergen:  metadata.allergen,
    });

    // Direct persistence — avoids circular dep with EventService
    await prisma.businessEvent.create({
      data: {
        tenantId:   event.tenantId,
        eventType:  'SYSTEM_ALERT',
        entityType: 'PATIENT',
        entityId:   event.entityId,
        userId:     event.userId,
        metadata: {
          alertType:       'CRITICAL_ALLERGY',
          message:         `High severity allergy added: ${metadata.allergen}`,
          originalEventId: event.id,
        },
      },
    });
  }
}

async function scheduleNoShowCheck(event: BusinessEvent) {
  const metadata = event.metadata as any;
  if (!metadata?.startTime) return;

  const startTime = new Date(metadata.startTime);
  const runAt     = new Date(startTime.getTime() + 15 * 60 * 1000); // +15 min

  if (runAt <= new Date()) return; // appointment is in the past — skip

  await enqueueJob({
    type:      JOB_TYPE.CHECK_PATIENT_NO_SHOW,
    payload:   { appointmentId: event.entityId, tenantId: event.tenantId },
    runAt,
    tenantId:  event.tenantId,
    // Stable dedup key: one no-show check per appointment
    dedupKey:  `no-show:${event.entityId}`,
  });

  logger.info('[DerivedEvents] Scheduled NO_SHOW check', {
    appointmentId: event.entityId,
    runAt: runAt.toISOString(),
  });
}

async function scheduleOverdueCheck(event: BusinessEvent) {
  const metadata = event.metadata as any;
  if (!metadata?.dueDate) return;

  const runAt = new Date(metadata.dueDate);
  if (runAt <= new Date()) return; // already past due — skip initial scheduling

  await enqueueJob({
    type:     JOB_TYPE.CHECK_INVOICE_OVERDUE,
    payload:  { invoiceId: event.entityId, tenantId: event.tenantId },
    runAt,
    tenantId: event.tenantId,
    // Stable dedup key: one overdue check per invoice
    dedupKey: `overdue:${event.entityId}`,
  });

  logger.info('[DerivedEvents] Scheduled OVERDUE check', {
    invoiceId: event.entityId,
    runAt: runAt.toISOString(),
  });
}

async function checkTreatmentProgress(event: BusinessEvent) {
  const { tenantId, entityId: appointmentId } = event;

  try {
    const appointment = await prisma.appointment.findUnique({
      where:  { id: appointmentId },
      select: { patientId: true, serviceId: true },
    });

    if (!appointment?.serviceId) return;

    const pendingItems = await prisma.treatmentPlanItem.findMany({
      where: {
        tenantId,
        plan:      { patientId: appointment.patientId, status: 'Active' },
        serviceId: appointment.serviceId,
        status:    'Planned',
      },
      orderBy: { step: 'asc' },
    });

    if (pendingItems.length === 0) return;

    const nextItem = pendingItems[0];

    await prisma.treatmentPlanItem.update({
      where: { id: nextItem.id },
      data:  { status: 'Completed' },
    });

    logger.info('[DerivedEvents] Auto-completed treatment plan item', {
      itemId:        nextItem.id,
      patientId:     appointment.patientId,
      appointmentId,
    });

    await prisma.businessEvent.create({
      data: {
        tenantId,
        eventType:  'TREATMENT_PLAN_STATUS_CHANGED',
        entityType: 'TREATMENT',
        entityId:   nextItem.planId,
        metadata: {
          patientId:     appointment.patientId,
          status:        'Item Completed',
          itemId:        nextItem.id,
          action:        'AUTO_COMPLETE',
          appointmentId,
        },
      },
    });
  } catch (error) {
    logger.error('[DerivedEvents] Error in checkTreatmentProgress', error, { appointmentId });
  }
}

async function scheduleTreatmentDelayedChecks(event: BusinessEvent) {
  const { tenantId, entityId: planId } = event;

  try {
    const items = await prisma.treatmentPlanItem.findMany({
      where: {
        planId,
        tenantId,
        status:        'Planned',
        scheduledDate: { not: null },
      },
    });

    for (const item of items) {
      if (!item.scheduledDate) continue;

      // Check at end-of-day on the scheduled date
      const runAt = new Date(item.scheduledDate);
      runAt.setHours(23, 59, 59, 999);

      if (runAt <= new Date()) continue; // already past — skip

      await enqueueJob({
        type:     JOB_TYPE.CHECK_TREATMENT_DELAYED,
        payload:  { itemId: item.id, tenantId },
        runAt,
        tenantId,
        // Stable per-item dedup key (replaces BullMQ's jobId: `delay-check-${item.id}`)
        dedupKey: `delay-check:${item.id}`,
      });

      logger.info('[DerivedEvents] Scheduled TREATMENT_DELAYED check', {
        itemId: item.id,
        runAt:  runAt.toISOString(),
      });
    }
  } catch (error) {
    logger.error('[DerivedEvents] Failed to schedule treatment delay checks', error, { planId });
  }
}
