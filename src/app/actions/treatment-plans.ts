'use server'

import { revalidatePath } from 'next/cache'
import { TreatmentPlanService } from "@/services/treatment-plan.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const treatmentPlanService = new TreatmentPlanService();

export async function getTreatmentPlans(patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await treatmentPlanService.getTreatmentPlans(tenantId, patientId);

    return data.map((plan) => {
      const phases = (plan.items || [])
        .sort((a, b) => (a.step || 0) - (b.step || 0))
        .map((item) => ({
          id: item.id,
          step: item.step || 1,
          name: item.serviceName,
          serviceId: item.serviceId,
          toothList: item.toothList ? item.toothList.split(',') : [],
          status: item.status || 'Planned',
          date: item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
          price: Number(item.price) || 0,
          notes: item.notes || ''
        }));

      const totalCost = phases.reduce((sum: number, p: any) => sum + p.price, 0);

      return {
        id: plan.id,
        title: plan.title,
        status: plan.status || 'Active',
        progress: 0, // Will be calculated in the component
        cost: totalCost,
        created: plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—',
        notes: plan.notes || '',
        phases
      }
    });
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    return [];
  }
}

export async function createTreatmentPlan(patientId: string, planData: any) {
  try {
    const tenantId = await resolveTenantContext();
    const plan = await treatmentPlanService.createTreatmentPlan(tenantId, patientId, planData);

    revalidatePath(`/patients/${patientId}`);
    return { success: true, data: plan };
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTreatmentPlan(planId: string, patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await treatmentPlanService.deleteTreatmentPlan(tenantId, planId);

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting plan:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePlanStatus(planId: string, status: string, patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await treatmentPlanService.updatePlanStatus(tenantId, planId, status);

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating plan status:', error);
    return { success: false, error: error.message };
  }
}

export async function addTreatmentPhase(planId: string, phaseData: any, step: number, patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await treatmentPlanService.addTreatmentPhase(tenantId, planId, phaseData, step);

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding phase:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePhaseStatus(phaseId: string, status: string, patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await treatmentPlanService.updatePhaseStatus(tenantId, phaseId, status);

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating phase status:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTreatmentPhase(phaseId: string, patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await treatmentPlanService.deleteTreatmentPhase(tenantId, phaseId);

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting phase:', error);
    return { success: false, error: error.message };
  }
}

