-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "refresh_token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_fingerprint" TEXT,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_used_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supabase_refresh_token" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_idx" ON "sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_hash_idx" ON "sessions"("refresh_token_hash");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
