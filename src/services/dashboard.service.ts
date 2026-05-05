import { InventoryRepository } from "@/repositories/inventory.repository";
import { InvoiceRepository } from "@/repositories/invoice.repository";
import { AppointmentRepository } from "@/repositories/appointment.repository";

export class DashboardService {
  private inventoryRepo = new InventoryRepository();
  private invoiceRepo = new InvoiceRepository();
  private appointmentRepo = new AppointmentRepository();

  async getDashboardData(tenantId: string) {
    // 1. Low inventory
    const inventoryData = await this.inventoryRepo.findAll(tenantId, {
      // select only needed fields if possible, but our repository uses generic findMany
    });
    const lowInventoryCount = inventoryData.filter(item => item.quantity <= item.minLevel).length;

    // 2. Pending payments
    const invoiceData = await this.invoiceRepo.findAll(tenantId);
    const pendingPayments = invoiceData
      .filter(inv => inv.status !== "PAID")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const overdueCount = invoiceData.filter(inv => inv.status === "OVERDUE").length;

    // 3. Appointments for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentsData = await this.appointmentRepo.findAll(tenantId, {
      where: { date: today },
      include: { patient: { select: { name: true } } }
    });

    const todaysAppointmentsCount = appointmentsData.length;
    const completedAppointmentsCount = appointmentsData.filter(a => a.status === "COMPLETED").length;
    const pendingAppointmentsCount = appointmentsData.filter(a => 
      ["WAITING", "SCHEDULED", "IN_PROGRESS"].includes(a.status || "")
    ).length;

    // 4. Recent patients for queue
    const recentPatients = appointmentsData.map(a => {
      const name = (a as any).patient?.name || "Unknown Patient";
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const initials = parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
        : parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : "??";
        
      return {
        id: a.patientId,
        name,
        time: a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
        treatment: a.treatment || "Checkup",
        status: a.status,
        avatar: initials,
        color: a.status === "IN_PROGRESS" ? "from-blue-500 to-indigo-600" : "from-blue-500 to-cyan-500",
      };
    });

    return {
      lowInventoryCount,
      pendingPayments,
      overdueCount,
      todaysAppointmentsCount,
      completedAppointmentsCount,
      pendingAppointmentsCount,
      recentPatients,
    };
  }
}
