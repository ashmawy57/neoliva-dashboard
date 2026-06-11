'use server'

import { withPermission } from "@/lib/rbac/guard";


import { AuditRepository } from "@/repositories/audit.repository";




const auditRepository = new AuditRepository();

export interface AuditFilterOptions {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetches audit logs with strict tenant isolation and RBAC.
 */
export async function getAuditLogs(filters: AuditFilterOptions = {}) {
  return withPermission('reports', 'read', async (session) => {
    const tenantId = session.tenantId;
    const {
        userId,
        action,
        entityType,
        entityId,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0
      } = filters;
    
      const where: any = {};
    
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }
    
      try {
        const [logs, total] = await Promise.all([
          auditRepository.findMany(tenantId, where, limit, offset),
          auditRepository.count(tenantId, where)
        ]);
    
        return {
          success: true, error: undefined,
          logs,
          total,
          hasMore: offset + limit < total
        };
      } catch (error: any) {
        console.error('[AuditAction] Failed to fetch logs:', error);
        return { success: false, data: undefined, error: 'Failed to fetch audit logs' };
      }
  });
}

/**
 * Fetches unique actions and entity types for filters.
 */
export async function getAuditMetadata() {
  return withPermission('reports', 'read', async (session) => {
    const tenantId = session.tenantId;
    const [actions, entityTypes] = await Promise.all([
        auditRepository.getDistinctActions(tenantId),
        auditRepository.getDistinctEntityTypes(tenantId)
      ]);
    
      return {
        actions,
        entityTypes
      };
  });
}

