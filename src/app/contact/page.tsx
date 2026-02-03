import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: 'Contact Us - SOOOP',
    description: 'Get in touch with the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
    alternates: {
        canonical: '/contact',
    },
};

export const revalidate = 3600;

// Static content - no database calls
const staticContent = {
    hero: {
        title: "Contact **Us**",
        subtitle: "Have questions? We'd love to hear from you."
    },
    info: {
        address: "SOOOP House\nCollege of Ophthalmology and Allied Vision Sciences\nKing Edward Medical University\nLahore, Pakistan",
        phone: "+92-332-4513876",
        email: "info@sooopvision.com"
    }
};

export default function ContactPage() {
    const addressLines = staticContent.info.address.split('\n');

    const renderBold = (text: string) => {
        return text.split(/(\*\*.*?\*\*)/).map((part, index) =>
            part.startsWith('**') && part.endsWith('**') ?
                <span key={index} className="text-accent">{part.slice(2, -2)}</span> :
                part
        );
    };

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Get in Touch</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {renderBold(staticContent.hero.title)}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {staticContent.hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {/* Contact Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-6">Get in Touch</h2>
                                <p className="text-gray-600 mb-8">
                                    Feel free to reach out to us for any inquiries about membership, events, or general information about SOOOP.
                                </p>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                                            <p className="text-gray-600">
                                                {addressLines.map((line, i) => (
                                                    <span key={i} className="block">{line}</span>
                                                ))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                                            <a href={`tel:${staticContent.info.phone.replace(/[^0-9]/g, '')}`} className="text-gray-600 hover:text-primary">
                                                {staticContent.info.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                            <a href={`mailto:${staticContent.info.email}`} className="text-gray-600 hover:text-primary">
                                                {staticContent.info.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="card">
                                <h2 className="text-2xl font-bold text-primary mb-6">Send us a Message</h2>
                                <form className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Full Name</label>
                                            <input type="text" className="input" placeholder="Your name" required />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input type="email" className="input" placeholder="your@email.com" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Subject</label>
                                        <input type="text" className="input" placeholder="How can we help?" required />
                                    </div>
                                    <div>
                                        <label className="label">Message</label>
                                        <textarea className="textarea" rows={5} placeholder="Your message..." required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">
                                        Send Message
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
