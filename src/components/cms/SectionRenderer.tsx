import { Section } from "@/types/cms";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import LeadershipSection from "@/components/home/LeadershipSection";
import SponsorsSection from "@/components/home/SponsorsSection";
import ResourcesSection from "@/components/home/ResourcesSection";

interface SectionRendererProps {
    section: Section;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
    switch (section.type) {
        case 'hero':
            return <HeroSection content={section.content as any} />;
        case 'about':
            return <AboutSection content={section.content as any} />;
        case 'benefits':
            return <BenefitsSection content={section.content as any} />;
        case 'testimonials':
            return <TestimonialsSection content={section.content as any} />;
        case 'cta':
            return <CTASection content={section.content as any} />;
        case 'leadership':
            return <LeadershipSection content={section.content as any} />;
        case 'sponsors':
            return <SponsorsSection content={section.content as any} />;
        case 'resources':
            return <ResourcesSection content={section.content as any} />;
        default:
            return null;
    }
}
