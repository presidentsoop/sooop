"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin } from "lucide-react";

import { LeadershipContent, LeadershipItem } from "@/types/cms";

type LeadershipSectionProps = {
    content?: LeadershipContent | null;
}

export default function LeadershipSection({ content }: LeadershipSectionProps) {
    const defaultMembers = [
        {
            name: "Prof. Dr. Asad Aslam",
            role: "Patron in Chief",
            image: "/patron-chief-asad-khan.jpg",
            bio: "Dedicated to advancing eye care and supporting the next generation of vision professionals.",
        },
        {
            name: "Mr. Muhammad Ajmal",
            role: "President",
            image: "/president-muhammad-ajmal.jpg",
            bio: "Committed to uniting our professions and elevating standards of vision care across Pakistan.",
        },
        {
            name: "Mr. Ahmed Kamal",
            role: "General Secretary",
            image: "/secretary-ahmed-kamal.jpg",
            bio: "Striving for excellence in education, research, and public awareness in vision sciences.",
        },
    ];

    const leaders = content?.items || defaultMembers;
    const { badge, title, description } = {
        badge: "Our Leadership",
        title: content?.heading || "Meet the Executive Cabinet",
        description: content?.subheading || "Guided by distinguished professionals committed to vision sciences."
    };

    return (
        <section className="py-12 md:py-32 bg-white relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3 md:space-y-4">
                    <span className="text-accent font-bold tracking-wider uppercase text-xs md:text-sm">{badge}</span>
                    <h2 className="text-2xl md:text-5xl font-bold text-primary-900 leading-tight">
                        {title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 px-4">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {leaders.map((leader: LeadershipItem, index: number) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-gray-100 max-w-sm mx-auto sm:max-w-none w-full"
                        >
                            {/* Image Container - Adjusted aspect ratio for mobile */}
                            <div className="relative h-64 sm:h-72 md:h-80 w-full bg-gray-100 overflow-hidden">
                                <Image
                                    src={leader.image || '/images/avatar_placeholder.png'}
                                    alt={leader.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Overlay only visible on hover (desktop) or always slight gradient (mobile) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <div className="flex gap-4">
                                        <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6 text-center space-y-2 relative bg-white">
                                <h3 className="font-bold text-lg md:text-xl text-primary-900 line-clamp-1 group-hover:text-primary transition-colors">
                                    {leader.name}
                                </h3>
                                <p className="text-accent font-medium text-xs md:text-sm border-b border-gray-100 pb-2 inline-block">
                                    {leader.role}
                                </p>
                                {/* Bio hidden on mobile to save space, visible on desktop */}
                                <p className="text-gray-500 text-sm pt-2 line-clamp-2">
                                    {leader.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 md:mt-12 text-center">
                    <Link
                        href="/cabinet/members"
                        className="inline-flex items-center font-semibold text-sm md:text-base text-primary hover:text-primary-700 transition-colors group"
                    >
                        View Full Cabinet <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
