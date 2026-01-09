import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
interface EventItem {
    title: string;
    date: string;
    location: string;
    description: string;
    featured?: boolean;
}

interface EventsPageContent {
    upcoming: EventItem[];
    past: EventItem[];
}

export const metadata: Metadata = {
    title: 'Events - SOOOP',
    description: 'Discover upcoming and past events organized by the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

const defaultContent: EventsPageContent = {
    upcoming: [
        {
            title: '6th International Conference on Vision Sciences',
            date: 'May 23-24, 2025',
            location: 'Avari Hotel, Lahore',
            description: 'Join us for the premier vision sciences conference in Pakistan featuring renowned speakers, workshops, and networking opportunities.',
            featured: true,
        },
        {
            title: 'General Election 2025',
            date: 'May 2025',
            location: 'SOOOP House, Lahore',
            description: 'SOOOP General Election for the new executive committee.',
            featured: false,
        },
    ],
    past: [
        {
            title: 'Annual General Meeting',
            date: 'December 15, 2024',
            location: 'SOOOP House, Lahore',
            description: 'Annual meeting to discuss organizational progress and future plans.',
        },
        {
            title: '5th International Conference on Vision Sciences',
            date: 'May 2024',
            location: 'Avari Hotel, Lahore',
            description: 'Successful conference with over 300 attendees from across the country.',
        },
        {
            title: 'Clinical Meeting',
            date: 'March 2024',
            location: 'COAVS, KEMU, Lahore',
            description: 'Clinical case discussions and presentations by members.',
        },
    ]
};

export default function EventsPage() {
    const content = defaultContent;

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Stay Updated</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Our <span className="text-accent">Events</span>
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            Join us at conferences, workshops, and professional development events
                        </p>
                    </div>
                </section>

                {/* Upcoming Events */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="mb-12">
                            <h2 className="section-title">Upcoming <span className="text-accent">Events</span></h2>
                            <p className="section-subtitle">Don't miss these upcoming opportunities</p>
                        </div>

                        <div className="space-y-6">
                            {content.upcoming.map((event, index) => (
                                <div
                                    key={index}
                                    className={`card ${event.featured ? 'border-2 border-accent bg-accent/5' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Date Badge */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center ${event.featured ? 'bg-accent text-white' : 'bg-primary/10 text-primary'}`}>
                                                <span className="text-2xl font-bold">
                                                    {event.date.split(' ').some(p => !isNaN(parseInt(p))) ? event.date.match(/(\d+)/)?.[0] || 'TBD' : 'TBD'}
                                                </span>
                                                <span className="text-sm font-medium text-center px-1">
                                                    {event.date.split(' ').slice(0, 3).join(' ')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                                                {event.featured && (
                                                    <span className="badge badge-accent">Featured</span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-3">{event.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {event.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="flex-shrink-0">
                                            <button className={`btn ${event.featured ? 'btn-accent' : 'btn-outline'}`}>
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Past Events */}
                <section className="section bg-gray-50">
                    <div className="container">
                        <div className="mb-12">
                            <h2 className="section-title">Past <span className="text-accent">Events</span></h2>
                            <p className="section-subtitle">A look back at our successful gatherings</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {content.past.map((event, index) => (
                                <div key={index} className="card card-hover">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {event.date}
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-2">{event.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {event.location}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
