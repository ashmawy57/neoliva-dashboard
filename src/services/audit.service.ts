import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getTraceContextSync } from '@/lib/observability/context';
import { getTenantContext } from '@/lib/tenant-context';
import { headers } from 'next/headers';

export interface AuditLogOptions {
  action: string;
  entityType: string;
  entityId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Logs a security-first, immutable audit record.
   * Auto-injects context (user, tenant, IP, UA, requestId).
   */
  static async logAudit(options: AuditLogOptions) {
    const { action, entityType, entityId, tenantId: explicitTenantId, metadata = {} } = options;
    const trace = getTraceContextSync();
    
    let tenantId = explicitTenantId;
    let userId: string | undefined;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    // 1. Resolve Context (if not explicitly provided)
    if (!tenantId) {
      try {
        const context = await getTenantContext();
        tenantId = context.tenantId;
        userId = context.user?.id;
      } catch {
        // Fallback to trace context (useful for background jobs where auth isn't available)
        tenantId = trace?.tenantId;
        userId = trace?.userId;
      }
    }

    // 2. Resolve Network Context
    try {
      const headersList = await headers();
      // x-forwarded-for might contain multiple IPs, we take the first one
      const forwardedFor = headersList.get('x-forwarded-for');
      ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
      userAgent = headersList.get('user-agent') || 'unknown';
    } catch {
      // Headers not available
    }

    if (!tenantId) {
      logger.error('Audit Log failed: Missing tenantId', { action, entityType });
      return;
    }

    // 3. Mask Sensitive Data
    const maskedMetadata = this.maskSensitiveFields(metadata);

    try {
      // 4. Persistence (IMMUTABLE - No update/delete exposed)
      const log = await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          entityType,
          entityId,
          metadata: maskedMetadata,
          ipAddress,
          userAgent,
          requestId: trace?.requestId,
        }
      });

      // 5. Correlate with System Logs
      logger.info(`Audit Log Created: ${action}`, {
        module: 'AUDIT_SERVICE',
        action,
        tenantId,
        userId,
        entityType,
        entityId,
        requestId: trace?.requestId,
        logId: log.id
      });

      return log;
    } catch (error) {
      // We log error but don't throw to prevent crashing the main workflow
      // though for a FORENSIC system, we might want to reconsider this later.
      logger.error('CRITICAL: Audit Log creation failed', error, {
        action,
        tenantId,
        userId
      });
    }
  }

  /**
   * Recursively masks sensitive fields in metadata JSON
   */
  private static maskSensitiveFields(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.maskSensitiveFields(item));

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'cvv', 
      'card', 'ssn', 'pin', 'auth', 'credential'
    ];
    
    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        masked[key] = '********';
      } else if (typeof value === 'object') {
        masked[key] = this.maskSensitiveFields(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}
