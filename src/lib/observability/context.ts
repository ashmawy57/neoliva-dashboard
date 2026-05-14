import { AsyncLocalStorage } from "node:async_hooks";
import { headers } from "next/headers";

export interface TraceContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  module?: string;
  action?: string;
}

export const traceStorage = new AsyncLocalStorage<TraceContext>();

/**
 * Sync version to get context from AsyncLocalStorage
 */
export function getTraceContextSync(): TraceContext | undefined {
  return traceStorage.getStore();
}

/**
 * Async version to get context, falling back to headers
 */
export async function getTraceContext(): Promise<TraceContext | undefined> {
  const store = getTraceContextSync();
  if (store) return store;

  try {
    const headersList = await headers();
    const requestId = headersList.get("x-request-id");
    if (requestId) {
      return { requestId };
    }
  } catch {
    // Headers not available
  }

  return undefined;
}

/**
 * Runs a function within a trace context
 */
export function withTrace<T>(context: TraceContext, fn: () => T): T {
  return traceStorage.run(context, fn);
}
