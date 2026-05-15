const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ashmawyalaa@gmail.com';
  const newPassword = 'Moessho@57';
  
  // Note: This system uses Supabase for auth, but may have a local user record.
  // The "Invalid login credentials" usually comes from Supabase.
  // If the user is trying to login via the app's login page, it likely calls Supabase.
  
  console.log(`Checking user: ${email}`);
  const user = await prisma.user?.findUnique({ where: { email } });
  
  if (user) {
    console.log('User found in local DB:', user);
  } else {
    console.log('User not found in local DB.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
