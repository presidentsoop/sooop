"use client";

import { Users, Calendar, Award, Globe, type LucideIcon } from "lucide-react";

import { StatItem } from "@/types/cms";

const IconMap: Record<string, LucideIcon> = {
    Users,
    Calendar,
    Award,
    Globe
};

const defaultStats: StatItem[] = [
    {
        id: "1",
        label: "Active Members",
        value: "300+",
        icon: "Users",
        description: "Vision care professionals",
    },
    {
        id: "2",
        label: "Years Service",
        value: "15+",
        icon: "Award",
        description: "Serving the community since 2009",
    },
    {
        id: "3",
        label: "Intl. Conf.",
        value: "06",
        icon: "Globe",
        description: "Global knowledge exchange",
    },
    {
        id: "4",
        label: "Events Done",
        value: "50+",
        icon: "Calendar",
        description: "Workshops and seminars",
    },
];

export default function ImpactStats({ content }: { content?: StatItem[] | null }) {
    const stats = Array.isArray(content) ? content : defaultStats;

    return (
        <section className="py-8 md:py-12 bg-white relative z-20 -mt-4 md:-mt-8">
            <div className="container mx-auto px-4">
                {/* Mobile: Grid cols 2 (2x2), Desktop: Grid cols 4 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {stats.map((stat) => {
                        const IconComponent = IconMap[stat.icon] || Users;
                        return (
                            <div
                                key={stat.id}
                                className="bg-white rounded-xl p-4 md:p-6 shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-gray-100 group flex flex-col justify-between h-full"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 md:mb-4 gap-2">
                                    <div className={`p-2 md:p-3 w-fit rounded-lg bg-primary-50 text-primary-600 transition-transform group-hover:scale-110`}>
                                        <IconComponent className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    <span className={`text-2xl md:text-4xl font-bold text-primary-900 font-heading`}>
                                        {stat.value}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-0.5 md:mb-1 whitespace-nowrap md:whitespace-normal">
                                        {stat.label}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500 hidden md:block">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
