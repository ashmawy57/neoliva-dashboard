import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Creating tenants table if not exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Creating default tenant...');
  const existingTenants = await prisma.$queryRawUnsafe(`SELECT id FROM tenants WHERE slug = 'default'`);
  let tenantId;
  if ((existingTenants as any).length > 0) {
    tenantId = (existingTenants as any)[0].id;
  } else {
    const tenant = await prisma.$queryRawUnsafe(`
      INSERT INTO tenants (name, slug) 
      VALUES ('Default Clinic', 'default') 
      RETURNING id
    `);
    tenantId = (tenant as any)[0].id;
  }
  console.log('Default Tenant ID:', tenantId);

  const tables = [
    'staff', 'patients', 'appointments', 'services', 'invoices', 
    'expenses', 'inventory', 'lab_orders', 'treatment_plans', 
    'treatment_plan_items', 'prescriptions', 'prescription_items',
    'patient_allergies', 'medical_conditions', 'patient_medications',
    'visit_records', 'tooth_conditions', 'oral_conditions',
    'oral_tissue_findings', 'periodontal_measurements', 'patient_documents',
    'patient_surgeries', 'patient_family_history'
  ];

  for (const table of tables) {
    try {
      console.log(`Ensuring tenant_id column exists in ${table}...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS tenant_id UUID`);
      console.log(`Updating ${table} with tenant_id...`);
      await prisma.$executeRawUnsafe(`UPDATE ${table} SET tenant_id = '${tenantId}' WHERE tenant_id IS NULL`);
    } catch (e) {
      console.log(`Could not update table ${table}.`, e);
    }
  }

  console.log('Fixing enums...');
  try {
    const enumTables = [
      ['appointments', 'status'],
      ['invoices', 'status'],
      ['expenses', 'status'],
      ['lab_orders', 'status']
    ];

    for (const [table, col] of enumTables) {
      console.log(`Converting ${table}.${col} to text and dropping default...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ALTER COLUMN ${col} DROP DEFAULT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ALTER COLUMN ${col} TYPE TEXT`);
    }

    const appointments = [
      ['Scheduled', 'SCHEDULED'],
      ['Waiting', 'WAITING'],
      ['In Progress', 'IN_PROGRESS'],
      ['Completed', 'COMPLETED'],
      ['Cancelled', 'CANCELLED']
    ];
    for (const [oldVal, newVal] of appointments) {
      await prisma.$executeRawUnsafe(`UPDATE appointments SET status = '${newVal}' WHERE status = '${oldVal}'`);
    }

    const invoices = [
      ['Paid', 'PAID'],
      ['Pending', 'PENDING'],
      ['Overdue', 'OVERDUE']
    ];
    for (const [oldVal, newVal] of invoices) {
      await prisma.$executeRawUnsafe(`UPDATE invoices SET status = '${newVal}' WHERE status = '${oldVal}'`);
    }

    const expenses = [
      ['Paid', 'PAID'],
      ['Pending', 'PENDING']
    ];
    for (const [oldVal, newVal] of expenses) {
      await prisma.$executeRawUnsafe(`UPDATE expenses SET status = '${newVal}' WHERE status = '${oldVal}'`);
    }

    const labOrders = [
      ['Sent', 'SENT'],
      ['In Progress', 'IN_PROGRESS'],
      ['Received', 'RECEIVED'],
      ['Delivered', 'DELIVERED']
    ];
    for (const [oldVal, newVal] of labOrders) {
      await prisma.$executeRawUnsafe(`UPDATE lab_orders SET status = '${newVal}' WHERE status = '${oldVal}'`);
    }

    const constraints = [
      ['oral_conditions', 'oral_conditions_patient_id_name_key'],
      ['tooth_conditions', 'tooth_conditions_patient_id_tooth_number_key'],
      ['staff', 'staff_email_key'],
      ['patients', 'patients_email_key'],
      ['patients', 'patients_phone_key'],
      ['patients', 'patients_national_id_key'],
      ['tenants', 'tenants_slug_key'],
      ['oral_tissue_findings', 'unique_patient_tissue'],
      ['periodontal_measurements', 'unique_periodontal_measurement'],
      ['tooth_conditions', 'unique_patient_tooth_condition']
    ];

    for (const [table, constraint] of constraints) {
      try {
        console.log(`Dropping constraint ${constraint} on ${table}...`);
        await prisma.$executeRawUnsafe(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint}" CASCADE`);
      } catch (e) {
        console.log(`Could not drop constraint ${constraint}.`, e);
      }
    }
  } catch (e) {
    console.log('Constraint/Enum fix failed.', e);
  }

  console.log('Migration prep done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
