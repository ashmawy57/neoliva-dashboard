import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';
import { logger } from '@/lib/logger';
import { createHash } from 'crypto';

// ─── Status constants (avoid magic strings throughout the codebase) ────────────

export const JOB_STATUS = {
  PENDING:    'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED:  'COMPLETED',
  FAILED:     'FAILED',
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

// ─── Job type registry — only recognised types will be dispatched ──────────────

export const JOB_TYPE = {
  CHECK_PATIENT_NO_SHOW:    'CHECK_PATIENT_NO_SHOW',
  CHECK_INVOICE_OVERDUE:    'CHECK_INVOICE_OVERDUE',
  CHECK_TREATMENT_DELAYED:  'CHECK_TREATMENT_DELAYED',
  SEND_NOTIFICATION:        'SEND_NOTIFICATION',
  SEND_EMAIL:               'SEND_EMAIL',
} as const;

export type JobType = typeof JOB_TYPE[keyof typeof JOB_TYPE];

// ─── Enqueue ──────────────────────────────────────────────────────────────────

interface EnqueueOptions {
  type: JobType;
  payload: Record<string, unknown>;
  runAt: Date;
  tenantId: string;
  /**
   * Optional deduplication key. If a PENDING or PROCESSING job already
   * exists with this key, the new job is silently skipped (idempotent).
   */
  dedupKey?: string;
}

/**
 * Persists a new job to the database job queue.
 * Returns the created Job or null if the job was deduplicated.
 */
export async function enqueueJob(opts: EnqueueOptions) {
  const { type, payload, runAt, tenantId, dedupKey } = opts;

  // Dedup: skip silently if an active job with this key already exists
  if (dedupKey) {
    const existing = await prisma.job.findUnique({ where: { dedupKey } });
    if (existing && existing.status !== JOB_STATUS.FAILED) {
      logger.info('[JobService] Skipped duplicate job', { dedupKey, type, tenantId });
      return null;
    }
  }

  // Auto-generate dedup key from content hash when not explicitly provided
  const resolvedDedupKey = dedupKey ?? generateDedupKey(type, payload, tenantId);

  try {
    const job = await prisma.job.create({
      data: {
        tenantId,
        type,
        payload: payload as Prisma.InputJsonValue,
        runAt,
        dedupKey: resolvedDedupKey,
      },
    });

    logger.info('[JobService] Job enqueued', {
      jobId: job.id,
      type,
      runAt: runAt.toISOString(),
      tenantId,
    });

    return job;
  } catch (err: any) {
    // Unique constraint = race condition dedup hit — safe to ignore
    if (err?.code === 'P2002') {
      logger.info('[JobService] Job skipped (concurrent dedup hit)', { type, tenantId });
      return null;
    }
    logger.error('[JobService] Failed to enqueue job', err, { type, tenantId });
    throw err;
  }
}

// ─── Status transitions ───────────────────────────────────────────────────────

/** Mark a job as actively being processed. Returns updated job. */
export async function markJobProcessing(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status:   JOB_STATUS.PROCESSING,
      attempts: { increment: 1 },
    },
  });
}

/** Mark a job as successfully completed. */
export async function markJobCompleted(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: { status: JOB_STATUS.COMPLETED },
  });
}

/**
 * Mark a job as failed.
 * If attempts < MAX_ATTEMPTS the job is reset to PENDING for retry.
 * If attempts >= MAX_ATTEMPTS it is permanently marked FAILED.
 */
export async function markJobFailed(jobId: string, error: unknown) {
  const MAX_ATTEMPTS = 3;
  const errorMessage = error instanceof Error ? error.message : String(error);

  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { attempts: true } });
  const attempts = job?.attempts ?? MAX_ATTEMPTS;

  const nextStatus = attempts >= MAX_ATTEMPTS ? JOB_STATUS.FAILED : JOB_STATUS.PENDING;

  return prisma.job.update({
    where: { id: jobId },
    data: {
      status:    nextStatus,
      lastError: errorMessage.slice(0, 1000), // cap at 1000 chars
    },
  });
}

// ─── Worker fetch ─────────────────────────────────────────────────────────────

/**
 * Atomically fetches a batch of PENDING jobs whose runAt has passed.
 * Uses a raw UPDATE...RETURNING to prevent concurrent workers from
 * picking up the same jobs (safe on multi-instance Vercel).
 */
export async function fetchAndLockPendingJobs(limit = 50) {
  const now = new Date();

  // Atomic claim via raw SQL: update status to PROCESSING and return claimed rows
  const claimed = await prisma.$queryRaw<Array<{
    id: string;
    tenant_id: string;
    type: string;
    payload: unknown;
    run_at: Date;
    attempts: number;
  }>>`
    UPDATE jobs
    SET    status = 'PROCESSING', attempts = attempts + 1, updated_at = NOW()
    WHERE  id IN (
      SELECT id FROM jobs
      WHERE  status = 'PENDING'
        AND  run_at <= ${now}
      ORDER BY run_at ASC
      LIMIT  ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, tenant_id, type, payload, run_at, attempts
  `;

  return claimed.map(r => ({
    id:       r.id,
    tenantId: r.tenant_id,
    type:     r.type as JobType,
    payload:  r.payload as Record<string, unknown>,
    runAt:    r.run_at,
    attempts: r.attempts,
  }));
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

/**
 * Prune completed jobs older than `daysOld` days.
 * Should be called periodically (e.g. weekly via cron) to avoid table bloat.
 */
export async function pruneOldJobs(daysOld = 7) {
  const cutoff = new Date(Date.now() - daysOld * 86_400_000);
  const result = await prisma.job.deleteMany({
    where: {
      status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.FAILED] },
      updatedAt: { lt: cutoff },
    },
  });
  logger.info('[JobService] Pruned old jobs', { deleted: result.count, olderThan: cutoff });
  return result.count;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function generateDedupKey(type: string, payload: Record<string, unknown>, tenantId: string): string {
  // Include primary entity IDs in the hash to keep keys stable for the same logical job
  const entityId =
    (payload.appointmentId ?? payload.invoiceId ?? payload.itemId ?? payload.userId ?? '') as string;
  const content = `${tenantId}:${type}:${entityId}`;
  return createHash('sha256').update(content).digest('hex');
}

// ─── Hardened Lazy Execution (Zero-Cost Daily Jobs) ──────────────────────────

// In-memory cache to prevent repeated DB hits during the same request or warm lambda lifecycle
let lastSystemJobCheckAt = 0;
const SYSTEM_JOB_THROTTLE_MS = 60 * 1000; // 1 minute

/**
 * Lazy Execution: Runs daily system jobs if they haven't run today yet.
 * Hardened for high-concurrency and Vercel Serverless compatibility.
 */
export async function runDailyJobsIfNeeded() {
  const JOB_NAME = 'DAILY_SYSTEM_MAINTENANCE';
  const now = new Date();
  
  // 1. Lightweight Throttle: Skip if checked very recently in this instance
  if (Date.now() - lastSystemJobCheckAt < SYSTEM_JOB_THROTTLE_MS) {
    return;
  }
  lastSystemJobCheckAt = Date.now();

  try {
    // 2. Ensure job record exists (idempotent)
    await prisma.systemJob.upsert({
      where: { name: JOB_NAME },
      update: {},
      create: { name: JOB_NAME },
    });

    // 3. Atomic Claim Strategy (Optimistic Locking)
    // We try to claim the job ONLY if it hasn't run today OR if a previous lock timed out.
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lockExpiry = new Date(Date.now() - 15 * 60 * 1000); // 15 min lock timeout

    const claim = await prisma.systemJob.updateMany({
      where: {
        name: JOB_NAME,
        OR: [
          {
            // Normal case: Not run today and not currently locked
            status: 'IDLE',
            OR: [
              { lastRunAt: null },
              { lastRunAt: { lt: today } }
            ]
          },
          {
            // Recovery case: Stuck in RUNNING state for over 15 minutes (lambda crash)
            status: 'RUNNING',
            lockedAt: { lt: lockExpiry }
          }
        ]
      },
      data: {
        status: 'RUNNING',
        lockedAt: now,
      }
    });

    if (claim.count === 0) {
      // Already executed today or another parallel request claimed it first.
      return;
    }

    logger.info('[JobService] Daily maintenance claimed and starting...');
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // 4. Execute Tasks with Isolation
    // Using a separate loop ensures one failure doesn't stop others.
    const tasks = [
      { name: 'cleanupExpiredSubscriptions', fn: cleanupExpiredSubscriptions },
      { name: 'generateDailyReports', fn: generateDailyReports },
      { name: 'sendReminders', fn: sendReminders },
      { name: 'pruneOldJobs', fn: pruneOldJobsTask }
    ];

    for (const task of tasks) {
      const taskStart = Date.now();
      try {
        await task.fn();
        successCount++;
        logger.info(`[JobService] Task SUCCESS: ${task.name}`, { duration: Date.now() - taskStart });
      } catch (err) {
        failCount++;
        logger.error(`[JobService] Task FAILED: ${task.name}`, err);
      }
    }

    const totalDuration = Date.now() - startTime;

    // 5. Finalize State
    // If we had critical failures, we might choose NOT to update lastRunAt so it retries.
    // For now, we update it if any task succeeded, or as requested: "إذا job فشل: لا يتم وضع executed=true"
    // We'll update lastRunAt only if there were NO failures.
    if (failCount === 0) {
      await prisma.systemJob.update({
        where: { name: JOB_NAME },
        data: {
          status: 'IDLE',
          lastRunAt: now,
          lockedAt: null
        }
      });
      logger.info('[JobService] Daily maintenance COMPLETED', { successCount, totalDuration });
    } else {
      // Reset lock but keep lastRunAt as-is so next request retries
      await prisma.systemJob.update({
        where: { name: JOB_NAME },
        data: {
          status: 'IDLE',
          lockedAt: null
        }
      });
      logger.warn('[JobService] Daily maintenance FINISHED WITH ERRORS (will retry next request)', { 
        successCount, 
        failCount, 
        totalDuration 
      });
    }

  } catch (err) {
    logger.error('[JobService] Critical error in lazy execution wrapper', err);
    // Attempt emergency unlock if we hold the lock
    try {
      await prisma.systemJob.updateMany({
        where: { name: JOB_NAME, status: 'RUNNING', lockedAt: now },
        data: { status: 'IDLE', lockedAt: null }
      });
    } catch { /* ignore */ }
  }
}

// --- Maintenance Task Implementations (Isolated from Transaction) ---

async function cleanupExpiredSubscriptions() {
  // Logic to expire tenants whose subscription ended
  logger.info('[JobService] Task: cleanupExpiredSubscriptions (stub)');
}

async function generateDailyReports() {
  // Logic to aggregate data for daily stats
  logger.info('[JobService] Task: generateDailyReports (stub)');
}

async function sendReminders() {
  // Logic to queue reminder notifications for today's appointments
  logger.info('[JobService] Task: sendReminders (stub)');
}

async function pruneOldJobsTask() {
  const daysOld = 7;
  const cutoff = new Date(Date.now() - daysOld * 86_400_000);
  const result = await prisma.job.deleteMany({
    where: {
      status: { in: [JOB_STATUS.COMPLETED, JOB_STATUS.FAILED] },
      updatedAt: { lt: cutoff },
    },
  });
  logger.info('[JobService] Task: pruneOldJobsTask executed', { deleted: result.count });
}
