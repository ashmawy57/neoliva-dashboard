import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import 'dotenv/config';

async function verify() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('--- Verifying Data Integrity ---');

  const models = [
    'appointment', 'service', 'invoice', 'expense', 'inventory', 
    'labOrder', 'treatmentPlan', 'treatmentPlanItem', 'prescription', 
    'prescriptionItem', 'patientAllergy', 'medicalCondition', 
    'patientMedication', 'visitRecord', 'toothCondition', 
    'oralCondition', 'oralTissueFinding', 'periodontalMeasurement', 
    'patientDocument', 'patientSurgery', 'patientFamilyHistory',
    'patient', 'staff'
  ];

  for (const model of models) {
    try {
      // @ts-ignore
      const count = await prisma[model].count({
        where: { tenantId: null }
      });
      console.log(`Model ${model}: ${count} rows with null tenantId`);
    } catch (e) {
      console.error(`Error checking ${model}:`, e.message);
    }
  }

  await pool.end();
}

verify();
