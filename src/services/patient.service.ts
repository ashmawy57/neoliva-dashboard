import { PatientRepository } from "@/repositories/patient.repository";
import { Patient, Prisma } from "@prisma/client";

const patientRepository = new PatientRepository();

export class PatientService {
  async getAllPatients(tenantId: string) {
    return patientRepository.findAll(tenantId, {
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          select: {
            id: true,
            date: true,
            status: true
          }
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
  }

  async getPatientById(tenantId: string, id: string) {
    return patientRepository.findById(tenantId, id, {
      appointments: true,
      invoices: true,
      patientAllergies: true,
      medicalConditions: true,
      patientMedications: true,
      patientSurgeries: true,
      patientFamilyHistory: true,
      visitRecords: true,
      oralTissueFindings: true,
      toothConditions: true,
      periodontalMeasurements: true,
      prescriptions: {
        include: {
          items: true
        }
      },
      patientDocuments: true,
      oralConditions: true
    });
  }

  async createPatient(tenantId: string, data: Omit<Prisma.PatientCreateInput, 'tenant'>) {
    return patientRepository.create(tenantId, data);
  }

  async updatePatient(tenantId: string, id: string, data: Prisma.PatientUpdateInput) {
    return patientRepository.update(tenantId, id, data);
  }

  async deletePatient(tenantId: string, id: string) {
    return patientRepository.delete(tenantId, id);
  }

  async updateOralCondition(tenantId: string, patientId: string, name: string, active: boolean) {
    return patientRepository.upsertOralCondition(tenantId, patientId, name, active);
  }

  async updateOralTissue(tenantId: string, patientId: string, name: string, status: string, notes: string) {
    return patientRepository.upsertOralTissue(tenantId, patientId, name, status, notes);
  }

  async addVisitRecord(tenantId: string, patientId: string, data: any) {
    return patientRepository.createVisitRecord(tenantId, patientId, data);
  }

  async deleteVisitRecord(tenantId: string, id: string) {
    return patientRepository.deleteVisitRecord(tenantId, id);
  }

  async updateToothCondition(tenantId: string, patientId: string, toothNumber: number, condition: string, notes: string) {
    return patientRepository.upsertToothCondition(tenantId, patientId, toothNumber, condition, notes);
  }

  async updatePeriodontalMeasurement(tenantId: string, patientId: string, data: any) {
    return patientRepository.createPeriodontalMeasurement(tenantId, patientId, data);
  }

  async addMedicalCondition(tenantId: string, patientId: string, data: any) {
    return patientRepository.createMedicalCondition(tenantId, patientId, data);
  }

  async deleteMedicalCondition(tenantId: string, id: string) {
    return patientRepository.deleteMedicalCondition(tenantId, id);
  }

  async addAllergy(tenantId: string, patientId: string, data: any) {
    return patientRepository.createAllergy(tenantId, patientId, data);
  }

  async deleteAllergy(tenantId: string, id: string) {
    return patientRepository.deleteAllergy(tenantId, id);
  }

  async addMedication(tenantId: string, patientId: string, data: any) {
    return patientRepository.createMedication(tenantId, patientId, data);
  }

  async deleteMedication(tenantId: string, id: string) {
    return patientRepository.deleteMedication(tenantId, id);
  }

  async addSurgery(tenantId: string, patientId: string, data: any) {
    return patientRepository.createSurgery(tenantId, patientId, data);
  }

  async deleteSurgery(tenantId: string, id: string) {
    return patientRepository.deleteSurgery(tenantId, id);
  }

  async addFamilyHistory(tenantId: string, patientId: string, data: any) {
    return patientRepository.createFamilyHistory(tenantId, patientId, data);
  }

  async deleteFamilyHistory(tenantId: string, id: string) {
    return patientRepository.deleteFamilyHistory(tenantId, id);
  }

  async addPrescription(tenantId: string, patientId: string, data: any) {
    return patientRepository.createPrescription(tenantId, patientId, data);
  }

  async deletePrescription(tenantId: string, id: string) {
    return patientRepository.deletePrescription(tenantId, id);
  }

  async addDocument(tenantId: string, patientId: string, data: any) {
    return patientRepository.createDocument(tenantId, patientId, data);
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    return patientRepository.updateInvoice(tenantId, id, { status });
  }
}
