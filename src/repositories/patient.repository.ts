import { prisma } from "@/lib/prisma";
import { Patient, Prisma } from "@/generated/client";

export class PatientRepository {
  /**
   * Enforces tenant isolation for all patient queries
   */
  async findMany(tenantId: string, params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PatientWhereInput;
    orderBy?: Prisma.PatientOrderByWithRelationInput;
    select?: Prisma.PatientSelect;
  }): Promise<any[]> {
    return prisma.patient.findMany({
      ...params,
      where: {
        ...params?.where,
        tenantId, // Strict isolation
      },
    });
  }

  async findById(tenantId: string, id: string, select?: Prisma.PatientSelect) {
    return prisma.patient.findFirst({
      where: { id, tenantId },
      select: select || {
        id: true,
        displayId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      }
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

  async upsertToothCondition(tenantId: string, patientId: string, toothNumber: number, condition: string, isMissing: boolean, notes: string) {
    return prisma.toothCondition.upsert({
      where: {
        tenantId_patientId_toothNumber: { tenantId, patientId, toothNumber }
      },
      update: { condition, isMissing, notes, updatedAt: new Date() },
      create: { patientId, toothNumber, condition, isMissing, notes, tenantId }
    });
  }

  async createPeriodontalMeasurement(tenantId: string, patientId: string, data: any) {
    // Upsert to avoid duplicate rows for the same tooth + parameter combination
    return prisma.periodontalMeasurement.upsert({
      where: {
        patientId_toothNumber_parameterName: {
          patientId,
          toothNumber: data.toothNumber,
          parameterName: data.parameterName,
        }
      },
      update: {
        buccalValues: data.buccalValues,
        lingualValues: data.lingualValues,
        singleValue: data.singleValue ?? null,
        measurementDate: data.measurementDate ?? new Date(),
      },
      create: {
        ...data,
        patientId,
        tenantId,
      }
    });
  }

  async deleteAllPeriodontalMeasurements(tenantId: string, patientId: string) {
    return prisma.periodontalMeasurement.deleteMany({
      where: { patientId, tenantId }
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
      data: { 
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        category: data.category || "other",
        uploadDate: data.uploadDate || new Date(),
        patientId, 
        tenantId 
      }
    });
  }

  async deleteDocument(tenantId: string, id: string) {
    return prisma.patientDocument.delete({
      where: { id, tenantId }
    });
  }

  async createInvoice(tenantId: string, patientId: string, data: any) {
    return prisma.invoice.create({
      data: {
        patientId,
        tenantId,
        totalAmount: data.amount,
        treatment: data.treatment,
        dueDate: data.dueDate,
        status: data.status || 'PENDING',
        items: {
          create: data.items.map((item: any) => ({
            description: item.description || item.name || "Service",
            price: item.price || item.amount || 0,
            quantity: item.quantity || 1,
            tenantId
          }))
        }
      },
      select: {
        id: true,
        displayId: true,
        patientId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
        createdAt: true,
        items: true
      }
    });
  }

  async addPayment(tenantId: string, invoiceId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch invoice with strict tenant isolation and necessary fields
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          status: true
        }
      });

      if (!invoice) {
        throw new Error("Invoice not found or unauthorized access.");
      }

      if (invoice.status === "PAID") {
        throw new Error("This invoice is already fully paid.");
      }

      const totalAmount = Number(invoice.totalAmount);
      const currentPaid = Number(invoice.paidAmount);
      const remainingBalance = totalAmount - currentPaid;

      // 2. Validate payment amount
      if (data.amount > (remainingBalance + 0.001)) {
        throw new Error(`Payment amount exceeds the remaining balance ($${remainingBalance.toFixed(2)}).`);
      }

      // 3. Create the Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
          paidAt: data.date || new Date(),
          tenantId
        }
      });

      // 4. Calculate new state
      const newPaidAmount = currentPaid + Number(data.amount);
      let newStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      
      if (newPaidAmount >= totalAmount - 0.001) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL';
      }

      // 5. Update the Invoice record
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          paidAmount: newPaidAmount,
          status: newStatus,
          updatedAt: new Date()
        }
      });

      return payment;
    });
  }

  async deleteInvoice(tenantId: string, id: string) {
    return prisma.invoice.delete({
      where: { id, tenantId }
    });
  }

  async updateInvoice(tenantId: string, id: string, data: any) {
    return prisma.invoice.update({
      where: { id, tenantId },
      data
    });
  }
}
