import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join SOOOP - Membership Application",
    description: "Apply for SOOOP membership. Student, Associate, Full, and Overseas membership available.",
    alternates: {
        canonical: "/signup",
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
