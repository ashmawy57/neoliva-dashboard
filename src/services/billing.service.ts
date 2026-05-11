import { BillingRepository } from "@/repositories/billing.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, Prisma } from "@prisma/client";

const billingRepository = new BillingRepository();

export class BillingService {
  /**
   * Get formatted invoices for the list view
   */
  async getInvoicesList() {
    const tenantId = await resolveTenantContext();
    const invoices = await billingRepository.findMany(tenantId);

    const now = new Date();

    return invoices.map(inv => {
      // Logic to determine if PENDING is actually OVERDUE
      let currentStatus = inv.status;
      if (currentStatus === 'PENDING' && inv.dueDate && new Date(inv.dueDate) < now) {
        currentStatus = 'OVERDUE';
      }

      return {
        id: inv.id,
        patientName: inv.patient?.name || "Unknown Patient",
        amount: Number(inv.amount),
        status: currentStatus,
        date: inv.createdAt,
        dueDate: inv.dueDate,
        invoiceNumber: (inv as any).invoiceNumber || `INV-${inv.id.slice(0, 8).toUpperCase()}`
      };
    });
  }

  /**
   * Get overall billing stats
   */
  async getBillingStats() {
    const tenantId = await resolveTenantContext();
    return await billingRepository.getFinancialStats(tenantId);
  }

  /**
   * Get specific invoice details
   */
  async getInvoiceDetails(id: string) {
    const tenantId = await resolveTenantContext();
    return await billingRepository.findUnique(id, tenantId);
  }

  /**
   * Create new invoice with optional items
   */
  async createInvoice(patientId: string, data: {
    amount: number;
    dueDate?: Date;
    description?: string;
    status?: string;
    items?: any[];
  }) {
    const tenantId = await resolveTenantContext();
    const { items, ...rest } = data;

    const result = await billingRepository.create(tenantId, {
      ...rest,
      displayId: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: data.amount,
      status: (data.status as any) || 'PENDING',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      patient: { connect: { id: patientId } },
      items: items ? {
        create: items.map((item: any) => ({
          name: item.name,
          amount: item.amount,
          tenant: { connect: { id: tenantId } }
        }))
      } : undefined
    });

    return this.serializeInvoice(result);
  }

  /**
   * Records a payment
   */
  async recordPayment(invoiceId: string, data: {
    amount: number;
    method: string;
    notes?: string;
    date?: Date;
  }) {
    const tenantId = await resolveTenantContext();
    const result = await billingRepository.recordPayment(tenantId, invoiceId, data);
    return this.serializeInvoice(result);
  }

  /**
   * Updates an existing invoice
   */
  async updateInvoice(invoiceId: string, updates: any) {
    const tenantId = await resolveTenantContext();
    const { patientId, ...rest } = updates;

    const result = await billingRepository.update(tenantId, invoiceId, {
      ...rest,
      ...(updates.dueDate ? { dueDate: new Date(updates.dueDate) } : {}),
      ...(patientId ? { patient: { connect: { id: patientId } } } : {}),
      updatedAt: new Date()
    });

    return this.serializeInvoice(result);
  }

  /**
   * Deletes an invoice
   */
  async deleteInvoice(invoiceId: string) {
    const tenantId = await resolveTenantContext();
    return await billingRepository.delete(tenantId, invoiceId);
  }

  /**
   * Mark an invoice as paid (convenience method)
   */
  async markAsPaid(id: string) {
    const tenantId = await resolveTenantContext();
    const result = await billingRepository.update(tenantId, id, {
      status: 'PAID'
    });
    return this.serializeInvoice(result);
  }

  /**
   * Create an invoice directly from an appointment
   */
  async createInvoiceFromAppointment(appointmentId: string) {
    const tenantId = await resolveTenantContext();
    
    // 1. Verify appointment exists and belongs to tenant
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId, tenantId },
      include: { 
        patient: true,
        service: true 
      }
    });

    if (!appointment) throw new Error("Appointment not found");

    // 2. Check if invoice already exists
    const existing = await prisma.invoice.findFirst({
      where: { appointmentId, tenantId }
    });
    if (existing) throw new Error("Invoice already exists for this appointment");

    // 3. Determine amount (Priority: Service Price -> Default)
    let amount = 0;
    if (appointment.service) {
      amount = Number(appointment.service.price);
    } else {
      // Fallback if no service is linked (should ideally not happen with the new flow)
      amount = 0; 
    }

    // 4. Create invoice
    const result = await billingRepository.create(tenantId, {
      patient: { connect: { id: appointment.patientId } },
      appointment: { connect: { id: appointment.id } },
      displayId: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: amount,
      status: 'PENDING',
      treatment: appointment.service?.name || appointment.treatment || 'Dental Service',
      date: new Date()
    });

    return this.serializeInvoice(result);
  }

  private serializeInvoice(inv: any) {
    if (!inv) return null;
    return {
      ...inv,
      amount: inv.amount ? Number(inv.amount) : 0
    };
  }
}
