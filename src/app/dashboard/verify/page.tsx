import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VerifyList from "@/components/dashboard/VerifyList";

export default async function VerifyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Admin Check
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (currentUserProfile?.role !== 'admin' && currentUserProfile?.role !== 'super_admin') {
        redirect("/dashboard");
    }

    // Fetch Pending Applications
    const { data: pendingMembers } = await supabase
        .from('profiles')
        .select('*')
        .eq('membership_status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
                <p className="text-gray-500 mt-2">Review and approve new membership applications.</p>
            </div>

            <VerifyList initialMembers={pendingMembers || []} />
        </>
    );
}
