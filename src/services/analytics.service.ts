import { prisma } from '@/lib/prisma';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
  completedAppointments: number;
  noShowCount: number;
  completionRate: number; // 0–100
  noShowRate: number;     // 0–100
}

export interface AppointmentEfficiency {
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
}

export interface FunnelStage {
  stage: 'NEW' | 'DIAGNOSED' | 'IN_TREATMENT' | 'COMPLETED';
  count: number;
  dropOffRate: number | null;
}

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface TimeRangeComparison {
  metric: string;
  current: number;
  previous: number;
  delta: number;         // absolute difference
  deltaPercent: number;  // % change relative to previous
  trend: TrendDirection;
}

export interface SegmentResult {
  segment: string;
  key: string;
  totalAppointments: number;
  noShowRate: number;   // 0–100
  completionRate: number; // 0–100
}

export interface DetailedEvent {
  id: string;
  eventType: string;
  patientId: string | null;
  patientName: string | null;
  appointmentId: string | null;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function dateWindow(daysAgo: number, daysBack = 0): { gte: Date; lt: Date } {
  const now = Date.now();
  return {
    gte: new Date(now - daysAgo * 86_400_000),
    lt:  new Date(now - daysBack * 86_400_000),
  };
}

function calcTrend(current: number, previous: number): TrendDirection {
  if (previous === 0) return current > 0 ? 'UP' : 'STABLE';
  const diff = current - previous;
  if (Math.abs(diff / previous) < 0.01) return 'STABLE'; // <1% = stable
  return diff > 0 ? 'UP' : 'DOWN';
}

function pct(num: number, den: number) {
  return den > 0 ? Math.round((num / den) * 100) : 0;
}

// ─── MODULE 1: Doctor Performance ─────────────────────────────────────────────

export async function getDoctorPerformance(tenantId: string): Promise<DoctorPerformance[]> {
  const [rows, noShowEvents] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['doctorId', 'status'],
      where: { tenantId },
      _count: { id: true },
    }),
    prisma.businessEvent.groupBy({
      by: ['userId'],
      where: { tenantId, eventType: 'PATIENT_NO_SHOW', userId: { not: null } },
      _count: { id: true },
    }),
  ]);

  const noShowByDoctor = new Map(noShowEvents.map(e => [e.userId!, e._count.id]));
  const doctorIds = [...new Set(rows.map(r => r.doctorId))];

  const doctors = await prisma.staff.findMany({
    where: { id: { in: doctorIds }, tenantId },
    select: { id: true, name: true },
  });
  const nameById = new Map(doctors.map(d => [d.id, d.name]));

  const byDoctor = new Map<string, { total: number; completed: number }>();
  for (const row of rows) {
    const cur = byDoctor.get(row.doctorId) ?? { total: 0, completed: 0 };
    cur.total += row._count.id;
    if (row.status === 'COMPLETED') cur.completed += row._count.id;
    byDoctor.set(row.doctorId, cur);
  }

  return doctorIds.map(id => {
    const { total, completed } = byDoctor.get(id) ?? { total: 0, completed: 0 };
    const noShow = noShowByDoctor.get(id) ?? 0;
    return {
      doctorId: id,
      doctorName: nameById.get(id) ?? 'Unknown',
      totalAppointments: total,
      completedAppointments: completed,
      noShowCount: noShow,
      completionRate: pct(completed, total),
      noShowRate:     pct(noShow,    total),
    };
  }).sort((a, b) => b.totalAppointments - a.totalAppointments);
}

// ─── MODULE 2: Appointment Efficiency ────────────────────────────────────────

export async function getAppointmentEfficiency(tenantId: string): Promise<AppointmentEfficiency> {
  const rows = await prisma.appointment.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: { id: true },
  });

  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    counts[r.status ?? 'SCHEDULED'] = r._count.id;
    total += r._count.id;
  }

  const completed = counts['COMPLETED'] ?? 0;
  const cancelled = counts['CANCELLED'] ?? 0;
  const noShow    = counts['NO_SHOW']   ?? 0;

  return {
    scheduled: total,
    completed,
    cancelled,
    noShow,
    completionRate:   pct(completed, total),
    cancellationRate: pct(cancelled, total),
    noShowRate:       pct(noShow,    total),
  };
}

// ─── MODULE 3: Patient Lifecycle Funnel ──────────────────────────────────────

const FUNNEL_EVENTS: Array<{ stage: FunnelStage['stage']; eventType: string }> = [
  { stage: 'NEW',          eventType: 'PATIENT_CREATED'        },
  { stage: 'DIAGNOSED',    eventType: 'TREATMENT_PLAN_CREATED' },
  { stage: 'IN_TREATMENT', eventType: 'TREATMENT_STARTED'      },
  { stage: 'COMPLETED',    eventType: 'TREATMENT_COMPLETED'    },
];

export async function getPatientFunnel(tenantId: string): Promise<FunnelStage[]> {
  const rows = await prisma.businessEvent.groupBy({
    by: ['eventType'],
    where: { tenantId, eventType: { in: FUNNEL_EVENTS.map(f => f.eventType) } },
    _count: { id: true },
  });

  const countByEvent = new Map(rows.map(r => [r.eventType, r._count.id]));
  const stages: FunnelStage[] = FUNNEL_EVENTS.map(({ stage, eventType }) => ({
    stage,
    count: countByEvent.get(eventType) ?? 0,
    dropOffRate: null,
  }));

  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count;
    const curr = stages[i].count;
    stages[i].dropOffRate = prev > 0 ? Math.round(((prev - curr) / prev) * 100) : 0;
  }

  return stages;
}

// ─── MODULE 4: Time-Range Comparison ─────────────────────────────────────────

type ComparableMetric = 'noShowRate' | 'completionRate' | 'revenue';

async function fetchWindowMetric(tenantId: string, metric: ComparableMetric, window: { gte: Date; lt: Date }): Promise<number> {
  if (metric === 'revenue') {
    const result = await prisma.invoice.aggregate({
      where: { tenantId, status: 'PAID', createdAt: window },
      _sum: { totalAmount: true },
    });
    const raw = result._sum.totalAmount;
    return raw ? Number(raw) : 0;
  }

  // For rate metrics, group by status in the time window
  const rows = await prisma.appointment.groupBy({
    by: ['status'],
    where: { tenantId, createdAt: window },
    _count: { id: true },
  });

  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    counts[r.status ?? 'SCHEDULED'] = r._count.id;
    total += r._count.id;
  }

  if (total === 0) return 0;
  if (metric === 'completionRate') return pct(counts['COMPLETED'] ?? 0, total);
  if (metric === 'noShowRate')     return pct(counts['NO_SHOW']   ?? 0, total);
  return 0;
}

/**
 * Compares a metric across current 7 days vs previous 7 days.
 * Both windows are fetched in parallel — single round-trip per period.
 */
export async function getTimeRangeComparison(
  tenantId: string,
  metric: ComparableMetric,
): Promise<TimeRangeComparison> {
  const currentWindow  = dateWindow(7, 0);
  const previousWindow = dateWindow(14, 7);

  const [current, previous] = await Promise.all([
    fetchWindowMetric(tenantId, metric, currentWindow),
    fetchWindowMetric(tenantId, metric, previousWindow),
  ]);

  const delta = current - previous;
  const deltaPercent = previous > 0 ? Math.round((delta / previous) * 100) : (current > 0 ? 100 : 0);

  return {
    metric,
    current,
    previous,
    delta,
    deltaPercent,
    trend: calcTrend(current, previous),
  };
}

/**
 * Runs all three comparison metrics in parallel.
 */
export async function getAllTimeComparisons(tenantId: string): Promise<TimeRangeComparison[]> {
  return Promise.all([
    getTimeRangeComparison(tenantId, 'completionRate'),
    getTimeRangeComparison(tenantId, 'noShowRate'),
    getTimeRangeComparison(tenantId, 'revenue'),
  ]);
}

// ─── MODULE 5: Segmentation ───────────────────────────────────────────────────

/** Per-doctor segmentation — reuses getDoctorPerformance data, re-shaped. */
export async function getDoctorSegmentation(tenantId: string): Promise<SegmentResult[]> {
  const doctors = await getDoctorPerformance(tenantId);
  return doctors.map(d => ({
    segment: d.doctorName,
    key: d.doctorId,
    totalAppointments: d.totalAppointments,
    noShowRate: d.noShowRate,
    completionRate: d.completionRate,
  }));
}

/** 
 * Time-slot segmentation.
 * Uses raw SQL EXTRACT(HOUR FROM time) since Prisma doesn't support time-part groupBy.
 * Buckets: Morning (8–11), Afternoon (12–16), Evening (17–21).
 */
export async function getTimeSlotSegmentation(tenantId: string): Promise<SegmentResult[]> {
  // Raw aggregation: group by hour bucket + status
  const rows = await prisma.$queryRaw<
    Array<{ slot: string; status: string | null; cnt: bigint }>
  >`
    SELECT
      CASE
        WHEN EXTRACT(HOUR FROM "time") BETWEEN 8 AND 11  THEN 'Morning'
        WHEN EXTRACT(HOUR FROM "time") BETWEEN 12 AND 16 THEN 'Afternoon'
        WHEN EXTRACT(HOUR FROM "time") BETWEEN 17 AND 21 THEN 'Evening'
        ELSE 'Other'
      END AS slot,
      status,
      COUNT(*) AS cnt
    FROM appointments
    WHERE tenant_id = ${tenantId}::uuid
    GROUP BY slot, status
  `;

  const SLOTS = ['Morning', 'Afternoon', 'Evening'];
  const bySlot: Record<string, { total: number; noShow: number; completed: number }> = {};
  for (const slot of SLOTS) bySlot[slot] = { total: 0, noShow: 0, completed: 0 };

  for (const row of rows) {
    const slot = SLOTS.includes(row.slot) ? row.slot : null;
    if (!slot) continue;
    const cnt = Number(row.cnt);
    bySlot[slot].total += cnt;
    if (row.status === 'NO_SHOW')   bySlot[slot].noShow    += cnt;
    if (row.status === 'COMPLETED') bySlot[slot].completed += cnt;
  }

  return SLOTS.map(slot => ({
    segment: slot,
    key: slot.toLowerCase(),
    totalAppointments: bySlot[slot].total,
    noShowRate:     pct(bySlot[slot].noShow,    bySlot[slot].total),
    completionRate: pct(bySlot[slot].completed, bySlot[slot].total),
  }));
}

/**
 * New vs returning patient segmentation.
 * A patient is "new" if their first appointment is within the last 90 days.
 */
export async function getPatientTypeSegmentation(tenantId: string): Promise<SegmentResult[]> {
  const cutoff = new Date(Date.now() - 90 * 86_400_000); // 90 days ago

  const [newRows, returningRows] = await Promise.all([
    // New patients: created in last 90 days
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        tenantId,
        patient: { createdAt: { gte: cutoff } },
      },
      _count: { id: true },
    }),
    // Returning patients: created before 90 days
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        tenantId,
        patient: { createdAt: { lt: cutoff } },
      },
      _count: { id: true },
    }),
  ]);

  function summarize(rows: typeof newRows) {
    let total = 0, noShow = 0, completed = 0;
    for (const r of rows) {
      const cnt = r._count.id;
      total += cnt;
      if (r.status === 'NO_SHOW')   noShow    += cnt;
      if (r.status === 'COMPLETED') completed += cnt;
    }
    return { total, noShow, completed };
  }

  const newStats  = summarize(newRows);
  const retStats  = summarize(returningRows);

  return [
    {
      segment: 'New Patients',
      key: 'new',
      totalAppointments: newStats.total,
      noShowRate:     pct(newStats.noShow,    newStats.total),
      completionRate: pct(newStats.completed, newStats.total),
    },
    {
      segment: 'Returning Patients',
      key: 'returning',
      totalAppointments: retStats.total,
      noShowRate:     pct(retStats.noShow,    retStats.total),
      completionRate: pct(retStats.completed, retStats.total),
    },
  ];
}

// ─── MODULE 6: Detailed Events (Drill-Down) ───────────────────────────────────

export interface DetailedEventFilter {
  tenantId: string;
  eventType?: string;
  entityId?: string;   // doctorId maps here via userId correlation
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export async function getDetailedEvents(filter: DetailedEventFilter): Promise<DetailedEvent[]> {
  const {
    tenantId,
    eventType,
    entityId,
    dateFrom,
    dateTo,
    limit = 50,
  } = filter;

  const events = await prisma.businessEvent.findMany({
    where: {
      tenantId,
      ...(eventType  ? { eventType }                                          : {}),
      ...(entityId   ? { entityId }                                           : {}),
      ...(dateFrom || dateTo
        ? { createdAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Batch-resolve patient names for events that have entityId linking to patients
  const patientIds = [
    ...new Set(
      events
        .filter(e => ['PATIENT_CREATED', 'PATIENT_NO_SHOW', 'PATIENT_CHART_UPDATED'].includes(e.eventType))
        .map(e => e.entityId)
        .filter(Boolean) as string[]
    ),
  ];

  const patients = patientIds.length > 0
    ? await prisma.patient.findMany({
        where: { id: { in: patientIds }, tenantId },
        select: { id: true, name: true },
      })
    : [];

  const patientNameById = new Map(patients.map(p => [p.id, p.name]));

  return events.map(e => ({
    id:            e.id,
    eventType:     e.eventType,
    patientId:     e.entityId ?? null,
    patientName:   e.entityId ? (patientNameById.get(e.entityId) ?? null) : null,
    appointmentId: (e.metadata as any)?.appointmentId ?? null,
    timestamp:     e.createdAt,
    metadata:      (e.metadata as Record<string, unknown>) ?? {},
  }));
}
