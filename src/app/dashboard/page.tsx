import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminView from "@/components/dashboard/AdminView";
import MemberView from "@/components/dashboard/MemberView";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Profile with robust error handling
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Auto-Sync: If profile doesn't exist (but user does), create it.
    // This handles cases where auth exists but profile creation failed or wasn't implemented.
    if (!profile) {
        console.log("Profile missing for user, creating default...");
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'New User',
                role: 'member', // Default role
                membership_status: 'none'
            })
            .select()
            .single();

        if (newProfile) {
            profile = newProfile;
        }
    }

    // EMERGENCY / HARDCODED ADMIN PROMOTION
    // This ensures your specific account is ALWAYS admin, resolving the "conflict"
    const ADMIN_EMAILS = ['muhammadsuheer14@gmail.com', 'muhammadsuheer6@gmail.com'];
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
        if (profile?.role !== 'admin') {
            console.log("Promoting user to admin...");

            // 1. Update Database
            await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', user.id);

            // 2. Force Local Update (Critical for immediate UI fix)
            if (profile) {
                profile.role = 'admin';
            } else {
                // Should be covered by auto-sync above, but just in case
                profile = { ...profile, role: 'admin' };
            }
        }
    }

    // Determine Role using the (potentially updated) profile
    const role = profile?.role || 'member';

    // Status logic
    const status = profile?.membership_status || 'none';

    return (
        <DashboardLayout
            userRole={role}
            userName={profile?.full_name || user.user_metadata?.full_name || 'User'}
            userEmail={user.email}
        >
            {role === 'admin' ? (
                <AdminView />
            ) : (
                <MemberView status={status} profile={profile} />
            )}
        </DashboardLayout>
    );
}
