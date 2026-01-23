import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Users, Ticket, BookOpen, Coins, Contact, Check } from 'lucide-react';
import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 3600;

interface MembershipBenefit {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
}

interface MembershipType {
    type: string;
    fee: string;
    description: string;
    features: string[];
    popular: boolean;
}

interface DownloadItem {
    name: string;
    url: string;
}

interface MembershipPageContent {
    benefits: MembershipBenefit[];
    types: MembershipType[];
    downloads: DownloadItem[];
}

export const metadata: Metadata = {
    title: 'Membership - SOOOP',
    description: 'Join the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan. Access professional development, networking, and exclusive member benefits.',
};

const defaultContent: MembershipPageContent = {
    benefits: [],
    types: [],
    downloads: []
};

// Map hardcoded icons for default list if dynamic icons aren't supported yet
const Icons = [BookOpen, Users, Ticket, BookOpen, Coins, Contact];

export default async function MembershipPage() {
    const supabase = createStaticClient();
    const { data: page } = await supabase.from('pages').select('content').eq('slug', 'membership').single();

    const content = page?.content || defaultContent;
    const hero = content.hero || { title: "Become a **Member**", subtitle: "Join the leading society of vision care professionals in Pakistan and unlock exclusive benefits." };

    const renderTitle = (text: string) => {
        const parts = text.split("**");
        return parts.map((part, i) =>
            i % 2 === 1 ? <span key={i} className="text-accent">{part}</span> : part
        );
    };

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Join Our Community</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {renderTitle(hero.title)}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Benefits */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="section-title">Member <span className="text-accent">Benefits</span></h2>
                            <p className="section-subtitle mx-auto">
                                As a SOOOP member, you'll have access to exclusive resources and opportunities
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {content.benefits?.map((benefit: MembershipBenefit, index: number) => {
                                const Icon = Icons[index % Icons.length];
                                return (
                                    <div key={index} className="card card-hover group">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary mb-2">{benefit.title}</h3>
                                        <p className="text-gray-600">{benefit.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Membership Types */}
                <section className="section bg-gray-50">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="section-title">Membership <span className="text-accent">Types</span></h2>
                            <p className="section-subtitle mx-auto">
                                Choose the membership type that best suits your professional needs
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {content.types?.map((membership: MembershipType, index: number) => (
                                <div
                                    key={index}
                                    className={`card relative ${membership.popular ? 'border-2 border-accent shadow-soft-xl' : ''}`}
                                >
                                    {membership.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge badge-accent">
                                            Most Popular
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-primary mb-2">{membership.type}</h3>
                                        <div className="text-4xl font-bold text-accent mb-2">{membership.fee}</div>
                                        <p className="text-gray-600 text-sm">{membership.description}</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {membership.features?.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600">
                                                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href="/login"
                                        className={`btn w-full ${membership.popular ? 'btn-accent' : 'btn-outline'}`}
                                    >
                                        Register Now
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Downloads */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="section-title mb-6">Required <span className="text-accent">Documents</span></h2>
                            <p className="text-gray-600 mb-8">
                                Download the following documents to complete your membership application
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {content.downloads?.map((doc: DownloadItem, i: number) => (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        download
                                        className={`btn ${i === 0 ? 'btn-primary' : 'btn-outline'} w-full sm:w-auto`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download {doc.name}
                                    </a>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                                <h3 className="text-xl font-bold text-primary mb-4">Ready to Apply?</h3>
                                <p className="text-gray-600 mb-6">
                                    Create an account to submit your membership application online
                                </p>
                                <Link href="/login" className="btn btn-accent">
                                    Create Account →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
