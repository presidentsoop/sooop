import { createStaticClient } from "@/lib/supabase/static";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
    title: 'Nomination Fees - SOOOP',
    description: 'View the nomination fee structure for SOOOP cabinet positions.',
};

export default async function NominationPage() {
    const supabase = createStaticClient();

    // Parallel Fetch
    const [pageRes, feesRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'nomination').single(),
        supabase.from('nomination_fees').select('*').order('sort_order', { ascending: true })
    ]);

    const filesContent = pageRes.data?.content || {};
    const hero = filesContent.hero || { title: "Nomination Fees", subtitle: "Fee structure for Executive Committee positions" };
    const fees = feesRes.data || [];

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

                {/* Fees Table */}
                <section className="section bg-white">
                    <div className="container max-w-xl">
                        <div className="card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-primary text-white">
                                        <th className="px-6 py-4 text-left font-semibold">Position</th>
                                        <th className="px-6 py-4 text-right font-semibold">Fee (PKR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fees || []).map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === (fees || []).length - 1 ? 'border-0' : ''}`}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.position}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-accent font-bold">{item.fee}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!fees || fees.length === 0) && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                                                No fee data available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center text-gray-600 text-sm">
                            <p>Fees are subject to change. Contact us for the latest information.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
