import Link from 'next/link';
import Image from 'next/image';

const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/membership', label: 'Membership' },
    { href: '/events', label: 'Events' },
    { href: '/cabinet', label: 'Cabinet' },
];

const resourceLinks = [
    { href: '/membership-form.pdf', label: 'Membership Form' },
    { href: '/membership-oath.pdf', label: 'SOOOP Oath' },
    { href: '/cabinet/nomination', label: 'Nomination Fees' },
    { href: '/contact', label: 'Contact Us' },
];

export default function Footer() {
    return (
        <footer className="bg-primary text-white">
            {/* Main Footer */}
            <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-2 rounded-xl">
                                <Image
                                    src="/logo.png"
                                    alt="SOOOP Logo"
                                    width={50}
                                    height={50}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold">SOOOP</span>
                        </Link>
                        <p className="text-primary-100 text-sm leading-relaxed">
                            Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.
                            Advancing eye care since 2009.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-accent">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-primary-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-accent">Resources</h4>
                        <ul className="space-y-3">
                            {resourceLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-primary-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-accent">Contact Us</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-primary-100">
                                    SOOOP House, College of Ophthalmology and Allied Vision Sciences, Lahore, Pakistan
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+923324513876" className="text-primary-100 hover:text-white">
                                    +92-332-4513876
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:info@sooopvision.org" className="text-primary-100 hover:text-white">
                                    info@sooopvision.org
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary-400">
                <div className="container py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-primary-200 text-sm">
                            © {new Date().getFullYear()} SOOOP. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-primary-200">
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
