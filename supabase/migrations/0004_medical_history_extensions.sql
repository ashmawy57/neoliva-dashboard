-- 0004_medical_history_extensions.sql

-- 1. Add missing lifestyle columns to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50) DEFAULT 'Never',
ADD COLUMN IF NOT EXISTS alcohol_use VARCHAR(50) DEFAULT 'None',
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- 2. Create patient_surgeries table
CREATE TABLE public.patient_surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    surgery_name VARCHAR(255) NOT NULL,
    surgery_date VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create patient_family_history table
CREATE TABLE public.patient_family_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    relation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patient_surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_history ENABLE ROW LEVEL SECURITY;

-- Setup policies
CREATE POLICY "Enable all access for all users" ON public.patient_surgeries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.patient_family_history FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_patient_surgeries_modtime BEFORE UPDATE ON public.patient_surgeries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patient_family_history_modtime BEFORE UPDATE ON public.patient_family_history FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
