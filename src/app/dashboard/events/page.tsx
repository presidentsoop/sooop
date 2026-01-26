import { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EventsManager from '@/components/dashboard/EventsManager';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Manage Events - SOOOP Admin',
    description: 'Create and manage events for the platform.',
};

export default async function ManageEventsPage() {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Role Check (Optional, but robust)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/dashboard');

    return (
        <EventsManager />
    );
}
