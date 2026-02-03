import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

    // Serialize data to avoid "Event handlers cannot be passed" error
    const serializedUser = JSON.parse(JSON.stringify(user));
    const serializedProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-2">Manage your account information and preferences.</p>
            </div>

            <ProfileForm user={serializedUser} profile={serializedProfile} />
        </>
    );
}
