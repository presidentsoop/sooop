import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import RichCmsEditor from "@/components/dashboard/RichCmsEditor";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CmsPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Auth Check & Layout Data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 2. Fetch CMS Page Data
    const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !page) {
        return notFound();
    }

    // 3. Render
    return (
        <DashboardLayout
            userRole={profile?.role || 'member'}
            userName={profile?.full_name}
            userEmail={user.email}
        >
            <RichCmsEditor
                pageId={page.id}
                initialContent={page.content}
                pageTitle={page.title}
            />
        </DashboardLayout>
    );
}

