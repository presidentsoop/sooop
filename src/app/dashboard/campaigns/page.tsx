import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CampaignsView from "@/components/dashboard/campaigns/CampaignsView";

export default async function CampaignsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch initial data
    const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch Profile for layout? No, Layout does it internally if we use the layout inside the page, 
    // BUT we refactored DashboardLayout so it accepts children.
    // Wait, DashboardLayout requires 'userRole'.
    // layout.tsx handles Auth and Profile.
    // So if this page is wrapped by layout.tsx, it just needs to render content.
    // BUT layout.tsx renders <DashboardLayout><Children/></DashboardLayout>.
    // So this page should NOT render <DashboardLayout>. 
    // It should just render <CampaignsView>.

    // Check 'src/app/dashboard/layout.tsx':
    // It renders <DashboardLayout>{children}</DashboardLayout>.

    // So this page content is inject INSIDE DashboardLayout.
    // So I DO NOT need <DashboardLayout> here.

    // HOWEVER! The file I'm replacing (Step 783) had <DashboardLayout> wrapper.
    // That means BEFORE my layout refactor (Step 745), pages wrapped themselves.
    // After Step 745, layout wraps them.
    // So I MUST REMOVE <DashboardLayout> from here.

    return <CampaignsView initialCampaigns={campaigns || []} />;
}
