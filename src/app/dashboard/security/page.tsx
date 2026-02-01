import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SecurityView from "@/components/dashboard/SecurityView";

export default async function SecurityPage() {
    // First check user authentication and role
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Admin-only page
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        redirect("/dashboard");
    }

    // Now fetch data using admin client
    const supabaseAdmin = createAdminClient();

    // Fetch Auth Users (Limit 100)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error || !users) {
        return <div className="p-8 text-red-500">Error loading users: {error?.message}</div>;
    }

    // Fetch Profiles to augment data (Full Name, Role)
    const userIds = users.map(u => u.id);
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, membership_status, profile_photo_url, role').in('id', userIds);

    // Merge
    const mergedUsers = users.map(u => {
        const userProfile = profiles?.find(p => p.id === u.id);
        return {
            ...u,
            profile: userProfile || null
        };
    });

    return <SecurityView initialUsers={mergedUsers} />;
}
