import { Metadata } from 'next';
import SeminarManagement from '@/components/dashboard/SeminarManagement';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Seminars & Certificates - SOOOP Admin',
    description: 'Manage seminars and certificate templates.',
};

export default async function ManageSeminarsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') redirect('/dashboard');

    return <SeminarManagement />;
}
