-- Add doctor_name column to prescriptions table
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);

-- Update RLS policies to be sure
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for now" ON public.prescriptions;
CREATE POLICY "Allow all for now" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for now" ON public.prescription_items;
CREATE POLICY "Allow all for now" ON public.prescription_items FOR ALL USING (true) WITH CHECK (true);
