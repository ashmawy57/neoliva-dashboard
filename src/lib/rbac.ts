import { resolveTenantContext } from "@/lib/auth/resolve-tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PermissionCode } from "@/types/permissions";
import { isAdminAllowlisted } from "@/lib/auth/auth-orchestrator";
import { normalizeRole } from "@/lib/auth/roles";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";

/**
 * PRODUCTION-GRADE RBAC MAPPING
 * This mapping defines the default permissions for each system role.
 * In the future, this can be moved to a Database-backed "RolePermissions" table.
 */
export const VALID_ROLES = ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'DOCTOR', 'ASSISTANT', 'RECEPTIONIST', 'ACCOUNTANT'] as const;
export type SystemRole = typeof VALID_ROLES[number];

const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  SUPER_ADMIN: Object.values(PermissionCode),
  OWNER: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.PATIENT_VIEW, PermissionCode.PATIENT_CREATE, PermissionCode.PATIENT_EDIT, PermissionCode.PATIENT_DELETE, PermissionCode.PATIENT_EXPORT,
    PermissionCode.APPOINTMENT_VIEW, PermissionCode.APPOINTMENT_CREATE, PermissionCode.APPOINTMENT_EDIT, PermissionCode.APPOINTMENT_DELETE, PermissionCode.APPOINTMENT_RECHEDULE,
    PermissionCode.BILLING_VIEW, PermissionCode.BILLING_INVOICE_CREATE, PermissionCode.BILLING_PAYMENT_RECORD, PermissionCode.BILLING_EXPENSE_MANAGE, PermissionCode.BILLING_REPORTS_VIEW,
    PermissionCode.FINANCE_VIEW,
    PermissionCode.INVENTORY_VIEW, PermissionCode.INVENTORY_MANAGE, PermissionCode.INVENTORY_STOCK_ADJUST,
    PermissionCode.STAFF_VIEW, PermissionCode.STAFF_MANAGE, PermissionCode.STAFF_INVITE, PermissionCode.STAFF_REPORTS_VIEW,
    PermissionCode.SETTINGS_CLINIC_EDIT, PermissionCode.SETTINGS_SERVICES_MANAGE, PermissionCode.SETTINGS_SECURITY_EDIT, PermissionCode.SETTINGS_SUBSCRIPTION_VIEW,
    PermissionCode.CLINICAL_NOTES_VIEW, PermissionCode.CLINICAL_NOTES_EDIT,
    PermissionCode.CLINICAL_CHART_VIEW, PermissionCode.CLINICAL_CHART_EDIT,
    PermissionCode.CLINICAL_PRESCRIPTION_MANAGE, PermissionCode.CLINICAL_LAB_ORDER_MANAGE, PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE,
    PermissionCode.ADMIN_FULL_ACCESS,
    PermissionCode.AUDIT_VIEW,
    PermissionCode.ROOM_VIEW, PermissionCode.ROOM_MANAGE, PermissionCode.ROOM_STAFF_ASSIGN, PermissionCode.ROOM_SCHEDULE_MANAGE
  ],
  
  ADMIN: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.PATIENT_VIEW, PermissionCode.PATIENT_CREATE, PermissionCode.PATIENT_EDIT, PermissionCode.PATIENT_EXPORT,
    PermissionCode.APPOINTMENT_VIEW, PermissionCode.APPOINTMENT_CREATE, PermissionCode.APPOINTMENT_EDIT, PermissionCode.APPOINTMENT_RECHEDULE,
    PermissionCode.BILLING_VIEW, PermissionCode.BILLING_INVOICE_CREATE, PermissionCode.BILLING_PAYMENT_RECORD, PermissionCode.BILLING_EXPENSE_MANAGE, PermissionCode.BILLING_REPORTS_VIEW,
    PermissionCode.FINANCE_VIEW,
    PermissionCode.INVENTORY_VIEW, PermissionCode.INVENTORY_MANAGE, PermissionCode.INVENTORY_STOCK_ADJUST,
    PermissionCode.STAFF_VIEW, PermissionCode.STAFF_MANAGE, PermissionCode.STAFF_INVITE, PermissionCode.STAFF_REPORTS_VIEW,
    PermissionCode.SETTINGS_CLINIC_EDIT, PermissionCode.SETTINGS_SERVICES_MANAGE,
    PermissionCode.CLINICAL_NOTES_VIEW, PermissionCode.CLINICAL_CHART_VIEW, PermissionCode.CLINICAL_CHART_EDIT,
    PermissionCode.CLINICAL_LAB_ORDER_MANAGE, PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE,
    PermissionCode.ADMIN_FULL_ACCESS,
    PermissionCode.AUDIT_VIEW,
    PermissionCode.ROOM_VIEW, PermissionCode.ROOM_MANAGE, PermissionCode.ROOM_STAFF_ASSIGN, PermissionCode.ROOM_SCHEDULE_MANAGE
  ],

  DOCTOR: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.PATIENT_VIEW, PermissionCode.PATIENT_EDIT,
    PermissionCode.CLINICAL_NOTES_VIEW, PermissionCode.CLINICAL_NOTES_EDIT,
    PermissionCode.CLINICAL_CHART_VIEW, PermissionCode.CLINICAL_CHART_EDIT,
    PermissionCode.CLINICAL_PRESCRIPTION_MANAGE, PermissionCode.CLINICAL_LAB_ORDER_MANAGE, PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE,
    PermissionCode.APPOINTMENT_VIEW, PermissionCode.APPOINTMENT_CREATE, PermissionCode.APPOINTMENT_EDIT,
    PermissionCode.BILLING_VIEW,
    PermissionCode.INVENTORY_VIEW,
    PermissionCode.STAFF_REPORTS_VIEW,
    PermissionCode.ROOM_VIEW, PermissionCode.ROOM_SCHEDULE_MANAGE
  ],

  ASSISTANT: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.PATIENT_VIEW,
    PermissionCode.CLINICAL_NOTES_VIEW,
    PermissionCode.CLINICAL_CHART_VIEW,
    PermissionCode.APPOINTMENT_VIEW,
    PermissionCode.INVENTORY_VIEW, PermissionCode.INVENTORY_STOCK_ADJUST
  ],

  RECEPTIONIST: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.PATIENT_VIEW, PermissionCode.PATIENT_CREATE, PermissionCode.PATIENT_EDIT,
    PermissionCode.APPOINTMENT_VIEW, PermissionCode.APPOINTMENT_CREATE, PermissionCode.APPOINTMENT_EDIT, PermissionCode.APPOINTMENT_RECHEDULE,
    PermissionCode.BILLING_VIEW, PermissionCode.BILLING_INVOICE_CREATE, PermissionCode.BILLING_PAYMENT_RECORD,
    PermissionCode.INVENTORY_VIEW
  ],

  ACCOUNTANT: [
    PermissionCode.DASHBOARD_VIEW,
    PermissionCode.BILLING_VIEW, PermissionCode.BILLING_EXPENSE_MANAGE, PermissionCode.BILLING_REPORTS_VIEW,
    PermissionCode.SETTINGS_SUBSCRIPTION_VIEW
  ]
};

/**
 * Low-level data fetcher for permissions, cached persistently.
 */
const getPermissionsFromDB = async (userId: string, role: string | null) => {
  if (!role) return [];
  
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    console.error(`[RBAC] Security Deny: User ${userId} has invalid role "${role}". No permissions granted.`);
    return [];
  }

  console.log(`[RBAC] Cache Miss: Fetching permissions for user ${userId} | Original Role: ${role} | Normalized: ${normalizedRole}`);
  
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  
  if (!permissions) {
    console.warn(`[RBAC] No permission mapping found for role: ${normalizedRole}`);
    return [];
  }

  return permissions;
};

const fetchPermissionsWithCache = unstable_cache(
  async (userId: string, role: string | null) => getPermissionsFromDB(userId, role),
  [], // The key part is handled by the arguments which are appended to the key automatically
  {
    tags: ['all_permissions'],
    revalidate: 3600
  }
);

/**
 * Retrieves and caches the permissions for the current user's session.
 */
export const getUserPermissions = cache(async (): Promise<Set<string>> => {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // --- 1. SUPER_ADMIN BYPASS (Defense-in-Depth) ---
    // Grants full system access if EITHER the JWT role is SUPER_ADMIN
    // OR the email is in the ALLOWED_SUPER_ADMIN_EMAILS env var.
    const role = (authUser?.app_metadata?.role || authUser?.user_metadata?.role || '')?.toString().toUpperCase();
    const isAllowlisted = isAdminAllowlisted(authUser?.email ?? '');
    const isSuperAdmin = role === 'SUPER_ADMIN' || isAllowlisted;

    console.log(`[RBAC] User Resolution: Email: ${authUser?.email} | Metadata Role: ${role} | Allowlisted: ${isAllowlisted} | isSuperAdmin: ${isSuperAdmin}`);

    if (isSuperAdmin) {
      console.log(`[RBAC] Super Admin Access GRANTED for: ${authUser?.email}. (Mode: ${role === 'SUPER_ADMIN' ? 'JWT_ROLE' : 'ALLOWLIST'})`);
      return new Set(ROLE_PERMISSIONS['SUPER_ADMIN']);
    }

    console.log(`[RBAC] standard flow for user ${authUser?.email}. Resolving tenant context...`);

    // --- 2. STANDARD TENANT-SCOPED FLOW ---
    // Uses the centralized resolver — FAIL-CLOSED, unified validation pipeline
    const { user } = await resolveTenantContext();
    const normalizedRole = normalizeRole(user.role);
    
    if (!normalizedRole) {
      console.error(`[RBAC] SECURITY DENIAL: User ${user.email} has NO valid role. Blocking all access.`);
      return new Set();
    }
    
    const permissionArray = await fetchPermissionsWithCache(user.id, user.role);

    if (permissionArray.length === 0) {
      console.warn(`[RBAC] User ${user.email} has ZERO permissions. Role: ${user.role}`);
    }

    return new Set(permissionArray);
  } catch (error) {
    console.error("[RBAC] Critical authorization error:", error);
    return new Set(); // FAIL-CLOSED
  }
});

/**
 * Invalidates the permission cache for a specific user.
 */
export async function invalidateUserPermissions(userId: string) {
  // Fix: revalidateTag expects 2 arguments in this environment (tag, path)
  revalidateTag(`permissions_${userId}`, 'page');
}

/**
 * High-level guard for Server Actions and Route Handlers.
 */
export async function requirePermission(permission: PermissionCode) {
  const permissions = await getUserPermissions();
  if (!permissions.has(permission)) {
    try {
      const { user } = await resolveTenantContext();
      // Track security event (imported dynamically to avoid circular dependencies if any)
      const { EventService } = await import("@/services/event.service");
      await EventService.trackEvent({
        tenantId: user.tenantId,
        userId: user.id,
        eventType: 'SECURITY_DENIED',
        entityType: 'SYSTEM',
        entityId: 'RBAC',
        metadata: { 
          attemptedPermission: permission,
          userEmail: user.email,
          userRole: user.role
        }
      });
    } catch (e) {
      console.error("[RBAC] Failed to track security event:", e);
    }
    
    throw new Error(`Unauthorized: Missing required permission [${permission}]`);
  }
}

/**
 * Checks if the current user has a specific permission without throwing.
 */
export async function hasPermission(permission: PermissionCode): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions.has(permission);
}
