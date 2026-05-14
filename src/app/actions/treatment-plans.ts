'use server'

import { revalidatePath } from 'next/cache'
import { TreatmentPlanService } from "@/services/treatment-plan.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { requireRecordAccess } from "@/lib/abac";
import { PermissionCode } from "@/types/permissions";
import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";

const treatmentPlanService = new TreatmentPlanService();

/**
 * Server Action: Fetches all treatment plans for a patient.
 */
export async function getTreatmentPlans(patientId: string) {
  try {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.PATIENT_VIEW);
    await requireRecordAccess('patient', patientId);
    
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

/**
 * Server Action: Creates a new treatment plan.
 */
export const createTreatmentPlan = wrapAction(
  'TREATMENT_PLAN_CREATE',
  async (patientId: string, planData: any) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    const plan = await treatmentPlanService.createTreatmentPlan(tenantId, patientId, planData);

    await EventService.trackEvent({
      tenantId,
      eventType: 'TREATMENT_PLAN_CREATED',
      entityType: 'TREATMENT',
      entityId: plan.id,
      metadata: { patientId, title: plan.title }
    });

    revalidatePath(`/patients/${patientId}`);
    return plan;
  },
  { module: 'clinical', entityType: 'TREATMENT_PLAN' }
);

/**
 * Server Action: Deletes a treatment plan.
 */
export const deleteTreatmentPlan = wrapAction(
  'TREATMENT_PLAN_DELETE',
  async (planId: string, patientId: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    await treatmentPlanService.deleteTreatmentPlan(tenantId, planId);
    
    await EventService.trackEvent({
      tenantId,
      eventType: 'TREATMENT_PLAN_DELETED',
      entityType: 'TREATMENT',
      entityId: planId,
      metadata: { patientId }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  },
  { module: 'clinical', entityType: 'TREATMENT_PLAN' }
);

/**
 * Server Action: Updates treatment plan status.
 */
export const updatePlanStatus = wrapAction(
  'TREATMENT_PLAN_STATUS_UPDATE',
  async (planId: string, status: string, patientId: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    await treatmentPlanService.updatePlanStatus(tenantId, planId, status);

    await EventService.trackEvent({
      tenantId,
      eventType: 'TREATMENT_PLAN_STATUS_CHANGED',
      entityType: 'TREATMENT',
      entityId: planId,
      metadata: { status, patientId }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  },
  { module: 'clinical', entityType: 'TREATMENT_PLAN' }
);

/**
 * Server Action: Adds a phase to a treatment plan.
 */
export const addTreatmentPhase = wrapAction(
  'TREATMENT_PHASE_ADD',
  async (planId: string, phaseData: any, step: number, patientId: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    await treatmentPlanService.addTreatmentPhase(tenantId, planId, phaseData, step);

    await EventService.trackEvent({
      tenantId,
      eventType: 'TREATMENT_PLAN_STATUS_CHANGED',
      entityType: 'TREATMENT',
      entityId: planId,
      metadata: { patientId, action: 'PHASE_ADDED', serviceName: phaseData.serviceName }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  },
  { module: 'clinical', entityType: 'TREATMENT_PHASE' }
);

/**
 * Server Action: Updates a treatment phase status.
 */
export const updatePhaseStatus = wrapAction(
  'TREATMENT_PHASE_STATUS_UPDATE',
  async (phaseId: string, status: string, patientId: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    await treatmentPlanService.updatePhaseStatus(tenantId, phaseId, status);

    let eventType: any = 'TREATMENT_UPDATED';
    if (status === 'In Progress') eventType = 'TREATMENT_STARTED';
    if (status === 'Completed') eventType = 'TREATMENT_COMPLETED';

    await EventService.trackEvent({
      tenantId,
      eventType,
      entityType: 'TREATMENT',
      entityId: phaseId,
      metadata: { status, patientId }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  },
  { module: 'clinical', entityType: 'TREATMENT_PHASE' }
);

/**
 * Server Action: Deletes a treatment phase.
 */
export const deleteTreatmentPhase = wrapAction(
  'TREATMENT_PHASE_DELETE',
  async (phaseId: string, patientId: string) => {
    const tenantId = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_TREATMENT_PLAN_MANAGE);
    await requireRecordAccess('patient', patientId);
    
    await treatmentPlanService.deleteTreatmentPhase(tenantId, phaseId);

    await EventService.trackEvent({
      tenantId,
      eventType: 'TREATMENT_PLAN_STATUS_CHANGED',
      entityType: 'TREATMENT',
      entityId: phaseId,
      metadata: { patientId, action: 'PHASE_DELETED' }
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  },
  { module: 'clinical', entityType: 'TREATMENT_PHASE' }
);


