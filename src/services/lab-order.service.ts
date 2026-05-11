import { LabOrderRepository } from "@/repositories/lab-order.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { LabOrderStatus } from "@/generated/client";

const repository = new LabOrderRepository();

export class LabOrderService {
  /**
   * Helper to ensure LabOrder objects are serializable for Client Components
   */
  private serializeLabOrder(order: any) {
    if (!order) return null;
    return {
      ...order,
      cost: order.cost ? Number(order.cost) : 0,
      // Ensure dates are serializable strings
      sentAt: order.sentAt instanceof Date ? order.sentAt.toISOString() : order.sentAt,
      dueDate: order.dueDate instanceof Date ? order.dueDate.toISOString() : order.dueDate,
      receivedAt: order.receivedAt instanceof Date ? order.receivedAt.toISOString() : order.receivedAt,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      // Add common UI fields
      patientName: order.patient?.name || "Unknown",
      patientDisplayId: order.patient?.displayId || "",
    };
  }

  /**
   * Fetches and formats the list of lab orders for the UI
   */
  async getLabOrdersList() {
    const tenantId = await resolveTenantContext();
    const orders = await repository.findMany(tenantId, {
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(order => this.serializeLabOrder(order));
  }

  /**
   * Calculates statistics for the lab orders dashboard
   */
  async getLabOrdersStats() {
    const tenantId = await resolveTenantContext();
    return await repository.getStats(tenantId);
  }

  /**
   * Creates a new lab order
   */
  async createLabOrder(data: {
    patientId: string;
    appointmentId?: string;
    labName: string;
    itemType: string;
    toothNumber?: string;
    cost?: number;
    dueDate?: string;
    notes?: string;
  }) {
    const tenantId = await resolveTenantContext();
    
    // Validation
    if (!data.patientId || !data.labName || !data.itemType) {
      throw new Error("Missing required fields: patientId, labName, or itemType");
    }

    const createData: any = {
      displayId: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      labName: data.labName,
      itemType: data.itemType,
      toothNumber: data.toothNumber || null,
      cost: data.cost ? Number(data.cost) : 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      status: 'PENDING',
      patient: { connect: { id: data.patientId } },
    };

    if (data.appointmentId) {
      createData.appointment = { connect: { id: data.appointmentId } };
    }

    const newOrder = await repository.create(tenantId, createData);
    return this.serializeLabOrder(newOrder);
  }

  /**
   * Updates the status of a lab order and manages lifecycle dates
   */
  async updateLabOrderStatus(id: string, status: LabOrderStatus) {
    const tenantId = await resolveTenantContext();
    const updated = await repository.updateStatus(tenantId, id, status);
    return this.serializeLabOrder(updated);
  }

  /**
   * Simple delete for management
   */
  async deleteLabOrder(id: string) {
    const tenantId = await resolveTenantContext();
    const deleted = await repository.delete(tenantId, id);
    return this.serializeLabOrder(deleted);
  }
}
