/**
 * SCRATCH SCRIPT: Promote User to SUPER_ADMIN
 * 
 * Usage: 
 * 1. Update the email below
 * 2. Run with: npx tsx scratch/promote-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Needs Service Role Key

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promote(email: string) {
  console.log(`Searching for user: ${email}...`);
  
  // 1. Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found in Supabase Auth.`);
    return;
  }

  console.log(`Found user ${user.id}. Promoting to SUPER_ADMIN...`);

  // 2. Update app_metadata
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { app_metadata: { ...user.app_metadata, role: 'SUPER_ADMIN' } }
  );

  if (updateError) throw updateError;

  console.log(`✅ User ${email} successfully promoted to SUPER_ADMIN.`);
  console.log("They can now log in at /admin/login using their Supabase credentials.");
}

const emailToPromote = "admin@neoliva.com"; // CHANGE THIS
promote(emailToPromote).catch(console.error);
