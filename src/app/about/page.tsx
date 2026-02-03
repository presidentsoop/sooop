"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/home/AboutSection';
import HistorySection from '@/components/home/HistorySection';





// Static hero content
const heroContent = {
    title: "About **SOOOP**",
    subtitle: "The comprehensive representative body of vision care professionals in Pakistan"
};

export default function AboutPage() {
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
                <section className="bg-gradient-primary py-16 md:py-24">
                    <div className="container text-center">
                        <span className="badge bg-accent text-white mb-4">Who We Are</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {renderTitle(heroContent.title)}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            {heroContent.subtitle}
                        </p>
                    </div>
                </section>

                <AboutSection />
                <HistorySection />
            </main>
            <Footer />
        </>
    );
}
