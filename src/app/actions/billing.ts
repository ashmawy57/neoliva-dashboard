'use server'

import { revalidatePath } from 'next/cache';
import { BillingService } from "@/services/billing.service";

const billingService = new BillingService();

export async function getInvoices() {
  try {
    return await billingService.getInvoicesList();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function getBillingStats() {
  try {
    return await billingService.getBillingStats();
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    return { totalRevenue: 0, pendingAmount: 0, overdueAmount: 0 };
  }
}

export async function createInvoice(data: any) {
  try {
    await billingService.createInvoice(data);
    revalidatePath('/billing');
    return { success: true };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

export async function markInvoiceAsPaid(id: string) {
  try {
    await billingService.markAsPaid(id);
    revalidatePath('/billing');
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw new Error('Failed to update invoice');
  }
}

export async function generateInvoiceFromAppointment(appointmentId: string, amount: number) {
  try {
    await billingService.createInvoiceFromAppointment(appointmentId, amount);
    revalidatePath('/billing');
    revalidatePath('/appointments');
    return { success: true };
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return { success: false, error: error.message || 'Failed to generate invoice' };
  }
}
