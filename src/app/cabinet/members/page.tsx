import { createStaticClient } from "@/lib/supabase/static";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

export const revalidate = 3600;

export const metadata = {
    title: 'Cabinet Members - SOOOP',
    description: 'Current executive committee members of SOOOP.',
};

export default async function CabinetMembersPage() {
    const supabase = createStaticClient();

    // Parallel Fetch
    const [pageRes, membersRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'cabinet-members').single(),
        supabase.from('leadership_history')
            .select('*')
            .eq('category', 'cabinet')
            .is('end_year', null) // Only current members
            .order('start_year', { ascending: false }) // Or just by created_at or id
    ]);

    const filesContent = pageRes.data?.content || {};
    const hero = filesContent.hero || { title: "Current Cabinet", subtitle: "Meet the dedicated professionals leading our organization." };
    const members = membersRes.data || [];

    // Custom sorting if needed (e.g. President first). 
    // Basic heuristic: Role 'President' first, then others.
    const sortedMembers = members.sort((a, b) => {
        const roleA = a.role.toLowerCase();
        const roleB = b.role.toLowerCase();
        if (roleA.includes('president') && !roleA.includes('vice')) return -1;
        if (roleB.includes('president') && !roleB.includes('vice')) return 1;
        return 0;
    });

    return (
        <>
            <Header />
            <main>
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-20">
                    <div className="container text-center">
                        <Link href="/cabinet" className="text-white/80 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back to Cabinet
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {hero.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl mx-auto">
                            {hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Grid */}
                <section className="section bg-white">
                    <div className="container">
                        {sortedMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {sortedMembers.map((member) => (
                                    <div key={member.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col items-center p-8 text-center">

                                        <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-gray-50 group-hover:border-primary/10 transition-colors">
                                            {member.image_url ? (
                                                <Image
                                                    src={member.image_url}
                                                    alt={member.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                        <p className="text-primary font-semibold mb-4 text-sm uppercase tracking-wide">{member.role}</p>

                                        {member.bio && (
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 max-w-xs">{member.bio}</p>
                                        )}

                                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            <span className="text-xs font-bold text-gray-400">Joined {member.start_year}</span>
                                        </div>

                                        {/* Decorative bg */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl">
                                No visible cabinet members at this time.
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
