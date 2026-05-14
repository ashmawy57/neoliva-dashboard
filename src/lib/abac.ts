import { getTenantContext } from "./tenant-context";
import { prisma } from "./prisma";
import { PermissionCode } from "@/types/permissions";
import { hasPermission } from "./rbac";

/**
 * ABAC (Attribute-Based Access Control) Layer
 * 
 * This layer handles record-level authorization based on attributes 
 * like 'Assigned Doctor', 'Ownership', or 'Status'.
 * 
 * It sits between the RBAC Guard (permissions) and the Database Query.
 */

/**
 * PATIENTS
 * Doctors: Only assigned patients (via appointments).
 * Staff/Assistants: All patients in clinic (standard medical workflow).
 */
export async function canAccessPatient(patientId: string): Promise<boolean> {
  const { user } = await getTenantContext();

  // 1. Clinic-Wide Access (Admin/Owner)
  if (await hasPermission(PermissionCode.ADMIN_FULL_ACCESS)) {
    return true;
  }

  // 2. DOCTOR Assignment Rule: Only patients they have an appointment with
  if (user.role === 'DOCTOR' && user.staffId) {
    const assignmentCount = await prisma.appointment.count({
      where: {
        patientId,
        doctorId: user.staffId,
        tenantId: user.tenantId
      }
    });
    return assignmentCount > 0;
  }

  // 3. STAFF/RECEPTIONIST/ASSISTANT: Can see all patients in their clinic
  // (Assuming basic RBAC has already passed PATIENT_VIEW)
  return true;
}

/**
 * INVOICES
 * Doctors: Only invoices for their assigned patients.
 * Accountants/Receptionists: All invoices.
 */
export async function canAccessInvoice(invoiceId: string): Promise<boolean> {
  const { user } = await getTenantContext();

  if (await hasPermission(PermissionCode.ADMIN_FULL_ACCESS)) return true;

  // Billing roles see everything in clinic
  if (user.role === 'ACCOUNTANT' || user.role === 'RECEPTIONIST') {
    return true;
  }

  // Doctors restricted to assigned patients' invoices
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId: user.tenantId },
    select: { patientId: true }
  });

  if (!invoice) return false;
  return await canAccessPatient(invoice.patientId);
}

export async function canEditInvoice(invoiceId: string): Promise<boolean> {
  // 1. RBAC check (Invoice Edit permission)
  if (!(await hasPermission(PermissionCode.BILLING_INVOICE_EDIT))) return false;
  
  // 2. ABAC check (Record Access)
  return await canAccessInvoice(invoiceId);
}

/**
 * APPOINTMENTS
 * Doctors: Only their own appointments.
 * Others: All appointments (for scheduling).
 */
export async function canAccessAppointment(appointmentId: string): Promise<boolean> {
  const { user } = await getTenantContext();

  if (await hasPermission(PermissionCode.ADMIN_FULL_ACCESS)) return true;

  if (user.role === 'DOCTOR' && user.staffId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: user.staffId,
        tenantId: user.tenantId
      }
    });
    return !!appointment;
  }

  return true;
}

/**
 * TREATMENT PLANS
 * Doctors: Only for assigned patients.
 */
export async function canAccessTreatmentPlan(planId: string): Promise<boolean> {
  const { user } = await getTenantContext();

  if (await hasPermission(PermissionCode.ADMIN_FULL_ACCESS)) return true;

  const plan = await prisma.treatmentPlan.findFirst({
    where: { id: planId, tenantId: user.tenantId },
    select: { patientId: true }
  });

  if (!plan) return false;
  return await canAccessPatient(plan.patientId);
}

export async function canModifyTreatmentPlan(planId: string): Promise<boolean> {
  // 1. RBAC check
  if (!(await hasPermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE))) return false;
  
  // 2. ABAC check
  return await canAccessTreatmentPlan(planId);
}

/**
 * ENFORCEMENT GUARD
 * Ensures the user has record-level access.
 * Throws if access is denied.
 */
export async function requireRecordAccess(
  type: 'patient' | 'invoice' | 'appointment' | 'treatment-plan', 
  id: string
) {
  let hasAccess = false;

  switch (type) {
    case 'patient':
      hasAccess = await canAccessPatient(id);
      break;
    case 'invoice':
      hasAccess = await canAccessInvoice(id);
      break;
    case 'appointment':
      hasAccess = await canAccessAppointment(id);
      break;
    case 'treatment-plan':
      hasAccess = await canAccessTreatmentPlan(id);
      break;
  }

  if (!hasAccess) {
    throw new Error(`Unauthorized: Record-level access denied (ABAC) for ${type} [${id}]`);
  }
}
