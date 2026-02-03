import { Metadata } from 'next';

// ISR: Revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'About Us - SOOOP',
    description: 'Learn about the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
    alternates: {
        canonical: '/about',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
