import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { AboutContent } from "@/types/cms";

export default function AboutSection({ content }: { content?: AboutContent }) {
    // Adapter for backward compatibility or default values
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

    const data = content ? {
        title: content.title || defaultContent.title,
        description: content.description || defaultContent.description,
        points: content.points || defaultContent.points,
        image: content.image || defaultContent.image,
        years_count: content.years_count || defaultContent.years_count,
        years_text: content.years_text || defaultContent.years_text
    } : defaultContent;

    return (
        <section className="py-12 md:py-32 bg-gray-50 overflow-hidden relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
                <Image
                    src="/images/abstract_cta_background_v2.png"
                    alt="background"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Content Side */}
                    <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                        <div className="space-y-3 md:space-y-4">
                            <span className="text-accent font-bold tracking-wider uppercase text-xs md:text-sm">About SOOOP</span>
                            <h2 className="text-2xl md:text-5xl font-bold text-primary-900 leading-tight">
                                {data.title}
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed text-justify">
                                {data.description}
                            </p>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {data.points.map((point, index) => (
                                <div key={index} className="flex items-start gap-3 group">
                                    <div className="mt-1 min-w-[20px] md:min-w-[24px] h-5 w-5 md:h-6 md:w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary group-hover:text-white" />
                                    </div>
                                    <p className="text-sm md:text-base text-gray-700 font-medium">{point}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 md:pt-4">
                            <Link
                                href="/about"
                                className="inline-flex items-center text-sm md:text-base text-primary-600 font-semibold hover:text-primary transition-colors group"
                            >
                                Read our full history
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative order-1 lg:order-2 mb-6 lg:mb-0">
                        <div className="relative h-[300px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-xl md:shadow-2xl">
                            <div className="absolute inset-0 bg-primary-900/10 z-10"></div>
                            <Image
                                src={data.image}
                                alt="SOOOP Leadership Team"
                                fill
                                className="object-cover"
                            />

                            {/* Overlay Card - Simplified for mobile */}
                            <div className="absolute bottom-4 right-4 left-4 md:bottom-10 md:right-10 md:left-10 bg-white/95 backdrop-blur border border-white/20 p-4 md:p-8 rounded-xl shadow-lg z-20">
                                <div className="flex flex-col gap-1 md:gap-2 text-center md:text-left">
                                    <p className="text-2xl md:text-4xl font-bold text-accent font-heading">{data.years_count}</p>
                                    <p className="font-semibold text-primary-900 text-sm md:text-lg">{data.years_text}</p>
                                    <p className="text-xs md:text-sm text-gray-500 hidden md:block">Founded by Prof. Dr. Haroon Awan and Dr. Naeem Zafar</p>
                                </div>
                            </div>
                        </div>

                        {/* Geometric Decoration - Hidden on mobile */}
                        <div className="hidden md:block absolute -z-10 -bottom-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
                        <div className="hidden md:block absolute -z-10 -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-2xl"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}
