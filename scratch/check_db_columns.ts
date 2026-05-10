
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});



async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Invoice' OR table_name = 'invoices'
    `;
    console.log('Database columns:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error querying columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
