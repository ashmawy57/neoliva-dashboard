-- SQL to enable RLS and enforce tenant isolation
-- This script assumes the "users" table exists and maps supabase_id to tenant_id

-- 1. Helper function to get current tenant from user mapping
CREATE OR REPLACE FUNCTION get_current_tenant_id() 
RETURNS uuid AS $$
  SELECT tenant_id FROM public.users WHERE supabase_id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. List of tables to protect and apply policies
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('_prisma_migrations', 'tenants', 'users') -- tenants and users have special policies
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON public.%I', t);
        EXECUTE format('CREATE POLICY tenant_isolation_policy ON public.%I USING (tenant_id = get_current_tenant_id())', t);
    END LOOP;
END $$;

-- 3. Special Policies for Tenants and Users tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_view_self ON public.tenants
  FOR SELECT USING (id = get_current_tenant_id());

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_view_self ON public.users
  FOR SELECT USING (supabase_id = auth.uid()::text);

-- 4. Force RLS for all tables (even for bypassrls roles if needed, though usually not recommended for Prisma)
-- ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;
