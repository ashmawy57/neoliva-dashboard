import "server-only";
import { PatientRepository } from "@/repositories/patient.repository";
import { Patient, Prisma } from "@prisma/client";

const patientRepository = new PatientRepository();

export class PatientService {
  async getAllPatients(tenantId: string) {
    return patientRepository.findMany(tenantId, {
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
          include: {
            payments: {
              select: {
                amount: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async getPatientsList(tenantId: string) {
    const data = await this.getAllPatients(tenantId);
    
    return data.map((patient: any) => {
      const appts = patient.appointments || []
      const nextAppt = appts
        .filter((a: any) => a.date && new Date(a.date) > new Date() && a.status !== 'Cancelled')
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

      const lastVisit = appts
        .filter((a: any) => a.date && new Date(a.date) < new Date() && a.status === 'Completed')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      // Helper for initials
      const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      return {
        id: patient.id,
        displayId: patient.displayId,
        name: patient.name,
        email: patient.email || '—',
        phone: patient.phone || '—',
        gender: patient.gender,
        lastVisit: lastVisit ? new Date(lastVisit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits',
        nextAppt: nextAppt ? new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
        status: patient.status || 'Active',
        visits: appts.filter((a: any) => a.status === 'Completed').length,
        avatar: patient.avatarInitials || getInitials(patient.name),
        color: patient.colorGradient || 'from-blue-500 to-indigo-600',
        registeredSince: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
        outstanding: (patient.invoices || [])
          .reduce((sum: number, i: any) => {
            const paid = Number(i.paidAmount || 0);
            return sum + (Number(i.amount) - paid);
          }, 0)
      }
    });
  }

  async getPatientById(tenantId: string, id: string) {
    // Split into two parallel queries to avoid connection timeout
    // Query 1: Core demographics + scheduling + billing
    // Query 2: All clinical records
    const [core, clinical] = await Promise.all([
      patientRepository.findById(tenantId, id, {
        appointments: true,
        invoices: {
          include: {
            items: true,
            payments: true
          },
          orderBy: { createdAt: 'desc' }
        },
        visitRecords: true,
        patientDocuments: true,
      }),
      patientRepository.findById(tenantId, id, {
        patientAllergies: true,
        medicalConditions: true,
        patientMedications: true,
        patientSurgeries: true,
        patientFamilyHistory: true,
        oralTissueFindings: true,
        toothConditions: true,
        periodontalMeasurements: true,
        prescriptions: {
          include: {
            items: true
          }
        },
        oralConditions: true,
      }),
    ]);

    if (!core) return null;

    // Merge results carefully:
    // 1. Start with core fields (scalars like name, id, etc.)
    // 2. Add clinical fields if they exist
    // 3. Ensure relational arrays are defaulted to empty arrays to prevent frontend crashes
    return {
      ...clinical, // Relations like oralTissueFindings, etc.
      ...core,     // Core scalars and other relations like appointments
      
      // Explicitly ensure clinical relations are preserved and defaulted
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
      
      // Ensure core relations are preserved and defaulted
      appointments: core?.appointments ?? [],
      invoices: core?.invoices ?? [],
      visitRecords: core?.visitRecords ?? [],
      patientDocuments: core?.patientDocuments ?? [],
    };
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

  async getPatientProfile(tenantId: string, id: string) {
    if (!id) return null;

    try {
      const data = await this.getPatientById(tenantId, id);
      if (!data) return null;

      const age = data.dob ? Math.floor((new Date().getTime() - new Date(data.dob).getTime()) / 31557600000) : null
      
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
        return sum + (Number(inv.amount) - totalPaid)
      }, 0)

      // Helper for initials
      const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      const avatar = data.avatarInitials || getInitials(data.name)

      const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-indigo-500 to-violet-500',
        'from-rose-500 to-red-500'
      ];
      const colorIndex = (data.name || '').length % colors.length;

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
        displayId: data.displayId,
        name: data.name,
        phone: data.phone || '—',
        phone2: data.phone2 || '—',
        email: data.email || '—',
        dob: data.dob ? `${new Date(data.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${age} years)` : '—',
        address: data.address || '—',
        city: data.city || '—',
        postCode: data.postCode || '—',
        maritalStatus: data.maritalStatus || '—',
        occupation: data.occupation || '—',
        insurance: data.insurance || '—',
        ssn: data.ssn || '—',
        idNumber: data.idNumber || '—',
        medicalAlert: data.medicalAlert || 'None',
        referredBy: data.referredBy || 'Direct',
        notes: data.notes || 'No notes',
        isDeceased: data.isDeceased || false,
        isSigned: data.isSigned || false,
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
        invoiceHistory: invoices.map((i: any) => {
          const paidAmount = Number(i.paidAmount || 0)
          return {
            id: i.id,
            displayId: i.displayId,
            amount: Number(i.amount),
            paidAmount: Number(paidAmount),
            remainingAmount: Number(i.amount) - Number(paidAmount),
            status: i.status,
            dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
            treatment: i.treatment || '—',
            date: i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
            items: (i.items || []).map((item: any) => ({
              id: item.id,
              name: item.name,
              amount: Number(item.amount),
              createdAt: item.createdAt
            })),
            payments: (i.payments || []).map((p: any) => ({
              id: p.id,
              amount: Number(p.amount),
              date: p.date,
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

      // CRITICAL: Final serialization pass to ensure 100% plain object compatibility with Client Components.
      // This strips any hidden Prisma symbols, internal properties, or remaining Decimal objects.
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return null;
    }
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

  async updateToothCondition(tenantId: string, patientId: string, toothNumber: number, condition: string, isMissing: boolean, notes: string) {
    return patientRepository.upsertToothCondition(tenantId, patientId, toothNumber, condition, isMissing, notes);
  }

  async updatePeriodontalMeasurement(tenantId: string, patientId: string, data: any) {
    return patientRepository.createPeriodontalMeasurement(tenantId, patientId, data);
  }

  async clearPeriodontalMeasurements(tenantId: string, patientId: string) {
    return patientRepository.deleteAllPeriodontalMeasurements(tenantId, patientId);
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

  async deleteDocument(tenantId: string, id: string) {
    return patientRepository.deleteDocument(tenantId, id);
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    return patientRepository.updateInvoice(tenantId, id, { status });
  }

  async createInvoice(tenantId: string, patientId: string, data: any) {
    return patientRepository.createInvoice(tenantId, patientId, data);
  }

  async addPayment(tenantId: string, invoiceId: string, data: any) {
    return patientRepository.addPayment(tenantId, invoiceId, data);
  }

  async deleteInvoice(tenantId: string, id: string) {
    return patientRepository.deleteInvoice(tenantId, id);
  }
}

