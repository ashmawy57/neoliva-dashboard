const { Pool } = require('pg');

async function checkDb() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.sgllyytutxnpfupltpof:ogNws2i8VoskYVSr@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
  });

  const email = 'ashmawydev@gmail.com';
  
  try {
    console.log(`Checking database for: ${email}`);
    
    // 1. Check users (Supabase auth.users is inaccessible from public schema normally, but let's check public.users if it exists)
    const users = await pool.query("SELECT id, email FROM public.\"User\" WHERE email = $1", [email]);
    console.log("Users:", users.rows);
    
    // 2. Check staff_invitations
    const invites = await pool.query("SELECT id, email, status FROM public.\"StaffInvitation\" WHERE email = $1", [email]);
    console.log("Pending Invitations:", invites.rows);
    
    // 3. Check tenant_memberships (we might need to join user table to get email)
    // Assuming tenant_membership has user_id
    const memberships = await pool.query(`
      SELECT tm.id, tm.role 
      FROM public.\"TenantMembership\" tm 
      JOIN public.\"User\" u ON tm.\"userId\" = u.id 
      WHERE u.email = $1
    `, [email]);
    console.log("Tenant Memberships:", memberships.rows);
    
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await pool.end();
  }
}

checkDb();
