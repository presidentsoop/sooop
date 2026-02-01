import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampaignsView from "@/components/dashboard/campaigns/CampaignsView";

export default async function CampaignsPage() {
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

    // Fetch initial data
    const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    return <CampaignsView initialCampaigns={campaigns || []} />;
}
