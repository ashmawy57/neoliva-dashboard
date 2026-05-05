-- AlterEnum
BEGIN;
CREATE TYPE "appointment_status_new" AS ENUM ('SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "appointment_status_new" USING ("status"::text::"appointment_status_new");
ALTER TYPE "appointment_status" RENAME TO "appointment_status_old";
ALTER TYPE "appointment_status_new" RENAME TO "appointment_status";
DROP TYPE "public"."appointment_status_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "expense_status_new" AS ENUM ('PAID', 'PENDING');
ALTER TABLE "public"."expenses" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "expenses" ALTER COLUMN "status" TYPE "expense_status_new" USING ("status"::text::"expense_status_new");
ALTER TYPE "expense_status" RENAME TO "expense_status_old";
ALTER TYPE "expense_status_new" RENAME TO "expense_status";
DROP TYPE "public"."expense_status_old";
ALTER TABLE "expenses" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "invoice_status_new" AS ENUM ('PAID', 'PENDING', 'OVERDUE');
ALTER TABLE "public"."invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "invoice_status_new" USING ("status"::text::"invoice_status_new");
ALTER TYPE "invoice_status" RENAME TO "invoice_status_old";
ALTER TYPE "invoice_status_new" RENAME TO "invoice_status";
DROP TYPE "public"."invoice_status_old";
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "lab_order_status_new" AS ENUM ('SENT', 'IN_PROGRESS', 'RECEIVED', 'DELIVERED');
ALTER TABLE "public"."lab_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "lab_orders" ALTER COLUMN "status" TYPE "lab_order_status_new" USING ("status"::text::"lab_order_status_new");
ALTER TYPE "lab_order_status" RENAME TO "lab_order_status_old";
ALTER TYPE "lab_order_status_new" RENAME TO "lab_order_status";
DROP TYPE "public"."lab_order_status_old";
ALTER TABLE "lab_orders" ALTER COLUMN "status" SET DEFAULT 'SENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Diagnosis" DROP CONSTRAINT "Diagnosis_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_patientId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "LabOrder" DROP CONSTRAINT "LabOrder_patientId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalCondition" DROP CONSTRAINT "MedicalCondition_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Medication" DROP CONSTRAINT "Medication_patientId_fkey";

-- DropForeignKey
ALTER TABLE "OralCondition" DROP CONSTRAINT "OralCondition_patientId_fkey";

-- DropForeignKey
ALTER TABLE "OralTissueFinding" DROP CONSTRAINT "OralTissueFinding_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientAllergy" DROP CONSTRAINT "PatientAllergy_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientDocument" DROP CONSTRAINT "PatientDocument_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PrescriptionItem" DROP CONSTRAINT "PrescriptionItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ToothCondition" DROP CONSTRAINT "ToothCondition_patientId_fkey";

-- DropForeignKey
ALTER TABLE "ToothSurface" DROP CONSTRAINT "ToothSurface_patientId_fkey";

-- DropForeignKey
ALTER TABLE "TreatmentPlan" DROP CONSTRAINT "TreatmentPlan_patientId_fkey";

-- DropForeignKey
ALTER TABLE "TreatmentPlanItem" DROP CONSTRAINT "TreatmentPlanItem_planId_fkey";

-- DropForeignKey
ALTER TABLE "VisitRecord" DROP CONSTRAINT "VisitRecord_patientId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_service_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "lab_orders" DROP CONSTRAINT "lab_orders_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_conditions" DROP CONSTRAINT "medical_conditions_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "oral_conditions" DROP CONSTRAINT "oral_conditions_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "oral_tissue_findings" DROP CONSTRAINT "oral_tissue_findings_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_allergies" DROP CONSTRAINT "patient_allergies_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_documents" DROP CONSTRAINT "patient_documents_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_family_history" DROP CONSTRAINT "patient_family_history_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_medications" DROP CONSTRAINT "patient_medications_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_surgeries" DROP CONSTRAINT "patient_surgeries_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "periodontal_measurements" DROP CONSTRAINT "periodontal_measurements_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "prescription_items" DROP CONSTRAINT "prescription_items_prescription_id_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "tooth_conditions" DROP CONSTRAINT "tooth_conditions_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "treatment_plan_items" DROP CONSTRAINT "treatment_plan_items_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "treatment_plan_items" DROP CONSTRAINT "treatment_plan_items_service_id_fkey";

-- DropForeignKey
ALTER TABLE "treatment_plans" DROP CONSTRAINT "treatment_plans_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "visit_records" DROP CONSTRAINT "visit_records_patient_id_fkey";

-- DropIndex
DROP INDEX "oral_conditions_patient_id_name_key";

-- DropIndex
DROP INDEX "unique_patient_tissue";

-- DropIndex
DROP INDEX "idx_periodontal_measurements_patient_id";

-- DropIndex
DROP INDEX "unique_periodontal_measurement";

-- DropIndex
DROP INDEX "unique_patient_tooth_condition";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED',
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "treatment" SET DATA TYPE TEXT,
ALTER COLUMN "color" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "unit" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "due_date" DATE,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "method" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "lab_orders" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "lab_name" SET DATA TYPE TEXT,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL,
ALTER COLUMN "status" SET DEFAULT 'SENT';

-- AlterTable
ALTER TABLE "medical_conditions" DROP COLUMN "name",
ADD COLUMN     "condition_name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "oral_conditions" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "oral_tissue_findings" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "patient_allergies" DROP COLUMN "name",
ADD COLUMN     "allergen" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reaction" TEXT,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "patient_documents" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "patient_family_history" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "condition_name" SET DATA TYPE TEXT,
ALTER COLUMN "relation" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "patient_medications" DROP COLUMN "name",
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "medication_name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "patient_surgeries" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "surgery_name" SET DATA TYPE TEXT,
DROP COLUMN "surgery_date",
ADD COLUMN     "surgery_date" DATE;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "gender" SET DATA TYPE TEXT,
ALTER COLUMN "blood_group" SET DATA TYPE TEXT,
ALTER COLUMN "color_gradient" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "smoking_status" SET DATA TYPE TEXT,
ALTER COLUMN "alcohol_use" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "periodontal_measurements" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "buccal_values" DROP DEFAULT,
ALTER COLUMN "lingual_values" DROP DEFAULT,
ALTER COLUMN "measurement_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "prescription_items" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "medication_name" SET DATA TYPE TEXT,
ALTER COLUMN "dosage" SET DATA TYPE TEXT,
ALTER COLUMN "frequency" SET DATA TYPE TEXT,
ALTER COLUMN "duration" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL,
ALTER COLUMN "duration_minutes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "display_id" DROP NOT NULL,
ALTER COLUMN "display_id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tooth_conditions" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "treatment_plan_items" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "service_name" SET DATA TYPE TEXT,
ALTER COLUMN "tooth_list" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL,
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "treatment_plans" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "visit_records" ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "date" DROP DEFAULT;

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "ClinicSettings";

-- DropTable
DROP TABLE "Diagnosis";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "InvoiceItem";

-- DropTable
DROP TABLE "LabOrder";

-- DropTable
DROP TABLE "MedicalCondition";

-- DropTable
DROP TABLE "Medication";

-- DropTable
DROP TABLE "OralCondition";

-- DropTable
DROP TABLE "OralTissueFinding";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "PatientAllergy";

-- DropTable
DROP TABLE "PatientDocument";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Prescription";

-- DropTable
DROP TABLE "PrescriptionItem";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "ToothCondition";

-- DropTable
DROP TABLE "ToothSurface";

-- DropTable
DROP TABLE "TreatmentPlan";

-- DropTable
DROP TABLE "TreatmentPlanItem";

-- DropTable
DROP TABLE "VisitRecord";

-- DropEnum
DROP TYPE "StaffRole";

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_created_at_idx" ON "tenants"("created_at");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_id_idx" ON "appointments"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_patient_id_idx" ON "appointments"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_created_at_idx" ON "appointments"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "expenses_tenant_id_id_idx" ON "expenses"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "expenses_tenant_id_created_at_idx" ON "expenses"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "inventory_tenant_id_id_idx" ON "inventory"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "inventory_tenant_id_created_at_idx" ON "inventory"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_id_idx" ON "invoices"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_patient_id_idx" ON "invoices"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_created_at_idx" ON "invoices"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "lab_orders_tenant_id_id_idx" ON "lab_orders"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "lab_orders_tenant_id_patient_id_idx" ON "lab_orders"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "lab_orders_tenant_id_created_at_idx" ON "lab_orders"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_conditions_tenant_id_id_idx" ON "medical_conditions"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "medical_conditions_tenant_id_patient_id_idx" ON "medical_conditions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "medical_conditions_tenant_id_created_at_idx" ON "medical_conditions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "oral_conditions_tenant_id_id_idx" ON "oral_conditions"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "oral_conditions_tenant_id_patient_id_idx" ON "oral_conditions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "oral_conditions_tenant_id_created_at_idx" ON "oral_conditions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "oral_tissue_findings_tenant_id_id_idx" ON "oral_tissue_findings"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "oral_tissue_findings_tenant_id_patient_id_idx" ON "oral_tissue_findings"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "oral_tissue_findings_tenant_id_created_at_idx" ON "oral_tissue_findings"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "patient_allergies_tenant_id_id_idx" ON "patient_allergies"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patient_allergies_tenant_id_patient_id_idx" ON "patient_allergies"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_allergies_tenant_id_created_at_idx" ON "patient_allergies"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "patient_documents_tenant_id_id_idx" ON "patient_documents"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patient_documents_tenant_id_patient_id_idx" ON "patient_documents"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_documents_tenant_id_upload_date_idx" ON "patient_documents"("tenant_id", "upload_date");

-- CreateIndex
CREATE INDEX "patient_family_history_tenant_id_id_idx" ON "patient_family_history"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patient_family_history_tenant_id_patient_id_idx" ON "patient_family_history"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_family_history_tenant_id_created_at_idx" ON "patient_family_history"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "patient_medications_tenant_id_id_idx" ON "patient_medications"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patient_medications_tenant_id_patient_id_idx" ON "patient_medications"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_medications_tenant_id_created_at_idx" ON "patient_medications"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "patient_surgeries_tenant_id_id_idx" ON "patient_surgeries"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patient_surgeries_tenant_id_patient_id_idx" ON "patient_surgeries"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_surgeries_tenant_id_created_at_idx" ON "patient_surgeries"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "patients_tenant_id_id_idx" ON "patients"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "patients_tenant_id_created_at_idx" ON "patients"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "periodontal_measurements_tenant_id_id_idx" ON "periodontal_measurements"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "periodontal_measurements_tenant_id_patient_id_idx" ON "periodontal_measurements"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "periodontal_measurements_tenant_id_created_at_idx" ON "periodontal_measurements"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "prescription_items_tenant_id_id_idx" ON "prescription_items"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "prescription_items_tenant_id_created_at_idx" ON "prescription_items"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_id_idx" ON "prescriptions"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_patient_id_idx" ON "prescriptions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_created_at_idx" ON "prescriptions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "services_tenant_id_id_idx" ON "services"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "services_tenant_id_created_at_idx" ON "services"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "staff_tenant_id_id_idx" ON "staff"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "staff_tenant_id_created_at_idx" ON "staff"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "tooth_conditions_tenant_id_id_idx" ON "tooth_conditions"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "tooth_conditions_tenant_id_patient_id_idx" ON "tooth_conditions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "tooth_conditions_tenant_id_created_at_idx" ON "tooth_conditions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "treatment_plan_items_tenant_id_id_idx" ON "treatment_plan_items"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "treatment_plan_items_tenant_id_created_at_idx" ON "treatment_plan_items"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "treatment_plans_tenant_id_id_idx" ON "treatment_plans"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "treatment_plans_tenant_id_patient_id_idx" ON "treatment_plans"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "treatment_plans_tenant_id_created_at_idx" ON "treatment_plans"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "visit_records_tenant_id_id_idx" ON "visit_records"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "visit_records_tenant_id_patient_id_idx" ON "visit_records"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "visit_records_tenant_id_created_at_idx" ON "visit_records"("tenant_id", "created_at");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "treatment_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_conditions" ADD CONSTRAINT "medical_conditions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_conditions" ADD CONSTRAINT "medical_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tooth_conditions" ADD CONSTRAINT "tooth_conditions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tooth_conditions" ADD CONSTRAINT "tooth_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oral_conditions" ADD CONSTRAINT "oral_conditions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oral_conditions" ADD CONSTRAINT "oral_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oral_tissue_findings" ADD CONSTRAINT "oral_tissue_findings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oral_tissue_findings" ADD CONSTRAINT "oral_tissue_findings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "periodontal_measurements" ADD CONSTRAINT "periodontal_measurements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodontal_measurements" ADD CONSTRAINT "periodontal_measurements_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_surgeries" ADD CONSTRAINT "patient_surgeries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_surgeries" ADD CONSTRAINT "patient_surgeries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_family_history" ADD CONSTRAINT "patient_family_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_family_history" ADD CONSTRAINT "patient_family_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
