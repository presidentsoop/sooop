import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check common variable names for Service Role Key
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error("Supabase URL is missing. Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file.");
    }

    if (!serviceRoleKey) {
        console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to ANON Key. Admin actions (like importing users) may fail with 401/403 errors.");
        serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }

    if (!serviceRoleKey) {
        throw new Error("Supabase Key is missing. Please add SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.");
    }

    return createClient(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};
