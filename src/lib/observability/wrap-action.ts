import * as Sentry from "@sentry/nextjs";
import { logger } from "../logger";
import { withTrace } from "./context";
import { randomUUID } from "node:crypto";

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
}

import { AuditService } from "@/services/audit.service";

import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Higher-order function to wrap server actions with observability and forensic auditing.
 */
export function wrapAction<T, Args extends any[]>(
  name: string,
  fn: (...args: Args) => Promise<T>,
  metadata: { module: string; entityType?: string; entityIdPath?: string }
) {
  return async (...args: Args): Promise<ActionResponse<T>> => {
    const requestId = randomUUID();
    
    return await withTrace({ requestId, module: metadata.module, action: name }, async () => {
      const startTime = Date.now();
      
      try {
        logger.info(`Action Started: ${name}`, { args: sanitizeArgs(args) });
        
        const result = await fn(...args);
        
        const duration = Date.now() - startTime;
        logger.info(`Action Success: ${name}`, { duration: `${duration}ms` });
        
        // --- AUDIT LOG (Success) ---
        // Extract entityId if path provided (e.g. args[0].id)
        let entityId: string | undefined;
        if (metadata.entityIdPath && args[0]) {
          entityId = args[0][metadata.entityIdPath];
        }

        await AuditService.logAudit({
          action: name.toUpperCase(),
          entityType: metadata.entityType || metadata.module.toUpperCase(),
          entityId,
          metadata: {
            duration: `${duration}ms`,
            status: 'SUCCESS',
            args: sanitizeArgs(args)
          }
        });
        
        return { success: true, data: result, requestId };
      } catch (error: any) {
        // CRITICAL: Let Next.js redirect() errors propagate naturally.
        if (isRedirectError(error)) {
          // Log success before redirecting
          const duration = Date.now() - startTime;
          await AuditService.logAudit({
            action: name.toUpperCase(),
            entityType: metadata.entityType || metadata.module.toUpperCase(),
            metadata: {
              duration: `${duration}ms`,
              status: 'SUCCESS',
              type: 'REDIRECT'
            }
          });
          throw error;
        }

        const duration = Date.now() - startTime;
        
        // Log to Pino
        logger.error(`Action Failed: ${name}`, error, { 
          duration: `${duration}ms`,
          args: sanitizeArgs(args) 
        });

        // --- AUDIT LOG (Failure) ---
        await AuditService.logAudit({
          action: `${name.toUpperCase()}_FAILED`,
          entityType: metadata.entityType || metadata.module.toUpperCase(),
          metadata: {
            duration: `${duration}ms`,
            status: 'FAILURE',
            error: error.message,
            args: sanitizeArgs(args)
          }
        });

        // Report to Sentry
        Sentry.captureException(error, {
          tags: {
            action: name,
            module: metadata.module,
            requestId
          },
          extra: {
            args: sanitizeArgs(args)
          }
        });

        return { 
          success: false,
          error: error.message || "An unexpected error occurred", 
          requestId 
        };
      }
    });
  };
}



/**
 * Remove sensitive data like passwords before logging
 */
function sanitizeArgs(args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg !== 'object' || arg === null) return arg;
    
    const sanitized = { ...arg };
    const sensitiveKeys = ['password', 'token', 'secret', 'key'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  });
}
