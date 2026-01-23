import { createStaticClient } from "@/lib/supabase/static";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from "next/image";
import { User, Flag } from "lucide-react";

export const revalidate = 3600;

export const metadata = {
    title: 'Professional Wings - SOOOP',
    description: 'Specialized professional wings of the organization.',
};

export default async function WingsPage() {
    const supabase = createStaticClient();

    // Parallel Fetch
    const [pageRes, wingsRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'wings').single(),
        supabase.from('wings')
            .select('*, members:wing_members(*)')
            .eq('wing_members.is_active', true)
            .order('name', { ascending: true })
    ]);

    const content = pageRes.data?.content || {};
    const hero = content.hero || { title: "Professional Wings", subtitle: "Our specialized divisions driving excellence in every field." };
    const wings = wingsRes.data || [];

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-20">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {hero.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Wings List */}
                <section className="section bg-white">
                    <div className="container space-y-24">
                        {wings.map((wing: any, index: number) => {
                            // Sort Sort members to put General Secretary / President first if needed
                            // Or just list them.
                            // Highlighting General Secretary
                            const generalSecretary = wing.members?.find((m: any) => m.role?.toLowerCase().includes('secretary'));
                            const otherMembers = wing.members?.filter((m: any) => !m.role?.toLowerCase().includes('secretary')) || [];
                            const displayMembers = generalSecretary ? [generalSecretary, ...otherMembers] : wing.members;

                            return (
                                <div key={wing.id} className="grid md:grid-cols-12 gap-12 items-start">
                                    <div className={`md:col-span-4 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center sticky top-24">
                                            <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-primary">
                                                {/* Icon placeholder or dynamic icon if available */}
                                                <Flag className="w-10 h-10" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{wing.name}</h2>
                                            {wing.acronym && <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm mb-4">{wing.acronym}</span>}
                                            <p className="text-gray-600 leading-relaxed">
                                                {wing.description || "Dedicated to advancing standards and practices in this specialized field."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" /> Wing Leadership
                                        </h3>
                                        {displayMembers && displayMembers.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {displayMembers.map((member: any) => (
                                                    <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition text-left">
                                                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                                                            {member.manual_image ? (
                                                                <Image src={member.manual_image} alt={member.manual_name} fill className="object-cover" />
                                                            ) : (
                                                                <User className="w-full h-full p-3 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{member.manual_name}</h4>
                                                            <p className={`text-sm ${member.role?.toLowerCase().includes('secretary') ? 'text-primary font-bold' : 'text-gray-500'}`}>{member.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">No leadership members listed yet.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {wings.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No professional wings found.
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
