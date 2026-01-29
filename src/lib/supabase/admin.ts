import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check common variable names for Service Role Key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl) {
        throw new Error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing from environment variables.");
    }

    if (!serviceRoleKey) {
        // DO NOT FALLBACK TO ANON KEY - This causes RLS violations
        throw new Error(
            "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. " +
            "This key is required for server-side operations. " +
            "Add it to your Vercel Environment Variables for production deployment."
        );
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
