import prisma from "@/lib/prisma";
import { Patient, Prisma } from "@prisma/client";

export class PatientRepository {
  /**
   * Enforces tenant isolation for all patient queries
   */
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PatientWhereInput;
    orderBy?: Prisma.PatientOrderByWithRelationInput;
    include?: Prisma.PatientInclude;
  }): Promise<Patient[]> {
    return prisma.patient.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId, // Strict isolation
      },
    });
  }

  async findById(tenantId: string, id: string, include?: Prisma.PatientInclude) {
    return prisma.patient.findFirst({
      where: { id, tenantId },
      include
    });
  }

  async create(tenantId: string, data: Omit<Prisma.PatientCreateInput, 'tenant'>) {
    return prisma.patient.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } }
      }
    });
  }

  async update(tenantId: string, id: string, data: Prisma.PatientUpdateInput) {
    return prisma.patient.update({
      where: { id, tenantId },
      data
    });
  }

  async delete(tenantId: string, id: string) {
    return prisma.patient.delete({
      where: { id, tenantId }
    });
  }

  async count(tenantId: string, where?: Prisma.PatientWhereInput): Promise<number> {
    return prisma.patient.count({
      where: {
        ...where,
        tenantId,
      },
    });
  }

  // Relations management with tenant isolation
  async upsertOralCondition(tenantId: string, patientId: string, name: string, active: boolean) {
    return prisma.oralCondition.upsert({
      where: {
        tenantId_patientId_name: { tenantId, patientId, name }
      },
      update: { active, updatedAt: new Date() },
      create: { patientId, name, active, tenantId }
    });
  }

  async upsertOralTissue(tenantId: string, patientId: string, name: string, status: string, notes: string) {
    return prisma.oralTissueFinding.upsert({
      where: {
        tenantId_patientId_name: { tenantId, patientId, name }
      },
      update: { status, notes, updatedAt: new Date() },
      create: { patientId, name, status, notes, tenantId }
    });
  }

  async createVisitRecord(tenantId: string, patientId: string, data: any) {
    return prisma.visitRecord.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteVisitRecord(tenantId: string, id: string) {
    return prisma.visitRecord.delete({
      where: { id, tenantId }
    });
  }

  async upsertToothCondition(tenantId: string, patientId: string, toothNumber: number, condition: string, notes: string) {
    return prisma.toothCondition.upsert({
      where: {
        tenantId_patientId_toothNumber: { tenantId, patientId, toothNumber }
      },
      update: { condition, notes, updatedAt: new Date() },
      create: { patientId, toothNumber, condition, notes, tenantId }
    });
  }

  async createPeriodontalMeasurement(tenantId: string, patientId: string, data: any) {
    return prisma.periodontalMeasurement.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async createMedicalCondition(tenantId: string, patientId: string, data: any) {
    return prisma.medicalCondition.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteMedicalCondition(tenantId: string, id: string) {
    return prisma.medicalCondition.delete({
      where: { id, tenantId }
    });
  }

  async createAllergy(tenantId: string, patientId: string, data: any) {
    return prisma.patientAllergy.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteAllergy(tenantId: string, id: string) {
    return prisma.patientAllergy.delete({
      where: { id, tenantId }
    });
  }

  async createMedication(tenantId: string, patientId: string, data: any) {
    return prisma.patientMedication.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteMedication(tenantId: string, id: string) {
    return prisma.patientMedication.delete({
      where: { id, tenantId }
    });
  }

  async createSurgery(tenantId: string, patientId: string, data: any) {
    return prisma.patientSurgery.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteSurgery(tenantId: string, id: string) {
    return prisma.patientSurgery.delete({
      where: { id, tenantId }
    });
  }

  async createFamilyHistory(tenantId: string, patientId: string, data: any) {
    return prisma.patientFamilyHistory.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async deleteFamilyHistory(tenantId: string, id: string) {
    return prisma.patientFamilyHistory.delete({
      where: { id, tenantId }
    });
  }

  async createPrescription(tenantId: string, patientId: string, data: any) {
    return prisma.prescription.create({
      data: {
        ...data,
        patientId,
        tenantId,
        items: {
          create: data.items
        }
      }
    });
  }

  async deletePrescription(tenantId: string, id: string) {
    return prisma.prescription.delete({
      where: { id, tenantId }
    });
  }

  async createDocument(tenantId: string, patientId: string, data: any) {
    return prisma.patientDocument.create({
      data: { ...data, patientId, tenantId }
    });
  }

  async updateInvoice(tenantId: string, id: string, data: any) {
    return prisma.invoice.update({
      where: { id, tenantId },
      data
    });
  }
}
