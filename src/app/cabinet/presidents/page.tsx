import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Previous Presidents - SOOOP',
    description: 'Explore the history of SOOOP leadership through our previous presidents.',
};

const presidents = [
    { year: '2021 - Present', name: 'Ayesha Saleem', current: true },
    { year: '2019', name: 'Mahar Safdar Ali Qasim', current: false },
    { year: '2017', name: 'Imran Khalid Bhutta', current: false },
    { year: '2016', name: 'Sara Khan', current: false },
    { year: '2015', name: 'Ayesha Sarfraz', current: false },
    { year: '2014', name: 'Ayesha Saleem', current: false },
];

export default function PresidentsPage() {
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
                            Previous <span className="text-accent">Presidents</span>
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl mx-auto">
                            A timeline of SOOOP leadership through the years
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
                                {presidents.map((president, index) => (
                                    <div key={index} className="relative">
                                        {/* Dot */}
                                        <div className={`absolute -left-8 md:-left-12 top-1 w-6 h-6 rounded-full border-4 border-white shadow-lg ${president.current ? 'bg-accent' : 'bg-primary'}`}></div>

                                        {/* Content */}
                                        <div className={`card ${president.current ? 'border-2 border-accent' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className={`text-lg font-bold ${president.current ? 'text-accent' : 'text-primary'}`}>
                                                        {president.year}
                                                    </div>
                                                    <div className="text-gray-900 font-medium">{president.name}</div>
                                                </div>
                                                {president.current && (
                                                    <span className="badge badge-accent ml-auto">Current</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
