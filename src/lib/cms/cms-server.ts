import { Page } from "@/types/cms";

const MOCK_PAGES: Page[] = [
    {
        slug: "home",
        title: "Home",
        sections: [
            {
                type: 'cta',
                content: {
                    heading: "Join Us Today",
                    subheading: "Become a member and get access to exclusive benefits.",
                    button_text: "Sign Up",
                    button_link: "/signup"
                }
            }
        ]
    },
    {
        slug: "about",
        title: "About Us",
        sections: []
    }
];

export async function getPageBySlug(slug: string): Promise<Page | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    const page = MOCK_PAGES.find((p) => p.slug === slug);
    return page || null;
}
