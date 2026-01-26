"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, Quote } from "lucide-react";
import { TestimonialsContent, TestimonialItem } from "@/types/cms";


type TestimonialsSectionProps = {
    content?: TestimonialsContent | null;
}

export default function TestimonialsSection({ content }: TestimonialsSectionProps) {
    const defaultTestimonials = [
        {
            id: 1,
            name: "Dr. Ayesha Khan",
            role: "Senior Optometrist, Lahore",
            image: "/images/portrait_pakistani_female_dr.png",
            quote: "SOOOP has been instrumental in my professional growth. The conferences provide world-class learning opportunities right here in Pakistan.",
            rating: 5,
        },
        {
            id: 2,
            name: "Dr. Bilal Ahmed",
            role: "Ophthalmologist & Researcher",
            image: "/images/portrait_pakistani_male_dr.png",
            quote: "The networking opportunities through SOOOP are unmatched. I found my research partners through their annual meetup.",
            rating: 5,
        },
        {
            id: 3,
            name: "Prof. Dr. Haroon",
            role: "Vision Scientist",
            image: "/images/testimonial_pakistani_researcher.png",
            quote: "Standardizing optometry education was a dream that SOOOP turned into reality. Proud to be part of this change.",
            rating: 5,
        },
    ];

    const testimonials = content?.items || defaultTestimonials;
    const { badge, title } = {
        badge: "Community Voices",
        title: content?.heading || "What Our Members Say"
    };

    return (
        <section className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />
                <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="text-accent font-bold tracking-wider uppercase text-sm">{badge}</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-primary-900 leading-tight">
                        {title}
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial: TestimonialItem) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
    const [imgSrc, setImgSrc] = useState(testimonial.image && testimonial.image.startsWith('/') ? testimonial.image : '/images/portrait_pakistani_male_dr.png');

    return (
        <div
            className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-soft-xl transition-all duration-300 relative group border border-gray-100"
        >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-gray-200 group-hover:text-accent/20 transition-colors">
                <Quote className="w-10 h-10 fill-current" />
            </div>

            <div className="flex items-center gap-1 mb-6 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                ))}
            </div>

            <blockquote className="text-gray-600 mb-8 text-lg italic leading-relaxed">
                "{testimonial.quote}"
            </blockquote>

            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-50">
                    <Image
                        src={imgSrc}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        onError={() => setImgSrc('/images/portrait_pakistani_male_dr.png')}
                    />
                </div>
                <div>
                    <h4 className="font-bold text-primary-900 text-lg leading-tight">
                        {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );
}
