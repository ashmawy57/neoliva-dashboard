'use server'

import { prisma } from "@/lib/prisma";
import { resolveTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";
import { PatientService } from "@/services/patient.service";
import { InvoiceService } from "@/services/invoice.service";

const patientService = new PatientService();
const invoiceService = new InvoiceService();

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
  const tenantId = await resolveTenantContext();
  try {
    const result = await invoiceService.createInvoice(tenantId, patientId, data);
    
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
 * Enforces transaction, validation, and tenant isolation.
 */
export async function recordPayment(invoiceId: string, amount: number, method: string, notes?: string, date?: Date) {
  const tenantId = await resolveTenantContext();

  try {
    // 1. Fetch invoice first to get patientId for revalidation
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { patientId: true }
    });

    if (!invoice) throw new Error("Invoice not found or unauthorized access.");

    // 2. Delegate to service layer (which uses transaction in repository)
    const result = await patientService.addPayment(tenantId, invoiceId, {
      amount,
      method,
      notes,
      date: date || new Date()
    });

    // 3. Revalidate UI cache
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
  const tenantId = await resolveTenantContext();
  try {
    await patientService.deleteInvoice(tenantId, invoiceId);
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
  const tenantId = await resolveTenantContext();
  try {
    const data = await invoiceService.getInvoices(tenantId);
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("[getInvoices] Action failed:", error);
    return [];
  }
}

/**
 * Server Action: Updates an existing invoice.
 */
export async function updateInvoice(invoiceId: string, updates: any) {
  const tenantId = await resolveTenantContext();
  try {
    const result = await invoiceService.updateInvoice(tenantId, invoiceId, updates);
    
    revalidatePath(`/patients/${(result as any).patientId}`);
    revalidatePath('/billing');
    
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("[updateInvoice] Action failed:", error);
    return { success: false, error: error.message || "Failed to update invoice." };
  }
}
