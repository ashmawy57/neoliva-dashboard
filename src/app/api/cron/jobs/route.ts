import { NextRequest, NextResponse } from 'next/server';
import { runWorker } from '@/lib/cron/worker';
import { pruneOldJobs } from '@/services/job.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/cron/jobs
 *
 * Vercel Cron endpoint — runs every minute via vercel.json schedule.
 * Also callable manually with the CRON_SECRET for local testing.
 *
 * Security:
 *   - Requires `Authorization: Bearer <CRON_SECRET>` header
 *   - CRON_SECRET must be set as an environment variable
 *   - Vercel automatically injects this header for scheduled invocations
 */
export async function GET(req: NextRequest) {
  // ── Authentication ────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    logger.error('[CronRoute] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim();

  if (token !== secret) {
    logger.warn('[CronRoute] Unauthorized cron request', {
      ip: req.headers.get('x-forwarded-for') ?? 'unknown',
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Execute batch ─────────────────────────────────────────────────────────
  const runStart = Date.now();

  try {
    const result = await runWorker();

    // Opportunistically prune on ~1% of runs (avoid adding a separate cron)
    if (Math.random() < 0.01) {
      pruneOldJobs(7).catch(() => {});
    }

    const totalMs = Date.now() - runStart;
    logger.info('[CronRoute] Run finished', { ...result, totalMs });

    return NextResponse.json({ ok: true, ...result, totalMs });
  } catch (err) {
    // runWorker is fail-safe; this catch is a last-resort guard
    logger.error('[CronRoute] Unexpected error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Vercel requires GET for cron routes. Block other methods.
 */
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
