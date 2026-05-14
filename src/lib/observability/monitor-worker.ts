/**
 * monitor-worker.ts — compatibility shim
 *
 * BullMQ workers have been removed (replaced by database-driven cron).
 * This file is kept as a no-op to avoid breaking any remaining import
 * references in the observability module.
 *
 * Job observability is now handled directly in src/lib/cron/worker.ts
 * via logger + BusinessEvent emission.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function monitorWorker(_worker: unknown): unknown {
  return _worker;
}
