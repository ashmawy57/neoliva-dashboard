-- Migration script to move data from legacy tables to new Supabase schema
-- Based on actual column names found in the database

-- 1. Migrate Staff
INSERT INTO public.staff (
    display_id, name, role, title, email, phone, status, created_at, updated_at
)
SELECT 
    "displayId", name, role::text::staff_role, title, email, phone, status, "createdAt", "updatedAt"
FROM public."Staff"
ON CONFLICT (email) DO UPDATE SET
    display_id = EXCLUDED.display_id,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

-- 2. Migrate Patients
INSERT INTO public.patients (
    display_id, name, email, phone, dob, gender, status, created_at, updated_at,
    phone2, address, post_code, city, marital_status, occupation, insurance,
    ssn, id_number, medical_alert, referred_by, notes, is_deceased
)
SELECT 
    "displayId", name, email, phone1, dob::date, gender, status, "createdAt", "updatedAt",
    phone2, address, "postCode", city, "maritalStatus", occupation, insurance,
    ssn, "idNumber", "medicalAlert", "referredBy", notes, "isDeceased"
FROM public."Patient"
ON CONFLICT (display_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    dob = EXCLUDED.dob,
    gender = EXCLUDED.gender,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

-- 3. Migrate Services
INSERT INTO public.services (
    name, category, price, duration_minutes, description, popular, created_at, updated_at
)
SELECT 
    name, category, price::numeric, duration, description, popular, "createdAt", "updatedAt"
FROM public."Service"
ON CONFLICT DO NOTHING;

-- 4. Migrate Appointments
INSERT INTO public.appointments (
    display_id, patient_id, doctor_id, treatment, date, time, duration, status, notes, color, created_at, updated_at
)
SELECT 
    a."displayId", p.id, s.id, a.treatment, a.date::date, 
    (to_timestamp(a.time, 'HH12:MI AM')::time), 
    regexp_replace(a.duration, '[^0-9]', '', 'g')::integer,
    CASE 
        WHEN a.status::text = 'Scheduled' THEN 'Scheduled'::appointment_status
        WHEN a.status::text = 'Waiting' THEN 'Waiting'::appointment_status
        WHEN a.status::text = 'In Progress' THEN 'In Progress'::appointment_status
        WHEN a.status::text = 'Completed' THEN 'Completed'::appointment_status
        WHEN a.status::text = 'Cancelled' THEN 'Cancelled'::appointment_status
        ELSE 'Scheduled'::appointment_status
    END,
    a.notes, a.color, a."createdAt", a."updatedAt"
FROM public."Appointment" a
JOIN public."Patient" old_p ON a."patientId" = old_p.id
JOIN public.patients p ON p.display_id = old_p."displayId"
LEFT JOIN public."Staff" old_s ON a."doctorId" = old_s.id
LEFT JOIN public.staff s ON s.display_id = old_s."displayId"
ON CONFLICT (display_id) DO NOTHING;

-- 5. Migrate Invoices
INSERT INTO public.invoices (
    display_id, patient_id, amount, date, status, method, created_at, updated_at, treatment
)
SELECT 
    i."displayId", p.id, i.amount::numeric, i.date::date, 
    i.status::text::invoice_status, i.method, i."createdAt", i."updatedAt", i.treatment
FROM public."Invoice" i
JOIN public."Patient" old_p ON i."patientId" = old_p.id
JOIN public.patients p ON p.display_id = old_p."displayId"
ON CONFLICT (display_id) DO NOTHING;

-- 6. Migrate Expenses
INSERT INTO public.expenses (
    display_id, category, description, amount, date, created_at, updated_at
)
SELECT 
    "id", category, description, amount::numeric, "date"::date, "createdAt", "updatedAt"
FROM public."Expense"
ON CONFLICT (display_id) DO NOTHING;

-- 7. Migrate Inventory
INSERT INTO public.inventory (
    display_id, name, category, quantity, min_level, unit, created_at, updated_at
)
SELECT 
    "id", name, category, quantity, "minLevel", unit, "createdAt", "updatedAt"
FROM public."Inventory"
ON CONFLICT (display_id) DO NOTHING;

-- 8. Migrate Lab Orders
INSERT INTO public.lab_orders (
    display_id, patient_id, item_description, lab_name, send_date, return_date, cost, status, created_at, updated_at
)
SELECT 
    lo."id", p.id, lo."itemDescription", lo."labName", lo."sendDate"::date, lo."expectedReturnDate"::date, lo.cost::numeric, 
    CASE 
        WHEN lo.status::text = 'Pending' THEN 'Sent'::lab_order_status
        WHEN lo.status::text = 'Sent' THEN 'Sent'::lab_order_status
        WHEN lo.status::text = 'In Progress' THEN 'In Progress'::lab_order_status
        WHEN lo.status::text = 'Received' THEN 'Received'::lab_order_status
        WHEN lo.status::text = 'Delivered' THEN 'Delivered'::lab_order_status
        ELSE 'Sent'::lab_order_status
    END,
    lo."createdAt", lo."updatedAt"
FROM public."LabOrder" lo
JOIN public."Patient" old_p ON lo."patientId" = old_p.id
JOIN public.patients p ON p.display_id = old_p."displayId"
ON CONFLICT (display_id) DO NOTHING;
