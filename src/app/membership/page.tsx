import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Users, Ticket, BookOpen, Coins, Contact, Check } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Membership - SOOOP',
    description: 'Join the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan. Access professional development, networking, and exclusive member benefits.',
};

// Static content - no database calls
const staticContent = {
    hero: {
        title: "Become a **Member**",
        subtitle: "Join the leading society of vision care professionals in Pakistan and unlock exclusive benefits."
    },
    benefits: [
        { id: 1, title: "Professional Network", description: "Connect with over 300 vision care professionals across Pakistan.", icon: Users },
        { id: 2, title: "Conference Access", description: "Discounted access to international conferences and workshops.", icon: Ticket },
        { id: 3, title: "Educational Resources", description: "Access to journals, webinars, and continuing education materials.", icon: BookOpen },
        { id: 4, title: "Research Grants", description: "Apply for research funding and publication opportunities.", icon: BookOpen },
        { id: 5, title: "Career Support", description: "Job listings, career guidance, and mentorship programs.", icon: Coins },
        { id: 6, title: "Government Advocacy", description: "Representation in policy matters affecting the profession.", icon: Contact },
    ],
    types: [
        {
            type: "Student",
            fee: "Rs. 500",
            description: "For enrolled optometry students",
            features: ["Conference discounts", "Study materials", "Mentorship access", "Student network"],
            popular: false
        },
        {
            type: "Professional",
            fee: "Rs. 2,000",
            description: "For practicing optometrists",
            features: ["Full conference access", "Voting rights", "All resources", "Career portal", "Research grants"],
            popular: true
        },
        {
            type: "Lifetime",
            fee: "Rs. 15,000",
            description: "One-time payment forever",
            features: ["All professional benefits", "Lifetime access", "Honorary recognition", "Priority registration"],
            popular: false
        }
    ],
    downloads: [
        { name: "Membership Form", url: "/membership-form.pdf" },
        { name: "Oath Document", url: "/membership-oath.pdf" }
    ]
};

const Icons = [Users, Ticket, BookOpen, BookOpen, Coins, Contact];

export default function MembershipPage() {
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
                            {renderTitle(staticContent.hero.title)}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {staticContent.hero.subtitle}
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
                            {staticContent.benefits.map((benefit, index) => {
                                const Icon = Icons[index % Icons.length];
                                return (
                                    <div key={benefit.id} className="card card-hover group">
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
                            {staticContent.types.map((membership, index) => (
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
                                        {membership.features.map((feature, i) => (
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
                                {staticContent.downloads.map((doc, i) => (
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
