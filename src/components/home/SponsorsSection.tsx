"use client";

import { Building2 } from "lucide-react";
import { SponsorsContent, SponsorItem } from "@/types/cms";


type SponsorsSectionProps = {
    content?: SponsorsContent | null;
};

export default function SponsorsSection({ content }: SponsorsSectionProps) {
    const defaultPartners = [
        { name: "College of Ophthalmology", short: "COAVS" },
        { name: "KEMU", short: "KEMU" },
        { name: "WCO", short: "WCO" },
        { name: "PMC", short: "PMC" },
        { name: "Vision 2020", short: "Vision 2020" },
    ];

    const partners = content?.items || defaultPartners;
    const title = content?.heading || "Affiliated & Accredited By";

    return (
        <section className="py-8 md:py-12 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <p className="text-center text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 md:mb-8">
                    {title}
                </p>

                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-70 md:opacity-60 hover:opacity-100 transition-opacity duration-300">
                    {partners.map((partner: SponsorItem, index: number) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center justify-center space-y-2 cursor-default w-[calc(33%-1rem)] md:w-auto"
                        >
                            {/* Logo Placeholder - Made prominent for mobile */}
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="font-bold text-gray-500 group-hover:text-primary-900 transition-colors text-xs md:text-lg text-center">
                                {partner.short}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
