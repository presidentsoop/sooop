import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Determine Role for Layout
    const role = profile?.role || user.user_metadata?.role || 'member';

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-2">Manage your account information and preferences.</p>
            </div>

            <ProfileForm user={user} profile={profile} />
        </>
    );
}
