const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = `test_${Date.now()}@test.com`;
  console.log('Registering', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test User',
        phone: '0500000000'
      }
    }
  });

  console.log('SignUp Data:', data);
  console.log('SignUp Error:', error);

  // Now let's try to sign up the SAME email again
  console.log('\nRegistering AGAIN', email);
  const { data: data2, error: error2 } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test User',
        phone: '0500000000'
      }
    }
  });

  console.log('SignUp 2 Data:', data2);
  console.log('SignUp 2 Error:', error2);
}

test();
