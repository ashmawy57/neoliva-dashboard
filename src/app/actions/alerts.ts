'use server';

import { getTenantContext } from '@/lib/tenant-context';
import { requirePermission } from '@/lib/rbac';
import { PermissionCode } from '@/types/permissions';
import { getOperationalAlerts, type OperationalAlert } from '@/services/alerts.service';

/**
 * Server Action: returns the top operational alerts for the current tenant.
 * Enforces ADMIN_FULL_ACCESS — only OWNER and ADMIN roles can call this.
 */
export async function getAlerts(): Promise<OperationalAlert[]> {
  // 1. Gate: only OWNER / ADMIN
  await requirePermission(PermissionCode.ADMIN_FULL_ACCESS);

  // 2. Resolve tenant
  const { tenantId } = await getTenantContext();

  // 3. Fetch alerts
  return getOperationalAlerts(tenantId);
}
