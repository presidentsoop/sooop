import { createStaticClient } from "@/lib/supabase/static";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from "next/image";
import { User, MapPin, Building2 } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export const metadata = {
    title: 'Member Directory - SOOOP',
    description: 'Browse the directory of approved members of SOOOP.',
};

export default async function MembersPage() {
    const supabase = createStaticClient();

    // Parallel Fetch
    const [pageRes, membersRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'members').single(),
        supabase.from('profiles')
            .select('*')
            .eq('membership_status', 'approved')
            .order('full_name', { ascending: true })
    ]);

    const content = pageRes.data?.content || {};
    const hero = content.hero || { title: "Member Directory", subtitle: "Connect with our community of professionals." };
    const members = membersRes.data || [];

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

                {/* Directory */}
                <section className="section bg-white">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map((member) => (
                                <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                                        {member.profile_photo_url ? (
                                            <Image src={member.profile_photo_url} alt={member.full_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-900 truncate">{member.full_name}</h3>
                                        <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">{member.membership_type}</p>

                                        <div className="space-y-1 text-sm text-gray-500">
                                            {(member.designation || member.institute_name) && (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate">{member.designation}{member.designation && member.institute_name ? ' at ' : ''}{member.institute_name}</span>
                                                </div>
                                            )}
                                            {member.city && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span>{member.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No members found in the directory.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
