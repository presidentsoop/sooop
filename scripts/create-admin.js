const { createClient } = require('@supabase/supabase-js');

// Direct values (will delete this script after)
const supabaseUrl = 'https://davjuarlqpvwkbaktibi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmp1YXJscXB2d2tiYWt0aWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE3MDI1MCwiZXhwIjoyMDgxNzQ2MjUwfQ._KR9V3d0Lx4B8_qSwVvSzFxcQeraqmiIcpDsJCyd-Yk';

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
        console.error('Auth Error:', authError.message);
        process.exit(1);
    }

    console.log('Auth user created:', authData.user?.id);

    // 2. Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: email,
        full_name: 'SOOOP President',
        role: 'admin',
        membership_status: 'active'
    });

    if (profileError) {
        console.error('Profile Error:', profileError.message);
        process.exit(1);
    }

    console.log('');
    console.log('✅ Admin created successfully!');
    console.log('=============================');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('=============================');
}

createAdmin();
