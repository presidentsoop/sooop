export interface LeadershipItem {
    name: string;
    role: string;
    image: string;
    bio: string;
}

export interface LeadershipContent {
    heading?: string;
    subheading?: string;
    items?: LeadershipItem[];
}

export interface SponsorItem {
    name: string;
    short: string;
}

export interface SponsorsContent {
    heading?: string;
    items?: SponsorItem[];
}

export interface ResourceItem {
    title: string;
    type: string;
    size: string;
}

export interface ResourcesContent {
    heading?: string;
    subheading?: string;
    journal_image?: string;
    items?: ResourceItem[];
}

export interface TestimonialItem {
    id: number;
    name: string;
    role: string;
    quote: string;
    rating: number;
    image?: string;
}

export interface TestimonialsContent {
    heading?: string;
    items?: TestimonialItem[];
}

export interface StatItem {
    id: string;
    label: string;
    value: string;
    icon: string;
    description: string;
}

export interface HeroContent {
    title: string;
    description: string;
    announcement: string;
    stats: StatItem[];
    image?: string;
}

export interface AboutContent {
    title: string;
    description: string;
    points: string[];
    image: string;
    years_count: string;
    years_text: string;
}

export interface CTAContent {
    heading?: string;
    subheading?: string;
    button_text?: string;
    button_link?: string;
}

export interface BenefitItem {
    id?: number | string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    link?: string;
}

export interface BenefitsContent {
    heading?: string;
    subheading?: string;
    items?: BenefitItem[];
}

export type SectionType =
    | 'hero'
    | 'about'
    | 'benefits'
    | 'testimonials'
    | 'cta'
    | 'leadership'
    | 'sponsors'
    | 'resources';

export interface Section {
    type: SectionType;
    content: HeroContent | AboutContent | BenefitsContent | TestimonialsContent | CTAContent | LeadershipContent | SponsorsContent | ResourcesContent;
}

export interface Page {
    slug: string;
    title: string;
    description?: string;
    sections: Section[];
}
