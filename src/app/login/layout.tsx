import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - SOOOP",
    description: "Sign in to your SOOOP account to access member benefits.",
    alternates: {
        canonical: "/login",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
