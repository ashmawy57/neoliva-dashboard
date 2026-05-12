'use server'

import { prisma } from "@/lib/prisma";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";
import { BillingService } from "@/services/billing.service";
import { PaymentMethod } from "@/generated/client";

const billingService = new BillingService();

/**
 * Server Action: Generates an invoice from an appointment.
 */
export async function generateInvoiceFromAppointment(appointmentId: string) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await billingService.generateInvoiceFromAppointment(tenantId, appointmentId);
    
    if (result && result.patientId) {
      revalidatePath(`/patients/${result.patientId}`);
      revalidatePath('/dashboard');
      revalidatePath('/billing');
      revalidatePath('/billing/invoices');
      revalidatePath('/appointments');
    }
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[generateInvoiceFromAppointment] Action failed:", error);
    return { success: false, error: error.message || "Failed to generate invoice." };
  }
}

/**
 * Server Action: Creates a new invoice with line items.
 */
export async function createInvoice(data: { 
  patientId: string;
  appointmentId?: string;
  dueDate?: Date;
  items: {
    description: string;
    quantity: number;
    price: number;
    serviceId?: string;
  }[];
}) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await billingService.createInvoice(tenantId, data);
    
    revalidatePath(`/patients/${data.patientId}`);
    revalidatePath('/billing');
    revalidatePath('/billing/invoices');
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to create invoice." };
  }
}

/**
 * Server Action: Records a payment for an invoice.
 */
export async function recordPayment(invoiceId: string, data: {
  amount: number;
  method: PaymentMethod;
  notes?: string;
  paidAt?: Date;
}) {
  try {
    const tenantId = await resolveTenantContext();
    
    // Fetch patientId for revalidation
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { patientId: true }
    });

    if (!invoice) throw new Error("Invoice not found or unauthorized access.");

    const result = await billingService.recordPayment(tenantId, invoiceId, data);

    revalidatePath(`/patients/${invoice.patientId}`);
    revalidatePath(`/billing`);
    revalidatePath(`/billing/invoices`);

    return { 
      success: true, 
      data: result 
    };
  } catch (error: any) {
    console.error("[recordPayment] Action failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to record payment." 
    };
  }
}

/**
 * Server Action: Deletes an invoice.
 */
export async function deleteInvoice(patientId: string, invoiceId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await billingService.deleteInvoice(tenantId, invoiceId);
    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/billing`);
    revalidatePath(`/billing/invoices`);
    return { success: true };
  } catch (error: any) {
    console.error("[deleteInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to delete invoice." };
  }
}

/**
 * Server Action: Fetches all invoices.
 */
export async function getInvoices() {
  try {
    const tenantId = await resolveTenantContext();
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
    const tenantId = await resolveTenantContext();
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
    const tenantId = await resolveTenantContext();
    return await billingService.getInvoiceDetails(tenantId, id);
  } catch (error) {
    console.error(`[getInvoice] Action failed for ID ${id}:`, error);
    return null;
  }
}
