"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BenefitsContent, BenefitItem } from "@/types/cms";

type BenefitsSectionProps = {
    content?: BenefitsContent | null;
}

export default function BenefitsSection({ content }: BenefitsSectionProps) {
    const defaultBenefits: BenefitItem[] = [
        {
            id: 1,
            title: "Networking",
            description: "Connect with over 300 vision care professionals.",
            image: "/images/benefit_illustration_networking.png",
            link: "/membership",
        },
        {
            id: 2,
            title: "Research", // Shortened title for mobile
            description: "Access research grants and publish in our journal.",
            image: "/images/benefit_illustration_research.png",
            link: "/resources",
        },
        {
            id: 3,
            title: "Education",
            description: "Workshops, seminars, and webinars.",
            image: "/images/benefit_illustration_learning.png",
            link: "/events",
        },
        {
            id: 4,
            title: "Career Ops",
            description: "Guidance on career paths and jobs.",
            image: "/images/benefit_illus_career.png",
            link: "/membership",
        },
        {
            id: 5,
            title: "Conferences",
            description: "Discounted access to international events.",
            image: "/images/benefit_illus_conference.png",
            link: "/events",
        },
        {
            id: 6,
            title: "Library",
            description: "Unlimited access to digital journals.",
            image: "/images/benefit_illus_journal_v2.png",
            link: "/resources",
        },
    ];

    const benefits = content?.items || defaultBenefits;
    const { badge, title, description } = {
        badge: "Membership Benefits",
        title: content?.heading || "Why Join SOOOP?",
        description: content?.subheading || "Elevate your professional journey with exclusive resources."
    };

    return (
        <section className="py-12 md:py-32 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3 md:space-y-4">
                    <span className="text-accent font-bold tracking-wider uppercase text-xs md:text-sm">{badge}</span>
                    <h2 className="text-2xl md:text-5xl font-bold text-primary-900 leading-tight">
                        {title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-600">
                        {description}
                    </p>
                </div>

                {/* Mobile: 2 col, Desktop: 3 col */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {benefits.map((benefit: BenefitItem, index: number) => (
                        <div
                            key={benefit.id || index}
                            className="group bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-soft hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col"
                        >
                            {/* Image Area - Smaller on mobile */}
                            <div className="relative h-24 md:h-48 w-full mb-4 md:mb-6 bg-gray-50 rounded-xl overflow-hidden group-hover:bg-blue-50/50 transition-colors">
                                <Image
                                    src={benefit.image || '/images/benefit_illustration_networking.png'}
                                    alt={benefit.title}
                                    fill
                                    className="object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-1 md:space-y-3 relative z-10 flex-1">
                                <h3 className="text-sm md:text-xl font-bold text-primary-900 group-hover:text-primary transition-colors">
                                    {benefit.title}
                                </h3>
                                <p className="text-xs md:text-base text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {benefit.description}
                                </p>

                                <div className="pt-2 md:pt-4 mt-auto">
                                    <Link
                                        href={benefit.link || '#'}
                                        className="inline-flex items-center text-xs md:text-sm font-semibold text-accent hover:text-accent-700 transition-colors"
                                    >
                                        Details <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 md:mt-16 text-center">
                    <Link
                        href="/membership"
                        className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold text-white transition-all duration-200 bg-primary rounded-lg hover:bg-primary-600 hover:shadow-lg shadow-primary/25 active:scale-95"
                    >
                        Explore Membership
                    </Link>
                </div>
            </div>
        </section>
    );
}
