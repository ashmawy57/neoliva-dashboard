-- 🛡️ Harden RLS Policies for Multi-Tenant Isolation
-- This migration replaces insecure "Allow All" policies with strict tenant-scoped ones.

-- 1. Helper function to get current tenant ID from auth session
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE supabase_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Secure PATIENTS
DROP POLICY IF EXISTS "Enable all access for all users" ON public.patients;
CREATE POLICY "Tenant isolation for patients" ON public.patients
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 3. Secure STAFF
DROP POLICY IF EXISTS "Enable all access for all users" ON public.staff;
CREATE POLICY "Tenant isolation for staff" ON public.staff
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 4. Secure APPOINTMENTS
DROP POLICY IF EXISTS "Enable all access for all users" ON public.appointments;
CREATE POLICY "Tenant isolation for appointments" ON public.appointments
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 5. Secure SERVICES
DROP POLICY IF EXISTS "Enable all access for all users" ON public.services;
CREATE POLICY "Tenant isolation for services" ON public.services
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 6. Secure INVOICES
DROP POLICY IF EXISTS "Enable all access for all users" ON public.invoices;
CREATE POLICY "Tenant isolation for invoices" ON public.invoices
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 7. Secure EXPENSES
DROP POLICY IF EXISTS "Enable all access for all users" ON public.expenses;
CREATE POLICY "Tenant isolation for expenses" ON public.expenses
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 8. Secure INVENTORY
DROP POLICY IF EXISTS "Enable all access for all users" ON public.inventory;
CREATE POLICY "Tenant isolation for inventory" ON public.inventory
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 9. Secure LAB ORDERS
DROP POLICY IF EXISTS "Enable all access for all users" ON public.lab_orders;
CREATE POLICY "Tenant isolation for lab_orders" ON public.lab_orders
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 10. Secure INVENTORY_ITEMS & STOCK_ENTRIES
ALTER TABLE IF EXISTS public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.inventory_items;
CREATE POLICY "Tenant isolation for inventory_items" ON public.inventory_items
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Enable all access for all users" ON public.stock_entries;
CREATE POLICY "Tenant isolation for stock_entries" ON public.stock_entries
FOR ALL TO authenticated
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

-- 11. Secure USERS Table
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;
CREATE POLICY "Users can see their own record and tenant peers" ON public.users
FOR SELECT TO authenticated
USING (
  supabase_id = auth.uid() OR 
  tenant_id = (SELECT tenant_id FROM public.users WHERE supabase_id = auth.uid() LIMIT 1)
);

-- 12. Secure TENANTS Table
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
FOR SELECT TO authenticated
USING (id = (SELECT tenant_id FROM public.users WHERE supabase_id = auth.uid() LIMIT 1));
-- 13. Secure CLINICAL TABLES
DO $$ 
DECLARE 
    tbl_name text;
BEGIN
    FOR tbl_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'patient_allergies', 'medical_conditions', 'patient_medications', 
            'visit_records', 'oral_tissue_findings', 'tooth_conditions', 
            'periodontal_measurements', 'treatment_plans', 'treatment_plan_items', 
            'prescriptions', 'prescription_items', 'patient_documents'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for all users" ON public.%I', tbl_name);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id())', 
            'tenant_isolation_' || tbl_name, tbl_name);
    END LOOP;
END $$;
