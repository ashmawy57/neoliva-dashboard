import { prisma } from '@/lib/prisma';
import { EventService } from '@/services/event.service';
import { logger } from '@/lib/logger';

/**
 * Job Handlers
 * Each exported handler maps 1:1 to a JOB_TYPE value.
 * All handlers must be idempotent — safe to run more than once.
 */

// ─── CHECK_PATIENT_NO_SHOW ────────────────────────────────────────────────────

export async function handleCheckPatientNoShow(payload: Record<string, unknown>, tenantId: string) {
  const appointmentId = payload.appointmentId as string | undefined;
  if (!appointmentId) throw new Error('Missing appointmentId in payload');

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, tenantId }, // tenant isolation enforced in WHERE
  });

  if (!appointment) {
    logger.info('[Handler] Appointment not found — skipping no-show check', { appointmentId, tenantId });
    return;
  }

  // Idempotency: only trigger if still SCHEDULED (not already completed/cancelled/no-show)
  if (appointment.status !== 'SCHEDULED') {
    logger.info('[Handler] No-show check skipped — appointment status is not SCHEDULED', {
      appointmentId,
      status: appointment.status,
    });
    return;
  }

  // Mark appointment + emit derived event
  await prisma.appointment.update({
    where: { id: appointmentId },
    data:  { status: 'NO_SHOW' },
  });

  await EventService.trackEvent({
    tenantId,
    eventType:  'PATIENT_NO_SHOW',
    entityType: 'APPOINTMENT',
    entityId:   appointmentId,
    metadata: {
      originalDate: appointment.date,
      detectedAt:   new Date().toISOString(),
    },
  });

  logger.info('[Handler] Derived Event: PATIENT_NO_SHOW triggered', { appointmentId, tenantId });
}

// ─── CHECK_INVOICE_OVERDUE ────────────────────────────────────────────────────

export async function handleCheckInvoiceOverdue(payload: Record<string, unknown>, tenantId: string) {
  const invoiceId = payload.invoiceId as string | undefined;
  if (!invoiceId) throw new Error('Missing invoiceId in payload');

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, tenantId },
  });

  if (!invoice) {
    logger.info('[Handler] Invoice not found — skipping overdue check', { invoiceId, tenantId });
    return;
  }

  // Idempotency: already paid or cancelled → nothing to do
  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    logger.info('[Handler] Invoice overdue check skipped — already resolved', {
      invoiceId,
      status: invoice.status,
    });
    return;
  }

  await EventService.trackEvent({
    tenantId,
    eventType:  'INVOICE_OVERDUE',
    entityType: 'INVOICE',
    entityId:   invoiceId,
    metadata: {
      dueDate:    invoice.dueDate,
      amount:     invoice.totalAmount?.toString(),
      detectedAt: new Date().toISOString(),
    },
  });

  logger.info('[Handler] Derived Event: INVOICE_OVERDUE triggered', { invoiceId, tenantId });
}

// ─── CHECK_TREATMENT_DELAYED ──────────────────────────────────────────────────

export async function handleCheckTreatmentDelayed(payload: Record<string, unknown>, tenantId: string) {
  const itemId = payload.itemId as string | undefined;
  if (!itemId) throw new Error('Missing itemId in payload');

  const item = await prisma.treatmentPlanItem.findUnique({
    where:   { id: itemId, tenantId },
    include: { plan: { select: { id: true } } },
  });

  if (!item) {
    logger.info('[Handler] Treatment item not found — skipping delay check', { itemId, tenantId });
    return;
  }

  // Idempotency: only flag if still Planned after its scheduled date
  if (item.status !== 'Planned') {
    logger.info('[Handler] Treatment delay check skipped — item already progressed', {
      itemId,
      status: item.status,
    });
    return;
  }

  await EventService.trackEvent({
    tenantId,
    eventType:  'TREATMENT_DELAYED',
    entityType: 'TREATMENT',
    entityId:   item.planId,
    metadata: {
      itemId:        item.id,
      serviceName:   item.serviceName,
      scheduledDate: item.scheduledDate,
      detectedAt:    new Date().toISOString(),
    },
  });

  logger.info('[Handler] Derived Event: TREATMENT_DELAYED triggered', { itemId, tenantId });
}

// ─── SEND_NOTIFICATION ────────────────────────────────────────────────────────

export async function handleSendNotification(payload: Record<string, unknown>, tenantId: string) {
  // Lazily import to avoid circular deps (notification.service imports job.service)
  const { NotificationService } = await import('@/services/notification.service');
  const svc = new NotificationService();

  const { NotificationType, NotificationPriority } = await import('@/generated/client');

  await svc.createNotification(tenantId, {
    userId:           payload.userId as string,
    type:             (payload.type as any) ?? NotificationType.SYSTEM,
    priority:         (payload.priority as any) ?? NotificationPriority.LOW,
    title:            payload.title as string,
    message:          payload.message as string,
    actionUrl:        payload.actionUrl as string | undefined,
    deduplicationKey: payload.deduplicationKey as string | undefined,
    entityId:         payload.entityId as string | undefined,
    metadata:         payload.metadata,
  });
}

// ─── SEND_EMAIL ───────────────────────────────────────────────────────────────

export async function handleSendEmail(payload: Record<string, unknown>, tenantId: string) {
  // Stub — replace with your email provider (Resend, SendGrid, etc.)
  logger.info('[Handler] SEND_EMAIL executed', {
    to:       payload.to,
    subject:  payload.subject,
    tenantId,
  });
  // TODO: await emailProvider.send({ to, subject, html });
}
