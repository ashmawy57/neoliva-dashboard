import 'server-only'
import { BaseRepository } from './base.repository'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/client'

/**
 * AppointmentRepository (session-scoped)
 *
 * Extends BaseRepository to automatically resolve tenantId from the active
 * user session. Every method is tenant-isolated — no caller needs to pass
 * tenantId explicitly.
 *
 * Prisma model: Appointment  (@@map("appointments"))
 * Fields of note:
 *   date      — DateTime @db.Date  (calendar date)
 *   time      — DateTime @db.Time  (time-of-day)
 *   doctorId  — FK to Staff
 *   patientId — FK to Patient
 *   tenantId  — camelCase (mapped to tenant_id in DB)
 *   patient   — relation to Patient
 *   doctor    — relation to Staff
 */
class AppointmentRepository extends BaseRepository {
  /**
   * Return all appointments for the current tenant with optional filters.
   * @param filters.date      - Filter to a specific calendar day
   * @param filters.doctorId  - Filter by doctor (Staff) ID
   * @param filters.status    - Filter by AppointmentStatus
   */
  async findAll(filters?: { date?: Date; doctorId?: string; status?: string }) {
    const tenantId = await this.getTenantId()

    let dateFilter: Prisma.AppointmentWhereInput | undefined
    if (filters?.date) {
      // Build a same-day range using the `date` field (stored as @db.Date)
      const d = new Date(filters.date)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      dateFilter = {
        date: { gte: start, lt: end },
      }
    }

    return prisma.appointment.findMany({
      where: {
        tenantId,
        ...(filters?.doctorId && { doctorId: filters.doctorId }),
        ...(filters?.status   && { status: filters.status as any }),
        ...dateFilter,
      },
      select: {
        id:        true,
        date:      true,
        time:      true,
        status:    true,
        treatment: true,
        notes:     true,
        patientId: true,
        doctorId:  true,
        patient: {
          select: { id: true, name: true, phone: true },
        },
        doctor: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })
  }

  /**
   * Find a single appointment by ID.
   * Returns null if the appointment does not belong to the current tenant.
   */
  async findById(id: string) {
    return this.safeFindFirst<Awaited<ReturnType<typeof prisma.appointment.findFirst>>>(
      prisma.appointment,
      {
        where: { id },
        include: { patient: true, doctor: true, service: true },
      }
    )
  }

  /**
   * Create a new appointment for the current tenant.
   * tenantId is injected automatically — do not include it in `data`.
   */
  async create(data: Omit<Prisma.AppointmentUncheckedCreateInput, 'tenantId'>) {
    return this.safeCreate<Awaited<ReturnType<typeof prisma.appointment.create>>>(
      prisma.appointment,
      data
    )
  }

  /**
   * Update an existing appointment. Verifies ownership before updating.
   */
  async update(id: string, data: Prisma.AppointmentUncheckedUpdateInput) {
    return this.safeUpdate<Awaited<ReturnType<typeof prisma.appointment.update>>>(
      prisma.appointment,
      id,
      data
    )
  }

  /**
   * Delete an appointment. Verifies ownership before deleting.
   */
  async delete(id: string) {
    return this.safeDelete<Awaited<ReturnType<typeof prisma.appointment.delete>>>(
      prisma.appointment,
      id
    )
  }
}

export const appointmentRepository = new AppointmentRepository()
