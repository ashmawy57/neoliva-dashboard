
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  const email = "ashmawyalaa@gmail.com";
  const password = "A3sshmawy@57";

  console.log(`🚀 Starting Admin Setup for: ${email}...`);

  // 1. Try to find the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    console.log(`✅ User found (ID: ${existingUser.id}). Updating password and confirming...`);
    
    // Update existing user
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { 
        password: password,
        email_confirm: true,
        user_metadata: { role: 'SUPER_ADMIN' },
        app_metadata: { role: 'SUPER_ADMIN' }
      }
    );

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
    } else {
      console.log('✨ Admin user updated and activated successfully!');
    }
  } else {
    console.log(`➕ User not found. Creating new Super Admin...`);
    
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'SUPER_ADMIN' },
      app_metadata: { role: 'SUPER_ADMIN' }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
    } else {
      console.log('✨ New Super Admin created successfully!');
    }
  }

  console.log('\n👉 Now you can login to the Admin Portal with these credentials.');
}

setupAdmin();
