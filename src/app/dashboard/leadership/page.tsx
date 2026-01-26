import { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeadershipManager from '@/components/dashboard/LeadershipManager';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Manage Leadership - SOOOP Admin',
    description: 'Manage executive cabinet, wings, and history.',
};

export default async function ManageLeadershipPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/dashboard');

    return (
        <LeadershipManager />
    );
}
