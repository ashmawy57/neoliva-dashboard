'use server'

import { withPermission } from "@/lib/rbac/guard";





import { getOperationalAlerts, type OperationalAlert } from '@/services/alerts.service';

/**
 * Server Action: returns the top operational alerts for the current tenant.
 * Enforces ADMIN_FULL_ACCESS — only OWNER and ADMIN roles can call this.
 */
export async function getAlerts() {
  return withPermission('reports', 'read', async (session) => {
    const tenantId = session.tenantId;
    // 1. Gate: only OWNER / ADMIN
      
    
      // 2. Resolve tenant
      
    
      // 3. Fetch alerts
      return getOperationalAlerts(tenantId);
  });
}
