export * from "./context";
export * from "./wrap-action";
export * from "./monitor-worker";
export * from "./trace-middleware";

/**
 * OBSERVABILITY SYSTEM GUIDE
 * 
 * 1. LOGGING:
 * Use import { logger } from "@/lib/logger"
 * logger.info("message", { extra: "data" })
 * logger.error("message", error, { extra: "data" })
 * 
 * 2. SERVER ACTIONS:
 * Wrap all server actions using wrapAction helper:
 * export const myAction = wrapAction("actionName", async (args) => { ... }, { module: "Module" })
 * 
 * 3. BULLMQ:
 * Monitor workers using monitorWorker:
 * monitorWorker(myWorker)
 * 
 * 4. SENTRY:
 * Automatically captures errors from wrapAction and monitorWorker.
 * DSN must be set in NEXT_PUBLIC_SENTRY_DSN environment variable.
 */
