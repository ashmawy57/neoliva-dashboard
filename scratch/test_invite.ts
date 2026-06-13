import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testGenerateLink() {
  const testEmail = 'ashmawyalaa+test' + Date.now() + '@gmail.com';
  console.log('Generating link for:', testEmail);
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: testEmail,
    options: {
      redirectTo: 'http://localhost:3000/staff/accept-invitation',
    }
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Link:', data.properties?.action_link);
  }
}

testGenerateLink();
