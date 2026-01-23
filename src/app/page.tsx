import { createStaticClient } from '@/lib/supabase/static';
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


export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createStaticClient();
  const { data: page } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', 'home')
    .single();

  const content = page?.content || {};

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection content={content.hero} />
        <ImpactStats content={content.stats} />
        <AboutSection content={content.about} />
        <BenefitsSection content={content.benefits} />
        <ResourcesSection content={content.resources} />
        <LeadershipSection content={content.leadership} />
        <TestimonialsSection content={content.testimonials} />
        <SponsorsSection content={content.sponsors} />
        <CTASection content={content.cta} />
      </main>
      <Footer />
    </>
  );
}
