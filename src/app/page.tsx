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


export const revalidate = 60;

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
