import Link from 'next/link';

const links = [
    {
        title: 'Membership',
        description: 'Join our community of vision care professionals and access exclusive benefits.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        href: '/membership',
        color: 'from-primary to-primary-600',
    },
    {
        title: 'Events',
        description: 'Discover upcoming conferences, workshops, and professional development events.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        href: '/events',
        color: 'from-accent to-accent-600',
    },
    {
        title: 'Cabinet',
        description: 'Meet our leadership team and explore our organizational structure.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        href: '/cabinet',
        color: 'from-primary-700 to-primary-900',
    },
    {
        title: 'Contact',
        description: 'Get in touch with us for inquiries, feedback, or collaboration opportunities.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        href: '/contact',
        color: 'from-accent-600 to-accent-800',
    },
];

export default function QuickLinks() {
    return (
        <section className="section bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="section-title">Explore <span className="text-accent">SOOOP</span></h2>
                    <p className="section-subtitle mx-auto">
                        Discover all that we have to offer for vision care professionals
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-soft hover:shadow-soft-xl transition-all duration-300"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Content */}
                            <div className="relative p-8">
                                <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all">
                                    {link.icon}
                                </div>
                                <h3 className="text-xl font-bold text-primary group-hover:text-white transition-colors mb-3">
                                    {link.title}
                                </h3>
                                <p className="text-gray-600 group-hover:text-white/90 transition-colors text-sm leading-relaxed">
                                    {link.description}
                                </p>
                                <div className="mt-6 flex items-center text-primary group-hover:text-white font-medium text-sm">
                                    Learn More
                                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
