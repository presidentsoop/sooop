import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ImpactStats from '@/components/home/ImpactStats';
import AboutSection from '@/components/home/AboutSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import CTASection from '@/components/home/CTASection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import SponsorsSection from '@/components/home/SponsorsSection';
import ResourcesSection from '@/components/home/ResourcesSection';
import LeadershipSection from '@/components/home/LeadershipSection';

// ISR: Revalidate every hour (3600 seconds).
// Page is statically generated at build time and regenerated in the background.
export const revalidate = 3600;

// Static content - No database calls needed for homepage
// Each component has its own defaults if no content is passed
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <ImpactStats />
        <AboutSection />
        <BenefitsSection />
        <ResourcesSection />
        <LeadershipSection />
        <TestimonialsSection />
        <SponsorsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
