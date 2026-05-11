import { BillingRepository } from "@/repositories/billing.repository";
import { AppointmentRepository } from "@/repositories/appointment.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { PaymentMethod } from "@/generated/client";

const billingRepository = new BillingRepository();
const appointmentRepository = new AppointmentRepository();

export class BillingService {
  /**
   * Generates an invoice from an appointment's data
   */
  async generateInvoiceFromAppointment(appointmentId: string) {
    const tenantId = await resolveTenantContext();

    // Check if invoice already exists for this appointment
    const existing = await billingRepository.findByAppointmentId(appointmentId, tenantId);
    if (existing) {
      return this.serializeInvoice(existing);
    }

    // Get appointment details
    const apt = await appointmentRepository.findUnique(appointmentId, tenantId);
    if (!apt) throw new Error("Appointment not found");

    // Prepare items
    const items = [];
    if (apt.service) {
      items.push({
        description: apt.service.name,
        quantity: 1,
        price: Number(apt.service.price),
        serviceId: apt.serviceId || undefined
      });
    } else if (apt.treatment) {
      items.push({
        description: apt.treatment,
        quantity: 1,
        price: 0 // Default price if no service is linked
      });
    } else {
      items.push({
        description: "Dental Treatment",
        quantity: 1,
        price: 0
      });
    }

    // Create the invoice
    return await this.createInvoice({
      patientId: apt.patientId,
      appointmentId: apt.id,
      items
    });
  }

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
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        status: currentStatus,
        createdAt: inv.createdAt,
        dueDate: inv.dueDate,
        displayId: inv.displayId || `INV-${inv.id.slice(0, 8).toUpperCase()}`
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
    const invoice = await billingRepository.findUnique(id, tenantId);
    return this.serializeInvoice(invoice);
  }

  /**
   * Create new invoice with items
   */
  async createInvoice(data: {
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
    const tenantId = await resolveTenantContext();
    
    // Generate a simple display ID
    const displayId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await billingRepository.create(tenantId, {
      ...data,
      displayId
    });

    return this.serializeInvoice(result);
  }

  /**
   * Records a payment
   */
  async recordPayment(invoiceId: string, data: {
    amount: number;
    method: PaymentMethod;
    notes?: string;
    paidAt?: Date;
  }) {
    const tenantId = await resolveTenantContext();
    const result = await billingRepository.recordPayment(tenantId, invoiceId, data);
    return result; // Payment record is simple
  }

  /**
   * Deletes an invoice
   */
  async deleteInvoice(invoiceId: string) {
    const tenantId = await resolveTenantContext();
    return await billingRepository.delete(tenantId, invoiceId);
  }

  private serializeInvoice(inv: any) {
    if (!inv) return null;
    return {
      ...inv,
      totalAmount: inv.totalAmount ? Number(inv.totalAmount) : 0,
      paidAmount: inv.paidAmount ? Number(inv.paidAmount) : 0,
      items: inv.items?.map((item: any) => ({
        ...item,
        price: Number(item.price)
      })),
      payments: inv.payments?.map((p: any) => ({
        ...p,
        amount: Number(p.amount)
      }))
    };
  }
}
