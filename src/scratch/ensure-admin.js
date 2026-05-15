require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const email = "ashmawyalaa@gmail.com";
  const password = "A3sshmawy@57";

  console.log("Fetching user list...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("List error:", listError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (user) {
    console.log(`User found (ID: ${user.id}). Updating password and metadata...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: password,
        user_metadata: { role: 'SUPER_ADMIN' },
        app_metadata: { role: 'SUPER_ADMIN' }
      }
    );
    if (updateError) console.error("Update failed:", updateError.message);
    else console.log("✅ Admin account fixed and password updated!");
  } else {
    console.log("User not found. Creating new admin...");
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'SUPER_ADMIN' },
      app_metadata: { role: 'SUPER_ADMIN' }
    });
    if (createError) console.error("Creation failed:", createError.message);
    else console.log("✅ Admin account created successfully!");
  }
}

fixAdmin();
