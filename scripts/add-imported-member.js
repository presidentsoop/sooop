const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addImportedMember() {
    const email = 'muhammadsuheer6@gmail.com';
    const fullName = 'Muhammad Suheer';

    console.log(`Adding ${email} to imported_members...`);

    // Try to insert directly
    const { data, error } = await supabase
        .from('imported_members')
        .insert([
            {
                email: email,
                full_name: fullName,
                claimed: false,
                invite_sent: false
            }
        ])
        .select();

    if (error) {
        if (error.message.includes('duplicate key value')) {
            console.log('User already exists in imported_members. Updating...');
            const { error: updateError } = await supabase
                .from('imported_members')
                .update({
                    full_name: fullName,
                    claimed: false,
                    invite_sent: false
                })
                .eq('email', email);

            if (updateError) {
                console.error('Error updating member:', updateError);
                return;
            }
            console.log('Successfully updated member.');
        } else {
            console.error('Error inserting member:', error);

            // Let's check if there is an imported_members table at all.
            console.log("\nChecking if imported_members table exists by running a simple select...");
            const { error: checkError } = await supabase.from('imported_members').select('id').limit(1);
            if (checkError) {
                console.error("Table imported_members might not exist:", checkError.message);
            }
        }
    } else {
        console.log('Successfully added member:', data);
    }
}

addImportedMember();
