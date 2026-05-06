import { BillingRepository } from "@/repositories/billing.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import prisma from "@/lib/prisma";

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
        patientName: `${inv.patient?.firstName} ${inv.patient?.lastName}`,
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
   * Create new invoice
   */
  async createInvoice(data: {
    patientId: string;
    amount: number;
    dueDate: Date;
    description?: string;
  }) {
    const tenantId = await resolveTenantContext();
    return await billingRepository.create({
      ...data,
      tenantId,
      status: 'PENDING'
    });
  }

  /**
   * Mark an invoice as paid
   */
  async markAsPaid(id: string) {
    const tenantId = await resolveTenantContext();
    return await billingRepository.update(id, tenantId, {
      status: 'PAID',
      paidAt: new Date()
    });
  }

  /**
   * Create an invoice directly from an appointment
   */
  async createInvoiceFromAppointment(appointmentId: string, amount: number) {
    const tenantId = await resolveTenantContext();
    
    // 1. Verify appointment exists and belongs to tenant
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId, tenantId },
      include: { patient: true }
    });

    if (!appointment) throw new Error("Appointment not found");

    // 2. Check if invoice already exists
    const existing = await billingRepository.findUniqueByAppointmentId(appointmentId, tenantId);
    if (existing) throw new Error("Invoice already exists for this appointment");

    // 3. Create invoice
    return await billingRepository.create({
      tenantId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      amount: amount,
      status: 'PENDING',
      treatment: appointment.treatment || 'Dental Service',
      date: new Date()
    });
  }
}
