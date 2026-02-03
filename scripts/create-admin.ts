// Script to create new admin user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
    const email = 'soooppresident@gmail.com';
    const password = 'User4468@.';

    console.log('Creating admin user:', email);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'SOOOP President',
            role: 'admin'
        }
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    console.log('Auth user created:', authData.user?.id);

    // 2. Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user!.id,
        email: email,
        full_name: 'SOOOP President',
        role: 'admin',
        membership_status: 'active'
    });

    if (profileError) {
        console.error('Profile Error:', profileError);
        return;
    }

    console.log('✅ Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
}

createAdmin();
