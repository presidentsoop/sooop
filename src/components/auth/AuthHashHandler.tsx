'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthHashHandler() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            // Check if there is an access token indicating a recovery/password-reset flow in the URL fragment
            if (hash && hash.includes('access_token=') && hash.includes('type=recovery')) {
                // Use router.replace to avoid clogging the history stack, and pass the hash along
                // so the Supabase client on the receiving page can parse it and authenticate the user.
                router.replace('/update-password' + hash);
            }
        }
    }, [router]);

    return null;
}
