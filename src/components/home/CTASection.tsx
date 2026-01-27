"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { CTAContent } from "@/types/cms";

type CTASectionProps = {
    content?: CTAContent | null;
}

export default function CTASection({ content }: CTASectionProps) {
    const defaultContent = {
        heading: "Ready to Elevate Your Professional Journey?",
        subheading: "Join the elite community of vision care experts. Empower your practice and expand your network.",
        button_text: "Become a Member",
        button_link: "/signup",
        secondary_text: "Contact Support", // Not in CMS type yet, keep default or add
        secondary_link: "/contact"
    };

    // Use CMS heading if available, otherwise default.
    // We remove title_line1 separation logic for simplicity with CMS text input.
    const heading = content?.heading || defaultContent.heading;
    const description = content?.subheading || defaultContent.subheading;
    const button_text = content?.button_text || defaultContent.button_text;
    const button_link = content?.button_link || defaultContent.button_link;
    const secondary_text = defaultContent.secondary_text;
    const secondary_link = defaultContent.secondary_link;

    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/textured_background_navy.webp"
                    alt="Background Texture"
                    fill
                    className="object-cover"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-primary-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800/80"></div>
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        {heading}
                    </h2>

                    <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed px-4">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4 px-8 md:px-0">
                        <Link
                            href={button_link}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-primary-900 transition-all duration-300 bg-white rounded-full hover:bg-teal-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            {button_text}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>

                        <Link
                            href={secondary_link}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold text-white transition-all duration-300 border-2 border-white/20 rounded-full hover:bg-white/10 hover:border-white/40"
                        >
                            {secondary_text}
                        </Link>
                    </div>

                    <p className="text-sm text-blue-200 mt-6 md:mt-8">
                        Already a member? <Link href="/login" className="text-white underline hover:text-teal-300">Log in here</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
