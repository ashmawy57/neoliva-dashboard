'use server'

import { prisma } from "@/lib/prisma";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";
import { BillingService } from "@/services/billing.service";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { PaymentMethod } from "@/generated/client";
import { requireRecordAccess, canAccessPatient } from "@/lib/abac";
import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";
const billingService = new BillingService();

/**
 * Server Action: Generates an invoice from an appointment.
 */
export const generateInvoiceFromAppointment = wrapAction(
  'INVOICE_GENERATE',
  async (appointmentId: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_INVOICE_CREATE);
    await requireRecordAccess('appointment', appointmentId);
    const result = await billingService.generateInvoiceFromAppointment(tenantId, appointmentId);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'INVOICE_CREATED',
      entityType: 'INVOICE',
      entityId: result.id,
      metadata: { appointmentId, patientId: result.patientId, amount: result.totalAmount }
    });

    if (result && result.patientId) {
      revalidatePath(`/patients/${result.patientId}`);
      revalidatePath('/dashboard');
      revalidatePath('/billing');
      revalidatePath('/billing/invoices');
      revalidatePath('/appointments');
    }
    
    return result;
  },
  { module: 'billing', entityType: 'INVOICE' }
);

/**
 * Server Action: Creates a new invoice with line items.
 */
export const createInvoice = wrapAction(
  'INVOICE_CREATE',
  async (data: { 
    patientId: string;
    appointmentId?: string;
    dueDate?: Date;
    items: {
      description: string;
      quantity: number;
      price: number;
      serviceId?: string;
    }[];
  }) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_INVOICE_CREATE);
    
    if (!(await canAccessPatient(data.patientId))) {
      throw new Error("ABAC Denial: You do not have access to this patient.");
    }
    
    const result = await billingService.createInvoice(tenantId, data);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'INVOICE_CREATED',
      entityType: 'INVOICE',
      entityId: result.id,
      metadata: { patientId: data.patientId, amount: result.totalAmount }
    });

    revalidatePath(`/patients/${data.patientId}`);
    revalidatePath('/billing');
    revalidatePath('/billing/invoices');
    
    return result;
  },
  { module: 'billing', entityType: 'INVOICE' }
);

/**
 * Server Action: Records a payment for an invoice.
 */
export const recordPayment = wrapAction(
  'PAYMENT_RECORD',
  async (invoiceId: string, data: {
    amount: number;
    method: PaymentMethod;
    notes?: string;
    paidAt?: Date;
  }) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_PAYMENT_RECORD);
    await requireRecordAccess('invoice', invoiceId);
    
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { patientId: true }
    });

    if (!invoice) throw new Error("Invoice not found or unauthorized access.");

    const result = await billingService.recordPayment(tenantId, invoiceId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVOICE_PAID',
      entityType: 'INVOICE',
      entityId: invoiceId,
      metadata: { amount: data.amount, method: data.method }
    });

    revalidatePath(`/patients/${invoice.patientId}`);
    revalidatePath(`/billing`);
    revalidatePath(`/billing/invoices`);

    return result;
  },
  { module: 'billing', entityType: 'PAYMENT' }
);

/**
 * Server Action: Deletes an invoice.
 */
export const deleteInvoice = wrapAction(
  'INVOICE_DELETE',
  async (patientId: string, invoiceId: string) => {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_INVOICE_CREATE);
    await requireRecordAccess('invoice', invoiceId);
    await billingService.deleteInvoice(tenantId, invoiceId);

    await EventService.trackEvent({
      tenantId,
      eventType: 'INVOICE_DELETED',
      entityType: 'INVOICE',
      entityId: invoiceId,
      metadata: { patientId }
    });
    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/billing`);
    revalidatePath(`/billing/invoices`);
    return { success: true };
  },
  { module: 'billing', entityType: 'INVOICE' }
);


/**
 * Server Action: Fetches all invoices.
 */
export async function getInvoices() {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_VIEW);
    return await billingService.getInvoicesList(tenantId);
  } catch (error) {
    console.error("[getInvoices] Action failed:", error);
    return [];
  }
}

/**
 * Server Action: Fetches billing stats.
 */
export async function getBillingStats() {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_VIEW);
    return await billingService.getBillingStats(tenantId);
  } catch (error) {
    console.error("[getBillingStats] Action failed:", error);
    return {
      totalRevenue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      collectionRate: 0
    };
  }
}

/**
 * Server Action: Fetches a single invoice by ID.
 */
export async function getInvoice(id: string) {
  if (!id) {
    console.error("[getInvoice] Error: No ID provided to action");
    return null;
  }
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.BILLING_VIEW);
    await requireRecordAccess('invoice', id);
    return await billingService.getInvoiceDetails(tenantId, id);
  } catch (error) {
    console.error(`[getInvoice] Action failed for ID ${id}:`, error);
    return null;
  }
}
