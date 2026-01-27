
import { createAdminClient } from "@/lib/supabase/admin";
import SecurityView from "@/components/dashboard/SecurityView";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Since we are in app router, we can fetch data server side.
// But DashboardLayout wraps the children.
// Wait, the page renders INSIDE the layout?
// No, Next.js Layout wraps page.
// `src/app/dashboard/layout.tsx` likely uses `DashboardLayout`.
// So this Page component just needs to return the content.
// `DashboardLayout` is Client Component. `security/page.tsx` is Server Component.
// This works fine.

export default async function SecurityPage() {
    const supabaseAdmin = createAdminClient();

    // Fetch Auth Users (Limit 100)
    // We assume the user has permisson (checked by Middleware/Layout)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error || !users) {
        return <div className="p-8 text-red-500">Error loading users: {error?.message}</div>;
    }

    // Fetch Profiles to augment data (Full Name, Role)
    const userIds = users.map(u => u.id);
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, membership_status, profile_photo_url, role').in('id', userIds);

    // Merge
    const mergedUsers = users.map(u => {
        const profile = profiles?.find(p => p.id === u.id);
        return {
            ...u,
            profile: profile || null
        };
    });

    return <SecurityView initialUsers={mergedUsers} />;
}
