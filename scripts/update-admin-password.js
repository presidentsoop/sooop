const { createClient } = require('@supabase/supabase-js');

// Direct values for immediate fix
const supabaseUrl = 'https://davjuarlqpvwkbaktibi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmp1YXJscXB2d2tiYWt0aWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE3MDI1MCwiZXhwIjoyMDgxNzQ2MjUwfQ._KR9V3d0Lx4B8_qSwVvSzFxcQeraqmiIcpDsJCyd-Yk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function updateAdminPassword() {
    const userId = '6a0fc2e3-62af-4acf-a8dc-96205cff3b47';
    const password = 'User4468@.';

    console.log('Updating password for user:', userId);

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
    );

    if (error) {
        console.error('Error updating password:', error.message);
    } else {
        console.log('✅ Password updated successfully for soooppresident@gmail.com');
    }
}

updateAdminPassword();
