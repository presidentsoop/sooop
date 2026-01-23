import { createClient } from "@/lib/supabase/server";
import AdminView from "@/components/dashboard/AdminView";
import MemberView from "@/components/dashboard/MemberView";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // We can re-fetch profile to be sure, or trust layout (but context sharing in server components is tricky without prop drilling)
    // Fetching is cheap.
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Safety check if layout handled creation but we missed it in parallel? 
    // Usually sequential, but layout runs before page.

    const role = profile?.role || 'member';
    const status = profile?.membership_status || 'none';

    return role === 'admin' ? (
        <AdminView />
    ) : (
        <MemberView status={status} profile={profile} />
    );
}
