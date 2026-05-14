import { getTenantContext } from "./tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PermissionCode } from "@/types/permissions";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";

/**
 * PRODUCTION-GRADE RBAC MAPPING
 * This mapping defines the default permissions for each system role.
 * In the future, this can be moved to a Database-backed "RolePermissions" table.
 */
export const VALID_ROLES = ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'DOCTOR', 'ASSISTANT', 'RECEPTIONIST', 'ACCOUNTANT'] as const;
export type SystemRole = typeof VALID_ROLES[number];

/**
 * Normalizes legacy role strings to valid system roles.
 * FOLLOWS FAIL-CLOSED MODEL: Returns null if role is unknown or invalid.
 */
export function normalizeRole(role: string | null | undefined): SystemRole | null {
  if (!role) {
    console.error(`[RBAC] Normalization failed: Role is empty/null.`);
    return null;
  }

  const r = role.toUpperCase().trim();

  // Explicit Legacy Mappings
  if (r === 'ADMINISTRATOR' || r === 'CLINIC ADMIN' || r === 'CLINIC_ADMIN') return 'ADMIN';
  if (r === 'SUPER ADMIN' || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'OWNER') return 'OWNER';
  if (r === 'DR' || r === 'DENTIST') return 'DOCTOR';
  
  // Strict System Role Check
  const matchedRole = VALID_ROLES.find(vr => vr === r);
  if (matchedRole) return matchedRole;

  // FAIL-CLOSED: Log and deny
  console.error(`[RBAC] Security Warning: Unknown role detected: "${role}". Access will be denied.`);
  return null;
}

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

    // --- 1. SUPER_ADMIN BYPASS ---
    // If the user has the SUPER_ADMIN role in metadata, grant them full system access
    // without requiring a tenant context or database-level User record.
    const role = (authUser?.app_metadata?.role || authUser?.user_metadata?.role || '')?.toString().toUpperCase();
    if (role === 'SUPER_ADMIN') {
      console.log(`[RBAC] Super Admin detected: ${authUser.email}. Bypassing tenant check.`);
      return new Set(ROLE_PERMISSIONS['SUPER_ADMIN']);
    }

    // --- 2. STANDARD TENANT-SCOPED FLOW ---
    const { user } = await getTenantContext();
    const normalizedRole = normalizeRole(user.role);
    
    console.log(`[RBAC Debug] User: ${user.email} | Original Role: ${user.role} | Normalized: ${normalizedRole}`);
    
    if (!normalizedRole) {
      console.error(`[RBAC] SECURITY DENIAL: User ${user.email} has NO valid role. Blocking all access.`);
      return new Set();
    }
    
    const permissionArray = await fetchPermissionsWithCache(user.id, user.role);
    
    console.log(`[RBAC Debug] User: ${user.email} | Permissions Count: ${permissionArray.length}`);
    if (permissionArray.includes(PermissionCode.FINANCE_VIEW)) {
      console.log(`[RBAC Debug] User HAS FINANCE_VIEW permission.`);
    } else {
      console.log(`[RBAC Debug] User MISSING FINANCE_VIEW permission. Total: ${JSON.stringify(permissionArray)}`);
    }

    if (permissionArray.length === 0) {
      console.error(`[RBAC] User ${user.email} has ZERO permissions. Role: ${user.role} | Normalized: ${normalizedRole}`);
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
      const { user } = await getTenantContext();
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
