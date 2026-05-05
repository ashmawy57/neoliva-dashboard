'use server'

import { revalidatePath } from 'next/cache'
import { InvoiceService } from "@/services/invoice.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const invoiceService = new InvoiceService();

export async function getInvoices() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await invoiceService.getInvoices(tenantId);

    const getInitials = (name: string) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P'
    }

    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500',
      'from-emerald-500 to-teal-500'
    ];

    return data.map((invoice, index) => {
      const patientName = (invoice as any).patient?.name || 'Unknown Patient';
      const colorIndex = index % colors.length;

      return {
        id: invoice.id,
        displayId: invoice.displayId,
        patient: patientName,
        patientId: invoice.patientId,
        date: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '—',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—',
        status: invoice.status,
        amount: Number(invoice.amount) || 0,
        method: invoice.method || '—',
        treatment: invoice.treatment || '—',
        avatar: getInitials(patientName),
        color: colors[colorIndex]
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function createInvoice(formData: { 
  patientId: string; 
  amount: number; 
  status?: any; 
  dueDate?: string; 
  method?: string;
  treatment?: string;
}) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await invoiceService.createInvoice(tenantId, formData);

    revalidatePath('/billing');
    return data;
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

export async function updateInvoice(id: string, updates: any) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await invoiceService.updateInvoice(tenantId, id, updates);

    revalidatePath('/billing');
    return data;
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    throw new Error('Failed to update invoice');
  }
}

export async function deleteInvoice(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await invoiceService.deleteInvoice(tenantId, id);

    revalidatePath('/billing');
    return true;
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
}

