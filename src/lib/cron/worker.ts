import { fetchAndLockPendingJobs, markJobCompleted, markJobFailed, JOB_TYPE } from '@/services/job.service';
import {
  handleCheckPatientNoShow,
  handleCheckInvoiceOverdue,
  handleCheckTreatmentDelayed,
  handleSendNotification,
  handleSendEmail,
} from '@/lib/cron/handlers';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

// ─── Handler dispatch map ─────────────────────────────────────────────────────

type HandlerFn = (payload: Record<string, unknown>, tenantId: string) => Promise<void>;

const HANDLERS: Record<string, HandlerFn> = {
  [JOB_TYPE.CHECK_PATIENT_NO_SHOW]:   handleCheckPatientNoShow,
  [JOB_TYPE.CHECK_INVOICE_OVERDUE]:   handleCheckInvoiceOverdue,
  [JOB_TYPE.CHECK_TREATMENT_DELAYED]: handleCheckTreatmentDelayed,
  [JOB_TYPE.SEND_NOTIFICATION]:       handleSendNotification,
  [JOB_TYPE.SEND_EMAIL]:              handleSendEmail,
};

const BATCH_SIZE = 50;

// ─── Worker ───────────────────────────────────────────────────────────────────

/**
 * runWorker()
 *
 * Single-invocation cron worker. Called once per minute from the API route.
 *
 * Contract:
 * - Never throws (fail-safe)
 * - Never marks the same job twice (atomic SKIP LOCKED fetch)
 * - Each job failure is isolated — does NOT abort remaining batch
 * - Emits structured logs for every start, success, and failure
 *
 * @returns Summary of the batch run
 */
export async function runWorker(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  durationMs: number;
}> {
  const workerStart = Date.now();
  let processed = 0, succeeded = 0, failed = 0, skipped = 0;

  try {
    // 1. Atomically claim up to BATCH_SIZE pending jobs
    const jobs = await fetchAndLockPendingJobs(BATCH_SIZE);

    if (jobs.length === 0) {
      logger.info('[CronWorker] No pending jobs', { at: new Date().toISOString() });
      return { processed: 0, succeeded: 0, failed: 0, skipped: 0, durationMs: Date.now() - workerStart };
    }

    logger.info('[CronWorker] Batch start', { count: jobs.length, at: new Date().toISOString() });

    // 2. Process jobs in parallel within the batch (each isolated)
    await Promise.allSettled(
      jobs.map(async job => {
        processed++;
        const jobStart = Date.now();

        const handler = HANDLERS[job.type];

        if (!handler) {
          // Unknown job type — mark as failed immediately, do not retry
          await markJobFailed(job.id, new Error(`No handler registered for job type: ${job.type}`));
          logger.warn('[CronWorker] Unknown job type — marked failed', { jobId: job.id, type: job.type });
          failed++;
          return;
        }

        try {
          await handler(job.payload, job.tenantId);
          await markJobCompleted(job.id);

          const duration = Date.now() - jobStart;
          logger.info('[CronWorker] Job completed', {
            jobId:    job.id,
            type:     job.type,
            tenantId: job.tenantId,
            duration,
          });

          // Emit observability event (fire-and-forget — don't block)
          emitJobEvent('JOB_EXECUTED', job.id, job.type, job.tenantId, duration).catch(() => {});
          succeeded++;
        } catch (err) {
          const duration = Date.now() - jobStart;
          await markJobFailed(job.id, err);

          logger.error('[CronWorker] Job failed', err, {
            jobId:    job.id,
            type:     job.type,
            tenantId: job.tenantId,
            attempts: job.attempts,
            duration,
          });

          emitJobEvent('JOB_FAILED', job.id, job.type, job.tenantId, duration, err).catch(() => {});
          failed++;
        }
      })
    );

  } catch (err) {
    // Outer failure (e.g. DB fetch failed) — log but never throw
    logger.error('[CronWorker] Fatal batch error', err);
  }

  const durationMs = Date.now() - workerStart;
  logger.info('[CronWorker] Batch complete', { processed, succeeded, failed, skipped, durationMs });

  return { processed, succeeded, failed, skipped, durationMs };
}

// ─── Observability ────────────────────────────────────────────────────────────

async function emitJobEvent(
  eventType: 'JOB_EXECUTED' | 'JOB_FAILED',
  jobId: string,
  jobType: string,
  tenantId: string,
  durationMs: number,
  error?: unknown,
) {
  try {
    await prisma.businessEvent.create({
      data: {
        tenantId,
        eventType: 'SYSTEM_ALERT',
        entityType: 'SYSTEM',
        entityId: jobId,
        metadata: {
          cronEvent:  eventType,
          jobType,
          jobId,
          durationMs,
          ...(error ? { error: error instanceof Error ? error.message : String(error) } : {}),
        },
      },
    });
  } catch {
    // Observability must never crash the worker
  }
}
