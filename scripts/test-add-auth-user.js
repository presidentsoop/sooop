const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function addTrueImportedMember() {
    const email = 'muhammadsuheer6@gmail.com';
    const fullName = 'Muhammad Suheer';
    const cnic = '35202-0000000-0'; // Dummy CNIC to pass NOT NULL rules if any

    console.log(`Adding ${email} directly to Supabase Auth & Profiles (simulating import-users.ts)...`);

    // 1. Create Auth User
    const tempPassword = `Sooop@${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, cnic: cnic }
    });

    if (createError) {
        if (createError.message.includes("already registered")) {
            console.log(`User ${email} already in Auth. Continuing...`);
        } else {
            console.error('Creation failed:', createError);
            return;
        }
    }

    const userId = authData?.user?.id;
    if (!userId) {
        // Find the ID if they were already registered
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const user = usersData.users.find(u => u.email === email);
        if (!user) {
            console.error("Could not find user after skipping auth creation due to existing user.");
            return;
        }
        var existingUserId = user.id;
    }

    const finalUserId = userId || existingUserId;

    // 2. Create Profile Data
    const profileData = {
        id: finalUserId,
        email: email,
        full_name: fullName,
        cnic: cnic,
        contact_number: '03000000000',
        role: 'member',
        membership_type: 'Full Member',
        membership_status: 'approved',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        created_at: new Date().toISOString()
    };

    // 3. Upsert Profile
    const { error: profileError } = await supabase.from('profiles').upsert(profileData);

    if (profileError) {
        console.error('Profile creation failed:', profileError);
    } else {
        console.log('Successfully completed full user import mapping:', profileData);
    }
}

addTrueImportedMember();
