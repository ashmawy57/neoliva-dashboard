/**
 * Centralized Permission Codes for RBAC
 * Grouped by Domain for Scalability
 */
export enum PermissionCode {
  // --- DASHBOARD ---
  DASHBOARD_VIEW = 'dashboard:view',

  // --- PATIENTS ---
  PATIENT_VIEW = 'patients:view',
  PATIENT_CREATE = 'patients:create',
  PATIENT_EDIT = 'patients:edit',
  PATIENT_DELETE = 'patients:delete',
  PATIENT_EXPORT = 'patients:export',
  PATIENT_DOCUMENT_MANAGE = 'patients:document_manage',

  // --- CLINICAL ---
  CLINICAL_NOTES_VIEW = 'clinical:notes_view',
  CLINICAL_NOTES_EDIT = 'clinical:notes_edit',
  CLINICAL_CHART_VIEW = 'clinical:chart_view',
  CLINICAL_CHART_EDIT = 'clinical:chart_edit',
  CLINICAL_PRESCRIPTION_MANAGE = 'clinical:prescription_manage',
  CLINICAL_LAB_ORDER_MANAGE = 'clinical:lab_order_manage',
  CLINICAL_TREATMENT_PLAN_MANAGE = 'clinical:treatment_plan_manage',

  // --- APPOINTMENTS ---
  APPOINTMENT_VIEW = 'appointments:view',
  APPOINTMENT_CREATE = 'appointments:create',
  APPOINTMENT_EDIT = 'appointments:edit',
  APPOINTMENT_DELETE = 'appointments:delete',
  APPOINTMENT_RECHEDULE = 'appointments:reschedule',

  // --- BILLING ---
  BILLING_VIEW = 'billing:view',
  BILLING_INVOICE_CREATE = 'billing:invoice_create',
  BILLING_INVOICE_EDIT = 'billing:invoice_edit',
  BILLING_PAYMENT_RECORD = 'billing:payment_record',
  BILLING_EXPENSE_MANAGE = 'billing:expense_manage',
  BILLING_REPORTS_VIEW = 'billing:reports_view',

  // --- INVENTORY ---
  INVENTORY_VIEW = 'inventory:view',
  INVENTORY_MANAGE = 'inventory:manage',
  INVENTORY_STOCK_ADJUST = 'inventory:stock_adjust',

  // --- STAFF ---
  STAFF_VIEW = 'staff:view',
  STAFF_MANAGE = 'staff:manage',
  STAFF_INVITE = 'staff:invite',
  STAFF_REPORTS_VIEW = 'staff:reports_view',

  // --- SETTINGS ---
  SETTINGS_CLINIC_EDIT = 'settings:clinic_edit',
  SETTINGS_SERVICES_MANAGE = 'settings:services_manage',
  SETTINGS_SECURITY_EDIT = 'settings:security_edit',
  SETTINGS_SUBSCRIPTION_VIEW = 'settings:subscription_view',

  // --- SYSTEM ADMIN (Global) ---
  ADMIN_SYSTEM_VIEW = 'admin:system_view',
  ADMIN_TENANT_MANAGE = 'admin:tenant_manage',
  ADMIN_FULL_ACCESS = 'admin:full_access',
  AUDIT_VIEW = 'audit:view',

  // --- FINANCE ---
  FINANCE_VIEW = 'finance:view',
}

export type Permission = keyof typeof PermissionCode;
