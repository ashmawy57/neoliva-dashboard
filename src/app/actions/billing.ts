'use server'

import { prisma } from "@/lib/prisma";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";
import { BillingService } from "@/services/billing.service";

const billingService = new BillingService();

/**
 * Server Action: Creates a new invoice for a patient.
 */
export async function createInvoice(patientId: string, data: { 
  amount: number; 
  status?: any; 
  dueDate?: any; 
  method?: string;
  treatment?: string;
  items?: any[];
}) {
  try {
    const result = await billingService.createInvoice(patientId, data);
    
    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/billing');
    
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[createInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to create invoice." };
  }
}

/**
 * Server Action: Records a payment for an invoice.
 */
export async function recordPayment(invoiceId: string, amount: number, method: string, notes?: string, date?: Date) {
  try {
    const tenantId = await resolveTenantContext();
    
    // Fetch patientId for revalidation before recording payment
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { patientId: true }
    });

    if (!invoice) throw new Error("Invoice not found or unauthorized access.");

    const result = await billingService.recordPayment(invoiceId, {
      amount,
      method,
      notes,
      date: date || new Date()
    });

    revalidatePath(`/patients/${invoice.patientId}`);
    revalidatePath(`/billing`);

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(result)) 
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
 * Server Action: Deletes an invoice and revalidates paths.
 */
export async function deleteInvoice(patientId: string, invoiceId: string) {
  try {
    await billingService.deleteInvoice(invoiceId);
    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/billing`);
    return { success: true };
  } catch (error: any) {
    console.error("[deleteInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to delete invoice." };
  }
}

/**
 * Server Action: Fetches all invoices for the current tenant.
 */
export async function getInvoices() {
  try {
    const data = await billingService.getInvoicesList();
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("[getInvoices] Action failed:", error);
    return [];
  }
}

/**
 * Server Action: Fetches billing statistics for the dashboard.
 */
export async function getBillingStats() {
  try {
    const stats = await billingService.getBillingStats();
    return JSON.parse(JSON.stringify(stats));
  } catch (error) {
    console.error("[getBillingStats] Action failed:", error);
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };
  }
}

/**
 * Server Action: Generates an invoice from an appointment.
 */
export async function generateInvoiceFromAppointment(appointmentId: string) {
  try {
    const result = await billingService.createInvoiceFromAppointment(appointmentId);
    revalidatePath('/billing');
    revalidatePath('/appointments');
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[generateInvoiceFromAppointment] Action failed:", error);
    return { success: false, error: error.message || "Failed to generate invoice." };
  }
}

/**
 * Server Action: Updates an existing invoice.
 */
export async function updateInvoice(invoiceId: string, updates: any) {
  try {
    const result = await billingService.updateInvoice(invoiceId, updates);
    
    revalidatePath(`/patients/${(result as any).patientId}`);
    revalidatePath('/billing');
    
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[updateInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to update invoice." };
  }
}
