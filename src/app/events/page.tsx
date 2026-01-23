import { createClient } from "@/lib/supabase/server";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Events - SOOOP',
    description: 'Discover upcoming and past events organized by the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

export default async function EventsPage() {
    const supabase = await createClient();

    // Fetch all events
    // Fetch CMS Content & Events in parallel
    const [pageRes, eventsRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'events').single(),
        supabase.from('events').select('*').order('start_date', { ascending: true })
    ]);

    const filesContent = pageRes.data?.content || {};
    const hero = filesContent.hero || { title: "Our Events", subtitle: "Join us at conferences, workshops, and professional development events" };
    const events = eventsRes.data || [];

    const currentDate = new Date();

    // Split into Upcoming and Past
    const upcomingEvents = (events || []).filter(e => new Date(e.start_date) >= currentDate);
    const pastEvents = (events || []).filter(e => new Date(e.start_date) < currentDate).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()); // Descending for past

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Stay Updated</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {hero.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {hero.subtitle}
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

                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-6">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`card ${event.is_featured ? 'border-2 border-accent bg-accent/5' : ''}`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Date Badge */}
                                            <div className="flex-shrink-0">
                                                <div className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center ${event.is_featured ? 'bg-accent text-white' : 'bg-primary/10 text-primary'}`}>
                                                    <span className="text-2xl font-bold">
                                                        {format(new Date(event.start_date), 'dd')}
                                                    </span>
                                                    <span className="text-sm font-medium text-center px-1 uppercase">
                                                        {format(new Date(event.start_date), 'MMM')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                                                    {event.is_featured && (
                                                        <span className="badge badge-accent">Featured</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-3">{event.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {format(new Date(event.start_date), 'MMMM d, yyyy')}
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
                                                <button className={`btn ${event.is_featured ? 'btn-accent' : 'btn-outline'}`}>
                                                    Learn More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">No upcoming events scheduled at the moment.</p>
                            </div>
                        )}
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
                            {(pastEvents || []).map((event) => (
                                <div key={event.id} className="card card-hover">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {format(new Date(event.start_date), 'MMMM d, yyyy')}
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">{event.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{event.description}</p>
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
