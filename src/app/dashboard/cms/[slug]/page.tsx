import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import RichCmsEditor from "@/components/dashboard/RichCmsEditor";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const dynamic = 'force-dynamic';

// Default content templates for each page
function getDefaultContent(slug: string): Record<string, any> {
    const templates: Record<string, any> = {
        home: {
            hero: {
                title: "Advancing **Eye Care Excellence** Together",
                description: "Join Pakistan's premier society for optometrists, orthoptists, and vision scientists.",
                image: "/meetings/first-clinical-meeting.png"
            },
            stats: {},
            about: {},
            benefits: {},
            testimonials: {},
            leadership: {},
            sponsors: {},
            cta: {}
        },
        about: {
            hero: { title: "About SOOOP", subtitle: "Our Story" },
            mission: {},
            history: {}
        },
        membership: {
            hero: { title: "Membership", subtitle: "Join our community" },
            benefits: [],
            pricing: {}
        },
        events: {
            hero: { title: "Events", subtitle: "Upcoming conferences and seminars" }
        },
        contact: {
            hero: { title: "Contact Us", subtitle: "Get in touch" }
        },
        wings: {
            hero: { title: "Professional Wings", subtitle: "Our specialized divisions" }
        }
    };

    return templates[slug] || { hero: { title: slug.charAt(0).toUpperCase() + slug.slice(1) } };
}

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

    // 2. Fetch CMS Page Data - Auto-create if missing
    let { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

    // Auto-create page if it doesn't exist
    if (error || !page) {
        const defaultContent = getDefaultContent(slug);
        const { data: newPage, error: insertError } = await supabase
            .from('pages')
            .insert({
                slug: slug,
                title: slug.charAt(0).toUpperCase() + slug.slice(1) + ' Page',
                content: defaultContent
            })
            .select()
            .single();

        if (insertError || !newPage) {
            console.error('Failed to create page:', insertError);
            return notFound();
        }
        page = newPage;
    }

    // 3. Render
    return (
        <RichCmsEditor
            pageId={page.id}
            initialContent={page.content}
            pageTitle={page.title}
        />
    );
}

