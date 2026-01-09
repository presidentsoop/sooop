'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
    { src: '/slider/slide-01.jpg', alt: 'SOOOP Event 1' },
    { src: '/slider/slide-02.jpg', alt: 'SOOOP Event 2' },
    { src: '/slider/slide-03.jpg', alt: 'SOOOP Event 3' },
    { src: '/slider/slide-04.jpg', alt: 'SOOOP Event 4' },
];

export default function ImageSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="section bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="section-title">Our <span className="text-accent">Gallery</span></h2>
                    <p className="section-subtitle mx-auto">
                        Glimpses from our events, conferences, and community activities
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Slider Container */}
                    <div className="relative h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-soft-xl bg-gray-100">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    fill
                                    className="object-contain"
                                    priority={index === 0}
                                />
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:bg-white hover:scale-110 transition-all z-10"
                            aria-label="Previous slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:bg-white hover:scale-110 transition-all z-10"
                            aria-label="Next slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'bg-primary w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
