const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function fixAdminRole() {
  const prisma = new PrismaClient();
  const email = 'ashmawyalaa@gmail.com';
  
  console.log(`Fixing permissions for ${email}...`);

  try {
    // 1. Update Supabase Auth metadata
    const result = await prisma.$executeRawUnsafe(
      `UPDATE auth.users 
       SET raw_user_meta_data = jsonb_set(
         COALESCE(raw_user_meta_data, '{}'::jsonb), 
         '{role}', 
         '"SUPER_ADMIN"'
       ) 
       WHERE email = $1`,
      email
    );

    console.log(`Successfully updated auth metadata. Rows affected: ${result}`);

    if (result === 0) {
      console.warn("WARNING: No user found with that email in auth.users. Make sure you registered first.");
    }
  } catch (error) {
    console.error("Error updating role:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
