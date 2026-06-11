import 'server-only'
import { BaseRepository } from './base.repository'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/client'

/**
 * PatientRepository (session-scoped)
 *
 * Extends BaseRepository to automatically resolve tenantId from the active
 * user session. Every method is tenant-isolated — no caller needs to pass
 * tenantId explicitly.
 *
 * Prisma model: Patient  (@@map("patients"))
 * Fields of note:
 *   name        — patient full name (not full_name)
 *   tenantId    — camelCase (mapped to tenant_id in DB)
 *   appointments — relation to Appointment[]
 *   invoices     — relation to Invoice[]
 */
class PatientRepository extends BaseRepository {
  /**
   * Return all patients for the current tenant with optional search/status filters.
   */
  async findAll(filters?: { search?: string; status?: string }) {
    const tenantId = await this.getTenantId()
    return prisma.patient.findMany({
      where: {
        tenantId,
        ...(filters?.search && {
          OR: [
            { name:  { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find a single patient by ID, including recent appointments and invoices.
   * Returns null if the patient does not belong to the current tenant.
   */
  async findById(id: string) {
    return this.safeFindFirst<Awaited<ReturnType<typeof prisma.patient.findFirst>>>(
      prisma.patient,
      {
        where: { id },
        include: {
          appointments: { orderBy: { createdAt: 'desc' }, take: 5 },
          invoices:     { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      }
    )
  }

  /**
   * Create a new patient for the current tenant.
   * tenantId is injected automatically — do not include it in `data`.
   */
  async create(data: Omit<Prisma.PatientUncheckedCreateInput, 'tenantId'>) {
    return this.safeCreate<Awaited<ReturnType<typeof prisma.patient.create>>>(
      prisma.patient,
      data
    )
  }

  /**
   * Update an existing patient. Verifies ownership before updating.
   */
  async update(id: string, data: Prisma.PatientUpdateInput) {
    return this.safeUpdate<Awaited<ReturnType<typeof prisma.patient.update>>>(
      prisma.patient,
      id,
      data
    )
  }

  /**
   * Delete a patient. Verifies ownership before deleting.
   */
  async delete(id: string) {
    return this.safeDelete<Awaited<ReturnType<typeof prisma.patient.delete>>>(
      prisma.patient,
      id
    )
  }
}

export const patientRepository = new PatientRepository()
