import { createClient } from "@/lib/supabase/server";
import AdminAnalytics from "./AdminAnalytics";
import { format } from 'date-fns';

export default async function AdminView() {
    const supabase = await createClient();

    // 1. Fetch Real Data from Supabase
    // We select only necessary fields to optimize performance
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, membership_status, created_at');

    if (error || !profiles) {
        return <div className="p-6 text-red-500">Error loading dashboard data.</div>;
    }

    // 2. Calculate KPI Stats
    const stats = {
        total: profiles.length,
        pending: profiles.filter(p => p.membership_status === 'pending').length,
        active: profiles.filter(p => p.membership_status === 'approved').length,
        expired: profiles.filter(p => ['expired', 'rejected', 'revoked'].includes(p.membership_status)).length,
    };

    // 3. Process Data for Charts

    // Chart 1: Status Distribution (Pie Chart)
    const statusData = [
        { name: 'Active', value: stats.active },
        { name: 'Pending', value: stats.pending },
        { name: 'Inactive', value: stats.expired },
        // Fallback for empty state if new project
        ...(profiles.length === 0 ? [{ name: 'No Data', value: 1 }] : [])
    ];

    // Chart 2: Growth Over Time (Area Chart)
    // We group users by creation month
    const growthMap = new Map<string, number>();

    profiles.forEach(p => {
        if (p.created_at) {
            const date = new Date(p.created_at);
            const monthKey = format(date, 'MMM yyyy'); // e.g., "Dec 2025"
            growthMap.set(monthKey, (growthMap.get(monthKey) || 0) + 1);
        }
    });

    // Convert map to array and sort chronologically (basic implementation)
    // For a production app with years of data, you'd fill in missing months.
    // Here we just show months where activity happened for simplicity.
    const growthDataRaw = Array.from(growthMap.entries()).map(([month, count]) => ({
        month,
        newMembers: count
    }));

    // Make it cumulative for "Growth" curve
    let cumulative = 0;
    const growthData = growthDataRaw.map(item => {
        cumulative += item.newMembers;
        return {
            month: item.month,
            count: cumulative
        };
    });

    // If no data, provide a baseline entry
    if (growthData.length === 0) {
        growthData.push({ month: format(new Date(), 'MMM yyyy'), count: 0 });
    }

    return (
        <AdminAnalytics
            stats={stats}
            growthData={growthData}
            statusData={statusData}
        />
    );
}
