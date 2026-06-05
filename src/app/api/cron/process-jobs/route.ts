export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { 
  recoverStuckJobs, 
  fetchAndLockPendingJobs, 
  executeJob, 
  markJobCompleted, 
  markJobFailed 
} from '@/services/job.service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // 1. Authorization Guard
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret) {
    logger.error('[Cron API] CRON_SECRET is not configured in the environment variables.');
    return NextResponse.json({ error: 'Cron service configuration error' }, { status: 500 });
  }

  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const authorized = (token === expectedSecret) || (querySecret === expectedSecret);

  if (!authorized) {
    logger.warn('[Cron API] Unauthorized request attempt to trigger cron.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  logger.info('[Cron API] Starting background job execution run...');

  let recoveredCount = 0;
  let successCount = 0;
  let failureCount = 0;
  const executedJobs: Array<{ id: string; type: string; success: boolean; error?: string }> = [];

  try {
    // 2. Deadlock Recovery: Sweeper for jobs stuck in 'PROCESSING'
    recoveredCount = await recoverStuckJobs();

    // 3. Claim Pending Jobs: Fetch and lock up to 10 jobs
    const pendingJobs = await fetchAndLockPendingJobs(10);
    logger.info(`[Cron API] Locked ${pendingJobs.length} jobs for execution.`);

    // 4. Job Loop Execution
    for (const job of pendingJobs) {
      try {
        await executeJob(job);
        await markJobCompleted(job.id);
        
        successCount++;
        executedJobs.push({ id: job.id, type: job.type, success: true });
        logger.info(`[Cron API] Job completed successfully`, { jobId: job.id, type: job.type });
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await markJobFailed(job.id, err);
        
        failureCount++;
        executedJobs.push({ id: job.id, type: job.type, success: false, error: errorMsg });
        logger.error(`[Cron API] Job execution failed`, err, { jobId: job.id, type: job.type });
      }
    }

    logger.info('[Cron API] Job execution run completed.', {
      recovered: recoveredCount,
      successCount,
      failureCount
    });

    return NextResponse.json({
      success: true,
      recovered: recoveredCount,
      totalProcessed: pendingJobs.length,
      successCount,
      failureCount,
      jobs: executedJobs
    }, { status: 200 });

  } catch (error: any) {
    logger.error('[Cron API] Critical error inside cron API route', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}
