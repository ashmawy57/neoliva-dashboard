-- Enable pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "clinic_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "staff_id" UUID,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clinic_memberships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "clinic_memberships_role_check" CHECK (role IN ('clinic_owner', 'clinic_admin', 'dentist', 'receptionist', 'accountant', 'viewer'))
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    "invited_by" UUID,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey";
ALTER TABLE "payments" DROP CONSTRAINT "payments_patient_id_fkey";

-- DropIndex
DROP INDEX "payments_tenant_id_patient_id_idx";

-- AlterTable for invoice_items
ALTER TABLE "invoice_items" DROP COLUMN "price",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL;

-- AlterTable for payments
ALTER TABLE "payments" DROP COLUMN "patient_id",
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "invoice_id" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "clinic_memberships_tenant_id_idx" ON "clinic_memberships"("tenant_id");
CREATE INDEX "clinic_memberships_user_id_idx" ON "clinic_memberships"("user_id");
CREATE INDEX "clinic_memberships_tenant_id_is_active_idx" ON "clinic_memberships"("tenant_id", "is_active");
CREATE UNIQUE INDEX "clinic_memberships_tenant_id_user_id_key" ON "clinic_memberships"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");
CREATE INDEX "invitations_token_idx" ON "invitations"("token");
CREATE INDEX "invitations_tenant_id_email_idx" ON "invitations"("tenant_id", "email");
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex for payments
CREATE INDEX "payments_tenant_id_paid_at_idx" ON "payments"("tenant_id", "paid_at");

-- Create Partial Unique Index for invitations
CREATE UNIQUE INDEX invitations_tenant_email_pending ON invitations(tenant_id, email) WHERE accepted_at IS NULL;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
