import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberManagement from "@/components/dashboard/MemberManagement";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function MembersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Role check - strict, only admin can see this page
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fallback: If no profile or no full_name, use metadata or default
    const displayName = profile?.full_name || user.user_metadata?.full_name || 'Admin User';

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        redirect("/dashboard");
    }

    return (
        <MemberManagement />
    );
}
