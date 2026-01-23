import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: 'Cabinet - SOOOP',
    description: 'Meet the leadership and cabinet members of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

const cabinetSections = [
    {
        title: 'Cabinet Members',
        description: 'View the current cabinet members and their positions in the organization.',
        href: '/cabinet/members',
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        title: 'Previous Presidents',
        description: 'Explore the history of SOOOP leadership through our previous presidents.',
        href: '/cabinet/presidents',
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Nomination Fees',
        description: 'View the fee structure for different cabinet positions in the election.',
        href: '/cabinet/nomination',
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
];

import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 3600;

export default async function CabinetPage() {
    const supabase = createStaticClient();
    const { data: page } = await supabase.from('pages').select('content').eq('slug', 'cabinet').single();

    const filesContent = page?.content || {};
    const hero = filesContent.hero || { title: "Our Cabinet", subtitle: "Meet the dedicated leaders who guide SOOOP towards excellence in vision care" };

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Leadership</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {hero.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Cabinet Sections */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {cabinetSections.map((section, index) => (
                                <Link
                                    key={index}
                                    href={section.href}
                                    className="card card-hover text-center group"
                                >
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                        {section.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">{section.title}</h3>
                                    <p className="text-gray-600 mb-6">{section.description}</p>
                                    <span className="text-accent font-medium inline-flex items-center gap-2">
                                        View Details
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
