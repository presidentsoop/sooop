import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { HeroContent, StatItem } from "@/types/cms";

type HeroSectionProps = {
    content?: HeroContent | null;
};

export default async function HeroSection({ content: propContent }: HeroSectionProps) {
    // If content is passed (e.g. from parent page), use it. otherwise fetch it.
    // For now we assume this is a Server Component or we can fetch in a useEffect if client side.
    // But HeroSection was "use client"; let's turn it into Server Component if possible,
    // OR fetch data inside it. 
    // Since "use client" was just for 'animate-marquee' or interactions? 
    // Actually the marquee is CSS-based. "use client" is likely default or needed for something else?
    // Wait, the previous file had "use client". 
    // To be truly dynamic from a Server Component perspective (Next.js 13+), 
    // it is better to fetch data in the PARENT Page and pass it down.
    // However, to standalone this, let's keep it simple.

    // Default Fallback Content
    const defaultContent: HeroContent = {
        title: "Advancing **Eye Care Excellence** Together",
        description: "Join Pakistan's premier society for optometrists, orthoptists, and vision scientists. Dedicated to professional growth and innovation.",
        announcement: "📢 6th International Conference on Vision Sciences; May 2025 • 🗳️ General Election May 2025",
        stats: []
    };

    const content = propContent || defaultContent;

    // Helper to render bold text from **markdown** style simple syntax
    const renderTitle = (text: string) => {
        const parts = text.split("**");
        return parts.map((part, i) =>
            i % 2 === 1 ? <span key={i} className="text-primary-500">{part}</span> : part
        );
    };

    // Construct marquee string (repeated for seamless flow)
    const marqueeText = Array(4).fill(content.announcement).join(" • ");

    return (
        <section className="relative w-full overflow-hidden bg-white pt-10 md:pt-0">
            {/* Announcement Marquee - Dynamic */}
            <div className="absolute top-0 left-0 w-full bg-primary-900 text-white z-20 py-2 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap inline-block">
                    <span className="mx-4 font-medium text-sm md:text-base">{marqueeText}</span>
                </div>
            </div>

            {/* Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/50 z-0" />

            <div className="container relative z-10 mx-auto px-4 py-8 md:py-16 lg:py-32">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="flex flex-col justify-center space-y-6 md:space-y-8 animate-fade-in order-2 lg:order-1 text-center lg:text-left">
                        <div className="space-y-3 md:space-y-4">
                            <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs md:text-sm font-medium text-accent-700 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
                                Leading Voice of Vision Sciences in Pakistan
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-primary-900 text-balance leading-tight">
                                {renderTitle(content.title)}
                            </h1>

                            <p className="max-w-[600px] mx-auto lg:mx-0 text-base md:text-lg text-gray-600 md:text-xl leading-relaxed">
                                {content.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href="/membership"
                                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold text-white transition-all duration-200 bg-primary rounded-lg hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25 active:scale-95 group"
                            >
                                Become a Member
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold text-primary transition-all duration-200 bg-white border-2 border-primary-100 rounded-lg hover:bg-primary-50 hover:border-primary-200 active:scale-95"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="pt-6 md:pt-8 border-t border-gray-200">
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg lg:bg-transparent lg:p-0">
                                <div className="flex items-center gap-2 border-r pr-4 border-gray-300 lg:border-none lg:pr-0">
                                    <Users className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                    <span><span className="font-semibold text-primary-900">300+</span> Members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                    <span><span className="font-semibold text-primary-900">15Y</span> Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative order-1 lg:order-2 animate-slide-up mb-4 lg:mb-0">
                        {/* Decorative Background Element */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 md:w-64 md:h-64 bg-accent/10 rounded-full blur-3xl" />

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-white aspect-[4/3] md:aspect-auto">
                            <Image
                                src="/images/hero_pakistani_medical_group.png"
                                alt="Pakistani Vision Care Professionals Team"
                                width={800}
                                height={600}
                                className="object-cover w-full h-full transform transition-transform duration-700 hover:scale-105"
                                priority
                            />

                            {/* Floating Badge */}
                            <div className="hidden sm:block absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border border-white/50 max-w-xs animate-fade-in delay-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm font-semibold text-gray-900">Verified Body</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">Govt Recognized</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
