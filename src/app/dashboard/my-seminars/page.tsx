import { Metadata } from 'next';
import MySeminars from '@/components/dashboard/MySeminars';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'My Seminars - SOOOP',
    description: 'View attended seminars and download certificates.',
};

export default async function MySeminarsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return <MySeminars userId={user.id} />;
}
