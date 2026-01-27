"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Download, ArrowRight, BookOpen } from "lucide-react";
import { ResourcesContent } from "@/types/cms";


type ResourcesSectionProps = {
    content?: ResourcesContent | null;
}

export default function ResourcesSection({ content }: ResourcesSectionProps) {
    const defaultResources = [
        { title: "Standard Clinical Guidelines 2024", type: "PDF", size: "2.5 MB" },
        { title: "Optometry Code of Conduct", type: "PDF", size: "1.2 MB" },
        { title: "Membership Application Form", type: "PDF", size: "0.8 MB" },
    ];

    const resources = content?.items || defaultResources;
    const { badge, title, description, journal_image } = {
        badge: "Knowledge Hub",
        title: content?.heading || "Pakistan Journal of Vision Sciences",
        description: content?.subheading || "Stay at the forefront of ophthalmic research. Our quarterly journal features peer-reviewed studies, clinical case reports, and latest advancements in vision care from Pakistan and around the globe.",
        journal_image: content?.journal_image || "/images/journal_cover_pakistan_v2.webp"
    };

    return (
        <section className="py-20 md:py-32 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Journal Feature Side */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                            {/* 3D Journal Mockup Effect */}
                            <div className="relative w-[300px] md:w-[400px] h-[450px] md:h-[600px] mx-auto shadow-2xl rounded-r-2xl">
                                <Image
                                    src={journal_image}
                                    alt="Pakistan Journal of Vision Sciences"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Background Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-accent/10 transition-colors duration-500"></div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 text-accent font-bold tracking-wider uppercase text-sm">
                                <BookOpen className="w-5 h-5" />
                                <span>{badge}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-primary-900 leading-tight">
                                {title}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-primary/30">
                                <Download className="w-5 h-5 mr-2" />
                                Latest Issue
                            </button>
                            <Link
                                href="/resources"
                                className="inline-flex items-center px-6 py-3 border-2 border-primary-100 text-primary font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                View Archive
                            </Link>
                        </div>

                        {/* Quick Downloads List */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h4 className="font-bold text-primary-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-accent" /> Essential Downloads
                            </h4>
                            <ul className="space-y-3">
                                {resources.map((res, idx) => (
                                    <li key={idx} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 mr-3 group-hover:bg-accent transition-colors"></div>
                                            <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">{res.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">{res.type}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                                <Link href="/dashboard/documents" className="text-sm font-semibold text-accent hover:text-accent-700 inline-flex items-center">
                                    Access Member Portal for more <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
