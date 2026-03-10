import { createClient as createAdminClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function activateExistingMembership(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("URL:", supabaseUrl?.substring(0, 15) + "...");
    console.log("KEY exists:", !!supabaseServiceKey);
    console.log("Email:", normalizedEmail);

    const supabaseAdmin = createAdminClient(supabaseUrl!, supabaseServiceKey!, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const { data: importedMember, error: importCheckError } = await supabaseAdmin
            .from('imported_members')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        console.log("importCheckError:", importCheckError);
        console.log("importedMember:", importedMember);

    } catch (error) {
        console.error('Activation error:', error);
    }
}

activateExistingMembership('hthpb.soooptest@inbox.testmail.app');
