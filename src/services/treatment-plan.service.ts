import { TreatmentPlanRepository } from "@/repositories/treatment-plan.repository";
import { TreatmentPlan, TreatmentPlanItem, Prisma } from "@prisma/client";

export class TreatmentPlanService {
  private repository = new TreatmentPlanRepository();

  async getTreatmentPlans(tenantId: string, patientId: string) {
    return this.repository.findAll(tenantId, {
      where: { patientId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTreatmentPlan(tenantId: string, patientId: string, data: any) {
    return this.repository.create(tenantId, {
      patient: { connect: { id: patientId } },
      title: data.title,
      status: data.status || 'ACTIVE',
      notes: data.notes || '',
      items: {
        create: (data.phases || []).map((ph: any, i: number) => ({
          tenant: { connect: { id: tenantId } },
          serviceName: ph.name,
          step: i + 1,
          status: ph.status || 'PLANNED',
          price: parseFloat(ph.price?.toString().replace(/[^0-9.]/g, "")) || 0,
          scheduledDate: ph.date && ph.date !== 'TBD' ? new Date(ph.date) : null,
          notes: ph.notes || ''
        }))
      }
    });
  }

  async updatePlanStatus(tenantId: string, planId: string, status: string) {
    return this.repository.update(tenantId, planId, {
      status: status as any,
      updatedAt: new Date()
    });
  }

  async deleteTreatmentPlan(tenantId: string, planId: string) {
    return this.repository.delete(tenantId, planId);
  }

  async addTreatmentPhase(tenantId: string, planId: string, phaseData: any, step: number) {
    return this.repository.createItem(tenantId, {
      plan: { connect: { id: planId } },
      serviceName: phaseData.name,
      step: step,
      status: phaseData.status || 'PLANNED',
      price: parseFloat(phaseData.price?.toString().replace(/[^0-9.]/g, "")) || 0,
      scheduledDate: phaseData.date && phaseData.date !== 'TBD' ? new Date(phaseData.date) : null,
      notes: phaseData.notes || ''
    });
  }

  async updatePhaseStatus(tenantId: string, phaseId: string, status: string) {
    return this.repository.updateItem(tenantId, phaseId, {
      status: status as any,
      updatedAt: new Date()
    });
  }

  async deleteTreatmentPhase(tenantId: string, phaseId: string) {
    return this.repository.deleteItem(tenantId, phaseId);
  }
}
