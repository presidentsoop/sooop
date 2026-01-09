import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/home/AboutSection';
import { AboutContent } from '@/types/cms';

export const metadata: Metadata = {
    title: 'About Us - SOOOP',
    description: 'Learn about the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

const defaultContent: AboutContent = {
    title: "Pioneering Vision Sciences Since 2009",
    description: "The Society of Optometrists, Orthoptists and Ophthalmic Technologists, Pakistan (SOOOP) is the leading professional body representing vision care specialists. Dedicated to advancing the science and practice of optometry.",
    points: [
        "Promoting uniform education standards",
        "Advocating for service structure",
        "Filtering quackery from the field",
        "Organizing international conferences"
    ],
    image: "/images/conference_event_hall.png",
    years_count: "15+",
    years_text: "Years of Dedicated Service"
};

export default function AboutPage() {
    const content = defaultContent;

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Who We Are</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            About <span className="text-accent">SOOOP</span>
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            The comprehensive representative body of vision care professionals in Pakistan
                        </p>
                    </div>
                </section>

                <AboutSection content={content} />
            </main>
            <Footer />
        </>
    );
}
