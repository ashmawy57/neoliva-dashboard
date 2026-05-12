import "server-only";
import { PatientRepository } from "@/repositories/patient.repository";
import { Prisma } from "@/generated/client";

const patientRepository = new PatientRepository();

export class PatientService {
  private normalizeString(val: string | null | undefined, fallback: string = "-"): string {
    if (!val || typeof val !== 'string') return fallback;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  private mapSafePatient(patient: any): any {
    if (!patient) return this.getSafeFallback();
    try {
      return JSON.parse(JSON.stringify({
        ...patient,
        name: this.normalizeString(patient.name, "Unknown Patient"),
        phone: this.normalizeString(patient.phone, "-"),
        email: this.normalizeString(patient.email, "-"),
        status: patient.status || "Active",
        createdAt: patient.createdAt || new Date(),
      }));
    } catch (error) {
      console.error("[PatientService.mapSafePatient] Error:", error);
      return this.getSafeFallback(patient?.id);
    }
  }

  private getSafeFallback(id?: string): any {
    return {
      id: id || "unknown",
      displayId: "P-0000",
      name: "Unknown Patient",
      phone: "-",
      email: "-",
      status: "Inactive",
      createdAt: new Date(),
      appointments: [],
      invoices: [],
      visitRecords: [],
      patientDocuments: [],
      patientAllergies: [],
      medicalConditions: [],
      patientMedications: [],
      patientSurgeries: [],
      patientFamilyHistory: [],
      oralTissueFindings: [],
      toothConditions: [],
      periodontalMeasurements: [],
      prescriptions: [],
      oralConditions: [],
    };
  }

  async getAllPatients(tenantId: string) {
    try {
      if (!tenantId) return [];
      const patients = await patientRepository.findMany(tenantId, {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayId: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        }
      });
      return (patients || []).map(p => this.mapSafePatient(p));
    } catch (error) {
      console.error("[PatientService.getAllPatients] Error:", error);
      return [];
    }
  }

  async getPatientsForSelection(tenantId: string) {
    try {
      if (!tenantId) return [];
      const data = await patientRepository.findMany(tenantId, {
        select: {
          id: true,
          displayId: true,
          name: true,
        },
        orderBy: { name: 'asc' }
      });
      
      const safeData = (data || []).map(p => ({
        id: p.id,
        displayId: p.displayId || "P-0000",
        name: this.normalizeString(p.name, "Unknown Patient"),
      }));

      return JSON.parse(JSON.stringify(safeData));
    } catch (error) {
      console.error("[PatientService.getPatientsForSelection] Error:", error);
      return [];
    }
  }

  async getPatientsList(tenantId: string) {
    try {
      if (!tenantId) return [];
      const data = await patientRepository.findMany(tenantId, {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayId: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          appointments: {
            select: {
              date: true,
              status: true
            }
          },
          invoices: {
            select: {
              totalAmount: true,
              paidAmount: true
            }
          }
        }
      });
      
      const result = (data || []).map((patient: any) => {
        try {
          const appts = patient.appointments || []
          const nextAppt = appts
            .filter((a: any) => a.date && new Date(a.date) > new Date() && a.status !== 'Cancelled')
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

          const lastVisit = appts
            .filter((a: any) => a.date && new Date(a.date) < new Date() && a.status === 'Completed')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          const getInitials = (name: string) => {
            if (!name) return '??';
            const parts = name.trim().split(/\s+/).filter(Boolean);
            if (parts.length === 0) return '??';
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
          }

          const name = this.normalizeString(patient.name, "Unknown Patient");

          return {
            id: patient.id,
            displayId: patient.displayId || "P-0000",
            name: name,
            email: this.normalizeString(patient.email, "—"),
            phone: this.normalizeString(patient.phone, "—"),
            gender: patient.gender,
            lastVisit: lastVisit ? new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits',
            nextAppt: nextAppt ? new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
            status: patient.status || 'Active',
            visits: appts.filter((a: any) => a.status === 'Completed').length,
            avatar: patient.avatarInitials || getInitials(name),
            color: patient.colorGradient || 'from-blue-500 to-indigo-600',
            registeredSince: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
            outstanding: (patient.invoices || [])
              .reduce((sum: number, i: any) => {
                const paid = Number(i.paidAmount || 0);
                const total = Number(i.totalAmount || 0);
                return sum + (total - paid);
              }, 0)
          }
        } catch (innerError) {
          console.error(`[PatientService.getPatientsList] Mapping error for patient ${patient?.id}:`, innerError);
          return { id: patient?.id || "unknown", name: "Error Loading" };
        }
      });

      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.getPatientsList] Error:", error);
      return [];
    }
  }

  async getPatientById(tenantId: string, id: string) {
    try {
      if (!id || !tenantId) return this.getSafeFallback(id);

      const [core, clinical] = await Promise.all([
        patientRepository.findUnique(tenantId, id, {
          id: true,
          displayId: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          dob: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          tenantId: true,
          appointments: true,
          invoices: {
            select: {
              id: true,
              displayId: true,
              patientId: true,
              totalAmount: true,
              paidAmount: true,
              status: true,
              dueDate: true,
              createdAt: true,
              items: true,
              payments: true
            }
          },
          visitRecords: true,
          patientDocuments: true,
        }),
        patientRepository.findUnique(tenantId, id, {
          patientAllergies: true,
          medicalConditions: true,
          patientMedications: true,
          patientSurgeries: true,
          patientFamilyHistory: true,
          oralTissueFindings: true,
          toothConditions: true,
          periodontalMeasurements: true,
          prescriptions: {
            select: {
              id: true,
              date: true,
              notes: true,
              items: true
            }
          },
          oralConditions: true,
        }),
      ]);

      if (!core) return this.getSafeFallback(id);

      const result = {
        ...clinical,
        ...core,
        name: this.normalizeString(core.name, "Unknown Patient"),
        phone: this.normalizeString(core.phone, "-"),
        email: this.normalizeString(core.email, "-"),
        patientAllergies: clinical?.patientAllergies ?? [],
        medicalConditions: clinical?.medicalConditions ?? [],
        patientMedications: clinical?.patientMedications ?? [],
        patientSurgeries: clinical?.patientSurgeries ?? [],
        patientFamilyHistory: clinical?.patientFamilyHistory ?? [],
        oralTissueFindings: clinical?.oralTissueFindings ?? [],
        toothConditions: clinical?.toothConditions ?? [],
        periodontalMeasurements: clinical?.periodontalMeasurements ?? [],
        prescriptions: clinical?.prescriptions ?? [],
        oralConditions: clinical?.oralConditions ?? [],
        appointments: core?.appointments ?? [],
        invoices: core?.invoices ?? [],
        visitRecords: core?.visitRecords ?? [],
        patientDocuments: core?.patientDocuments ?? [],
      };

      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error(`[PatientService.getPatientById] Error fetching patient ${id}:`, error);
      return this.getSafeFallback(id);
    }
  }

  async createPatient(tenantId: string, data: Omit<Prisma.PatientUncheckedCreateInput, 'tenantId'>) {
    try {
      if (!tenantId) throw new Error("tenantId is required");
      const normalizedData = {
        ...data,
        name: data.name?.trim() || "Unknown Patient",
        phone: data.phone?.trim() || "-",
        email: data.email?.trim() || null,
      };
      const result = await patientRepository.create(tenantId, normalizedData);
      return this.mapSafePatient(result);
    } catch (error) {
      console.error("[PatientService.createPatient] Error:", error);
      return this.getSafeFallback();
    }
  }

  async updatePatient(tenantId: string, id: string, data: Prisma.PatientUpdateInput) {
    try {
      if (!tenantId || !id) throw new Error("tenantId and id are required");
      const normalizedData = { ...data };
      if (typeof data.name === 'string') normalizedData.name = data.name.trim();
      if (typeof data.phone === 'string') normalizedData.phone = data.phone.trim();
      if (typeof data.email === 'string') normalizedData.email = data.email.trim() || null;

      const result = await patientRepository.update(tenantId, id, normalizedData);
      return this.mapSafePatient(result);
    } catch (error) {
      console.error(`[PatientService.updatePatient] Error updating patient ${id}:`, error);
      return this.getSafeFallback(id);
    }
  }

  async deletePatient(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.delete(tenantId, id);
    } catch (error) {
      console.error(`[PatientService.deletePatient] Error deleting patient ${id}:`, error);
      return false;
    }
  }

  async getPatientProfile(tenantId: string, id: string) {
    try {
      if (!id || !tenantId) return this.getSafeFallback();

      const data = await this.getPatientById(tenantId, id);
      
      const dobDate = data.dob ? new Date(data.dob) : null;
      const age = dobDate ? Math.floor((new Date().getTime() - dobDate.getTime()) / 31557600000) : null
      
      const appointments = data.appointments || []
      const pastAppts = appointments
        .filter((a: any) => a.date && new Date(a.date) < new Date() && a.status === 'Completed')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const futureAppts = appointments
        .filter((a: any) => a.date && new Date(a.date) > new Date() && a.status !== 'Cancelled')
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const invoices = data.invoices || []
      const totalOutstanding = invoices.reduce((sum: number, inv: any) => {
        const totalPaid = Number(inv.paidAmount || 0);
        return sum + (Number(inv.totalAmount) - totalPaid)
      }, 0)

      const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      const name = this.normalizeString(data.name, "Unknown Patient");
      const avatar = data.avatarInitials || getInitials(name)

      const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-indigo-500 to-violet-500',
        'from-rose-500 to-red-500'
      ];
      const colorIndex = (name || '').length % colors.length;

      const visitHistory = [
        ...(data.visitRecords || []).map((vr: any) => ({
          id: vr.id,
          date: vr.date ? new Date(vr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          time: '',
          status: 'Completed',
          treatment: vr.treatment,
          doctor: vr.doctor,
          notes: vr.notes || '',
          tooth: vr.tooth || '',
          isClinicalRecord: true
        })),
        ...appointments.map((a: any) => ({
          id: a.id,
          date: a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          time: a.time || '—',
          status: a.status,
          treatment: a.treatment || '—',
          notes: a.notes || "No notes",
          isClinicalRecord: false
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const result = {
        id: data.id,
        displayId: data.displayId || "P-0000",
        name: name,
        phone: this.normalizeString(data.phone, "—"),
        phone2: this.normalizeString(data.phone2, "—"),
        email: this.normalizeString(data.email, "—"),
        dob: dobDate ? `${dobDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${age} years)` : '—',
        address: this.normalizeString(data.address, "—"),
        city: this.normalizeString(data.city, "—"),
        postCode: this.normalizeString(data.postCode, "—"),
        maritalStatus: this.normalizeString(data.maritalStatus, "—"),
        occupation: this.normalizeString(data.occupation, "—"),
        insurance: this.normalizeString(data.insurance, "—"),
        ssn: this.normalizeString(data.ssn, "—"),
        idNumber: this.normalizeString(data.idNumber, "—"),
        medicalAlert: this.normalizeString(data.medicalAlert, "None"),
        referredBy: this.normalizeString(data.referredBy, "Direct"),
        notes: this.normalizeString(data.notes, "No notes"),
        isDeceased: !!data.isDeceased,
        isSigned: !!data.isSigned,
        lastVisit: pastAppts.length > 0 ? new Date(pastAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        nextAppt: futureAppts.length > 0 ? new Date(futureAppts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        status: data.status || 'Active',
        avatar,
        color: data.colorGradient || colors[colorIndex],
        registeredSince: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
        outstanding: totalOutstanding,
        bloodGroup: data.bloodGroup || '',
        smokingStatus: data.smokingStatus || 'Never',
        alcoholUse: data.alcoholUse || 'None',
        generalMedicalNotes: data.medicalNotes || '',
        allergies: (data.patientAllergies || []).map((a: any) => ({ ...a })),
        conditions: (data.medicalConditions || []).map((c: any) => ({ ...c })),
        medications: (data.patientMedications || []).map((m: any) => ({ ...m })),
        surgeries: (data.patientSurgeries || []).map((s: any) => ({ ...s })),
        familyHistory: (data.patientFamilyHistory || []).map((fh: any) => ({ ...fh })),
        oralTissueFindings: (data.oralTissueFindings || []).map((ot: any) => ({ ...ot })),
        toothConditions: (data.toothConditions || []).map((tc: any) => ({ ...tc })),
        periodontalMeasurements: (data.periodontalMeasurements || []).map((pm: any) => ({ ...pm })),
        oralConditions: (data.oralConditions || []).map((oc: any) => ({ ...oc })),
        visitHistory,
        invoiceHistory: (invoices || []).map((i: any) => {
          const paidAmount = Number(i.paidAmount || 0)
          const totalAmount = Number(i.totalAmount || 0)
          return {
            id: i.id,
            displayId: i.displayId || `INV-${i.id.slice(0, 8).toUpperCase()}`,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: totalAmount - paidAmount,
            status: i.status,
            dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
            createdAt: i.createdAt,
            items: (i.items || []).map((item: any) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              price: Number(item.price),
              createdAt: item.createdAt
            })),
            payments: (i.payments || []).map((p: any) => ({
              id: p.id,
              amount: Number(p.amount),
              paidAt: p.paidAt,
              method: p.method,
              createdAt: p.createdAt
            }))
          }
        }),
        patient_documents: (data.patientDocuments || []).map((doc: any) => ({ ...doc })),
        prescriptions: (data.prescriptions || []).map((rx: any) => ({
          ...rx,
          items: (rx.items || []).map((item: any) => ({ ...item }))
        }))
      };

      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error('[PatientService.getPatientProfile] Error:', error);
      return this.getSafeFallback(id);
    }
  }

  // Sub-module methods
  async updateOralCondition(tenantId: string, patientId: string, name: string, active: boolean) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.upsertOralCondition(tenantId, patientId, name, active);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.updateOralCondition] Error:", error);
      return null;
    }
  }

  async updateOralTissue(tenantId: string, patientId: string, name: string, status: string, notes: string) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.upsertOralTissue(tenantId, patientId, name, status, notes);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.updateOralTissue] Error:", error);
      return null;
    }
  }

  async addVisitRecord(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createVisitRecord(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addVisitRecord] Error:", error);
      return null;
    }
  }

  async deleteVisitRecord(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteVisitRecord(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteVisitRecord] Error:", error);
      return false;
    }
  }

  async updateToothCondition(tenantId: string, patientId: string, toothNumber: number, condition: string, isMissing: boolean, notes: string) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.upsertToothCondition(tenantId, patientId, toothNumber, condition, isMissing, notes);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.updateToothCondition] Error:", error);
      return null;
    }
  }

  async updatePeriodontalMeasurement(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createPeriodontalMeasurement(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.updatePeriodontalMeasurement] Error:", error);
      return null;
    }
  }

  async clearPeriodontalMeasurements(tenantId: string, patientId: string) {
    try {
      if (!tenantId || !patientId) return false;
      return await patientRepository.deleteAllPeriodontalMeasurements(tenantId, patientId);
    } catch (error) {
      console.error("[PatientService.clearPeriodontalMeasurements] Error:", error);
      return false;
    }
  }

  async addMedicalCondition(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createMedicalCondition(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addMedicalCondition] Error:", error);
      return null;
    }
  }

  async deleteMedicalCondition(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteMedicalCondition(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteMedicalCondition] Error:", error);
      return false;
    }
  }

  async addAllergy(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createAllergy(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addAllergy] Error:", error);
      return null;
    }
  }

  async deleteAllergy(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteAllergy(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteAllergy] Error:", error);
      return false;
    }
  }

  async addMedication(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createMedication(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addMedication] Error:", error);
      return null;
    }
  }

  async deleteMedication(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteMedication(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteMedication] Error:", error);
      return false;
    }
  }

  async addSurgery(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createSurgery(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addSurgery] Error:", error);
      return null;
    }
  }

  async deleteSurgery(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteSurgery(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteSurgery] Error:", error);
      return false;
    }
  }

  async addFamilyHistory(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createFamilyHistory(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addFamilyHistory] Error:", error);
      return null;
    }
  }

  async deleteFamilyHistory(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteFamilyHistory(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteFamilyHistory] Error:", error);
      return false;
    }
  }

  async addPrescription(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createPrescription(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addPrescription] Error:", error);
      return null;
    }
  }

  async deletePrescription(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deletePrescription(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deletePrescription] Error:", error);
      return false;
    }
  }

  async addDocument(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createDocument(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addDocument] Error:", error);
      return null;
    }
  }

  async deleteDocument(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteDocument(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteDocument] Error:", error);
      return false;
    }
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    try {
      if (!tenantId || !id) return null;
      const result = await patientRepository.updateInvoice(tenantId, id, { status });
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.updateInvoiceStatus] Error:", error);
      return null;
    }
  }

  async createInvoice(tenantId: string, patientId: string, data: any) {
    try {
      if (!tenantId || !patientId) return null;
      const result = await patientRepository.createInvoice(tenantId, patientId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.createInvoice] Error:", error);
      return null;
    }
  }

  async addPayment(tenantId: string, invoiceId: string, data: any) {
    try {
      if (!tenantId || !invoiceId) return null;
      const result = await patientRepository.addPayment(tenantId, invoiceId, data);
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[PatientService.addPayment] Error:", error);
      return null;
    }
  }

  async deleteInvoice(tenantId: string, id: string) {
    try {
      if (!tenantId || !id) return false;
      return await patientRepository.deleteInvoice(tenantId, id);
    } catch (error) {
      console.error("[PatientService.deleteInvoice] Error:", error);
      return false;
    }
  }
}

