import { createClient } from '@supabase/supabase-js';

// Flag to detect if we're in a build/prerender context
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check common variable names for Service Role Key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl) {
        throw new Error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing from environment variables.");
    }

    if (!serviceRoleKey) {
        // During build time, return a dummy client that will fail gracefully
        // This allows static page generation to proceed
        if (isBuildTime) {
            console.warn("⚠️ Build-time: SUPABASE_SERVICE_ROLE_KEY not available. Using placeholder.");
            // Return a client with anon key - it won't be used for actual operations during build
            const fallbackKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
                'placeholder';
            return createClient(supabaseUrl, fallbackKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
        }

        // At runtime, throw a clear error
        throw new Error(
            "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. " +
            "This key is required for server-side operations. " +
            "Add it to your Vercel Environment Variables."
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
