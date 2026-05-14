'use server';

import { getTenantContext } from '@/lib/tenant-context';
import { requirePermission } from '@/lib/rbac';
import { PermissionCode } from '@/types/permissions';
import {
  getDoctorPerformance,
  getAppointmentEfficiency,
  getPatientFunnel,
  getAllTimeComparisons,
  getDoctorSegmentation,
  getTimeSlotSegmentation,
  getPatientTypeSegmentation,
  getDetailedEvents,
  type DoctorPerformance,
  type AppointmentEfficiency,
  type FunnelStage,
  type TimeRangeComparison,
  type SegmentResult,
  type DetailedEvent,
  type DetailedEventFilter,
} from '@/services/analytics.service';

async function getAuthorizedTenantId(): Promise<string> {
  await requirePermission(PermissionCode.ADMIN_FULL_ACCESS);
  const { tenantId } = await getTenantContext();
  return tenantId;
}

// ─── Existing actions (unchanged API) ─────────────────────────────────────────

export async function getDoctorAnalytics(): Promise<DoctorPerformance[]> {
  const tenantId = await getAuthorizedTenantId();
  return getDoctorPerformance(tenantId);
}

export async function getEfficiencyAnalytics(): Promise<AppointmentEfficiency> {
  const tenantId = await getAuthorizedTenantId();
  return getAppointmentEfficiency(tenantId);
}

export async function getFunnelAnalytics(): Promise<FunnelStage[]> {
  const tenantId = await getAuthorizedTenantId();
  return getPatientFunnel(tenantId);
}

// ─── Part 1: Time Comparison ───────────────────────────────────────────────────

export async function getTimeComparisons(): Promise<TimeRangeComparison[]> {
  const tenantId = await getAuthorizedTenantId();
  return getAllTimeComparisons(tenantId);
}

// ─── Part 2: Segmentation ─────────────────────────────────────────────────────

export async function getDoctorSegmentationAnalytics(): Promise<SegmentResult[]> {
  const tenantId = await getAuthorizedTenantId();
  return getDoctorSegmentation(tenantId);
}

export async function getTimeSlotSegmentationAnalytics(): Promise<SegmentResult[]> {
  const tenantId = await getAuthorizedTenantId();
  return getTimeSlotSegmentation(tenantId);
}

export async function getPatientTypeSegmentationAnalytics(): Promise<SegmentResult[]> {
  const tenantId = await getAuthorizedTenantId();
  return getPatientTypeSegmentation(tenantId);
}

// ─── Part 3: Drill-Down ───────────────────────────────────────────────────────

export async function getDrillDownEvents(
  filter: Omit<DetailedEventFilter, 'tenantId'>,
): Promise<DetailedEvent[]> {
  const tenantId = await getAuthorizedTenantId();
  return getDetailedEvents({ ...filter, tenantId });
}
