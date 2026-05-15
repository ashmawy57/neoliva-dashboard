const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'ashmawyalaa@gmail.com';
  console.log(`Checking Supabase user: ${email}`);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (user) {
    console.log('Supabase user found:', JSON.stringify(user, null, 2));
    
    // Update password to match what the user is typing in screenshot
    console.log('Updating password to Moessho@57...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: 'Moessho@57' }
    );
    
    if (updateError) {
      console.error('Error updating password:', updateError);
    } else {
      console.log('Password updated successfully!');
    }
  } else {
    console.log('Supabase user NOT found.');
  }
}

main();
