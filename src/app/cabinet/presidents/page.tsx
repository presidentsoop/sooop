import { createStaticClient } from "@/lib/supabase/static";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
    title: 'Previous Presidents - SOOOP',
    description: 'Explore the history of SOOOP leadership through our previous presidents.',
};

export default async function PresidentsPage() {
    const supabase = createStaticClient();

    // Fetch all Presidents (Current and Past)
    // Parallel Fetch
    const [pageRes, historyRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'presidents').single(),
        supabase.from('leadership_history').select('*').eq('role', 'President').order('start_year', { ascending: false })
    ]);

    const filesContent = pageRes.data?.content || {};
    const hero = filesContent.hero || { title: "Presidential History", subtitle: "A timeline of SOOOP leadership through the years" };
    const presidents = historyRes.data || [];

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-20">
                    <div className="container text-center">
                        <Link href="/cabinet" className="text-white/80 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Cabinet
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {hero.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Timeline */}
                <section className="section bg-white">
                    <div className="container max-w-2xl">
                        <div className="relative pl-8 md:pl-12">
                            {/* Timeline Line */}
                            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary-300"></div>

                            {/* Timeline Items */}
                            <div className="space-y-8">
                                {(presidents || []).map((president, index) => {
                                    const isCurrent = president.end_year === null || president.end_year >= new Date().getFullYear();

                                    return (
                                        <div key={index} className="relative">
                                            {/* Dot */}
                                            <div className={`absolute -left-8 md:-left-12 top-1 w-6 h-6 rounded-full border-4 border-white shadow-lg ${isCurrent ? 'bg-accent' : 'bg-primary'}`}></div>

                                            {/* Content */}
                                            <div className={`card ${isCurrent ? 'border-2 border-accent' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <div className={`text-lg font-bold ${isCurrent ? 'text-accent' : 'text-primary'}`}>
                                                            {president.start_year === president.end_year
                                                                ? president.start_year
                                                                : `${president.start_year} - ${president.end_year || 'Present'}`
                                                            }
                                                        </div>
                                                        <div className="text-gray-900 font-medium">{president.name}</div>
                                                    </div>
                                                    {isCurrent && (
                                                        <span className="badge badge-accent ml-auto">Current</span>
                                                    )}
                                                </div>
                                                {president.bio && (
                                                    <p className="mt-2 text-sm text-gray-500">{president.bio}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!presidents || presidents.length === 0) && (
                                    <div className="text-gray-500">No history found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
