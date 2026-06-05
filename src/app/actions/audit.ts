'use server'

import { AuditRepository } from "@/repositories/audit.repository";
import { resolveTenantContextOrRedirect as resolveTenantContext } from "@/lib/auth/resolve-tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

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
  await requirePermission(PermissionCode.AUDIT_VIEW);
  const { tenantId } = await resolveTenantContext();

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
      success: true,
      logs,
      total,
      hasMore: offset + limit < total
    };
  } catch (error: any) {
    console.error('[AuditAction] Failed to fetch logs:', error);
    return { success: false, error: 'Failed to fetch audit logs' };
  }
}

/**
 * Fetches unique actions and entity types for filters.
 */
export async function getAuditMetadata() {
  await requirePermission(PermissionCode.AUDIT_VIEW);
  const { tenantId } = await resolveTenantContext();

  const [actions, entityTypes] = await Promise.all([
    auditRepository.getDistinctActions(tenantId),
    auditRepository.getDistinctEntityTypes(tenantId)
  ]);

  return {
    actions,
    entityTypes
  };
}

