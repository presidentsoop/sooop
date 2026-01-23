import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Auto-Sync: If profile doesn't exist (but user does), create it.
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
    const ADMIN_EMAILS = ['muhammadsuheer14@gmail.com', 'muhammadsuheer6@gmail.com'];
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
        if (profile?.role !== 'admin') {
            console.log("Promoting user to admin...");
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
            if (profile) profile.role = 'admin';
        }
    }

    const role = profile?.role || 'member';

    return (
        <DashboardLayout
            userRole={role}
            userName={profile?.full_name || user.user_metadata?.full_name || 'User'}
            userEmail={user.email}
        >
            {children}
        </DashboardLayout>
    );
}
