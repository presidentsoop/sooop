import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://soopvision.com'),
  title: "SOOOP - Society of Optometrists Pakistan",
  description: "Official website of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan. Advancing eye care and supporting vision professionals.",
  keywords: ["optometry", "ophthalmology", "pakistan", "vision care", "eye care", "SOOOP"],
  authors: [{ name: "SOOOP" }],
  openGraph: {
    title: "SOOOP - Society of Optometrists Pakistan",
    description: "Advancing eye care and supporting the next generation of vision professionals",
    url: "https://soopvision.com",
    siteName: "SOOOP",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "SOOOP Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOOOP - Society of Optometrists Pakistan",
    description: "Advancing eye care and supporting vision professionals",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
};

import SplashScreen from "@/components/layout/SplashScreen";

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <SplashScreen />
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
