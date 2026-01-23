import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/home/AboutSection';
import HistorySection from '@/components/home/HistorySection';
import { AboutContent } from '@/types/cms';

export const metadata: Metadata = {
    title: 'About Us - SOOOP',
    description: 'Learn about the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 3600;

export default async function AboutPage() {
    const supabase = createStaticClient();
    const { data: page } = await supabase.from('pages').select('content').eq('slug', 'about').single();

    // Default fallback (though DB should have it now)
    const content = page?.content?.about || {
        title: "Pioneering Vision Sciences Since 2009",
        description: "The Society of Optometrists, Orthoptists and Ophthalmic Technologists, Pakistan (SOOOP) is the leading professional body...",
        points: [],
        image: "/images/conference_event_hall.png",
        years_count: "15+",
        years_text: "Years of Dedicated Service"
    };

    const hero = page?.content?.hero || { title: "About **SOOOP**", subtitle: "The comprehensive representative body of vision care professionals in Pakistan" };

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
                        <span className="badge bg-accent text-white mb-4">Who We Are</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {renderTitle(hero.title)}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                <AboutSection content={content} />
                <HistorySection />
            </main>
            <Footer />
        </>
    );
}
