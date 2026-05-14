import { z } from 'zod';

export const PatientCreatedSchema = z.object({
  name: z.string(),
  displayId: z.string(),
  referredBy: z.string().nullable().optional(),
  insurance: z.string().nullable().optional(),
});

export const PatientUpdatedSchema = z.object({
  fields: z.array(z.string()),
});

export const ClinicalActionSchema = z.object({
  condition: z.string().optional(),
  allergen: z.string().optional(),
  medication: z.string().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  dosage: z.string().optional(),
});

export const SurgeryActionSchema = z.object({
  surgery: z.string(),
  date: z.date().or(z.string()).optional(),
});

export const FamilyHistoryActionSchema = z.object({
  condition: z.string(),
  relation: z.string().optional(),
});

export const AppointmentScheduledSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  serviceId: z.string(),
  date: z.date().or(z.string()),
});

export const InvoiceCreatedSchema = z.object({
  patientId: z.string(),
  amount: z.number(),
  appointmentId: z.string().optional(),
});

export const StaffActionSchema = z.object({
  role: z.string().optional(),
  newRole: z.string().optional(),
  invited: z.boolean().optional(),
});

export const TreatmentPlanActionSchema = z.object({
  patientId: z.string(),
  title: z.string().optional(),
  status: z.string().optional(),
});

export const ExpenseActionSchema = z.object({
  title: z.string().optional(),
  amount: z.number().optional(),
  category: z.string().optional(),
});

export const ClinicalNoteSchema = z.object({
  doctor: z.string().optional(),
  treatment: z.string().optional(),
});

export const DocumentUploadSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  toothNumber: z.number().optional(),
});

export const PatientChartUpdateSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
  active: z.boolean().optional(),
  tissue: z.string().optional(),
  status: z.string().optional(),
  toothNumber: z.number().optional(),
  condition: z.string().optional(),
});

export const PrescriptionActionSchema = z.object({
  doctorName: z.string(),
  itemCount: z.number(),
});

export const NotificationPreferenceSchema = z.object({
  type: z.string(),
  channel: z.string(),
  enabled: z.boolean(),
});

export const NotificationActionSchema = z.object({
  notificationId: z.string().optional(),
  count: z.number().optional(),
});

export const InvoiceActionSchema = z.object({
  patientId: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
  method: z.string().optional(),
});

export const SystemAlertSchema = z.object({
  alertType: z.string(),
  message: z.string(),
  originalEventId: z.string().optional(),
});

export const PatientNoShowSchema = z.object({
  originalStartTime: z.date().or(z.string()),
  detectedAt: z.string(),
});

export const InvoiceOverdueSchema = z.object({
  dueDate: z.date().or(z.string()).nullable(),
  amount: z.number().or(z.any()), // Prisma Decimal
  detectedAt: z.string(),
});

export const TreatmentDelayedSchema = z.object({
  itemId: z.string(),
  serviceName: z.string(),
  scheduledDate: z.date().or(z.string()),
  detectedAt: z.string(),
});

export const EventMetadataSchemas: Record<string, z.ZodSchema> = {
  PATIENT_CREATED: PatientCreatedSchema,
  PATIENT_UPDATED: PatientUpdatedSchema,
  MEDICAL_CONDITION_ADDED: ClinicalActionSchema,
  ALLERGY_ADDED: ClinicalActionSchema,
  MEDICATION_ADDED: ClinicalActionSchema,
  SURGERY_ADDED: SurgeryActionSchema,
  FAMILY_HISTORY_ADDED: FamilyHistoryActionSchema,
  APPOINTMENT_SCHEDULED: AppointmentScheduledSchema,
  INVOICE_CREATED: InvoiceCreatedSchema,
  INVOICE_PAID: InvoiceActionSchema,
  INVOICE_STATUS_UPDATE: InvoiceActionSchema,
  STAFF_INVITED: StaffActionSchema,
  STAFF_ROLE_CHANGED: StaffActionSchema,
  STAFF_DELETED: StaffActionSchema,
  TREATMENT_PLAN_CREATED: TreatmentPlanActionSchema,
  TREATMENT_PLAN_DELETED: TreatmentPlanActionSchema,
  TREATMENT_PLAN_STATUS_CHANGED: TreatmentPlanActionSchema,
  EXPENSE_CREATED: ExpenseActionSchema,
  EXPENSE_UPDATED: ExpenseActionSchema,
  CLINICAL_NOTE_ADDED: ClinicalNoteSchema,
  DOCUMENT_UPLOADED: DocumentUploadSchema,
  PATIENT_CHART_UPDATED: PatientChartUpdateSchema,
  PRESCRIPTION_CREATED: PrescriptionActionSchema,
  NOTIFICATION_PREFERENCE_UPDATED: NotificationPreferenceSchema,
  NOTIFICATION_READ: NotificationActionSchema,
  NOTIFICATIONS_ARCHIVED: NotificationActionSchema,
  SYSTEM_ALERT: SystemAlertSchema,
  PATIENT_NO_SHOW: PatientNoShowSchema,
  INVOICE_OVERDUE: InvoiceOverdueSchema,
  TREATMENT_DELAYED: TreatmentDelayedSchema,
  SECURITY_DENIED: z.object({
    attemptedPermission: z.string(),
    userEmail: z.string(),
    userRole: z.string(),
  }),
};
