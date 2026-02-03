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

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOOOP - Society of Optometrists Pakistan',
  description: 'Official website of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan. Advancing eye care and supporting vision professionals.',
  alternates: {
    canonical: '/',
  },
};


// ISR: Revalidate every hour (3600 seconds).
// Page is statically generated at build time and regenerated in the background.
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Leadership (Cabinet)
  const { data: cabinet } = await supabase
    .from('leadership_history')
    .select('*')
    .eq('category', 'cabinet')
    .is('end_year', null)
    .order('start_year', { ascending: false });

  // Fetch Wings
  const { data: wings } = await supabase
    .from('wings')
    .select('*, wing_members(*)')
    .order('name');

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <ImpactStats />
        <AboutSection />
        <BenefitsSection />
        <ResourcesSection />
        <LeadershipSection cabinet={cabinet || []} wings={wings || []} />
        <TestimonialsSection />
        <SponsorsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
