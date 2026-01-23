import { createStaticClient } from "@/lib/supabase/static";
import Image from "next/image";
import { Award, Linkedin } from "lucide-react";

export default async function LeadershipSection({ content }: { content?: any }) {
    const supabase = createStaticClient();

    // 1. Fetch Cabinet (Current Leaders)
    // Assuming 'cabinet' category and no end_year implies current.
    const { data: cabinet } = await supabase
        .from('leadership_history')
        .select('*')
        .eq('category', 'cabinet')
        .is('end_year', null) // Current
        .order('role', { ascending: true }); // A-Z sorting or add 'order' column later

    // 2. Fetch Wings with Members
    const { data: wings } = await supabase
        .from('wings')
        .select(`
            *,
            wing_members(
                role,
                manual_name,
                manual_image,
                is_active,
                profiles(
                    full_name,
                    avatar_url
                )
            )
        `)
        .order('name');

    // Process Cabinet Data (Fallback to hardcoded if empty for safety during transition)
    const displayCabinet = (cabinet && cabinet.length > 0) ? cabinet : [
        {
            name: "Mr. Muhammad Ajmal CH",
            role: "President",
            image_url: "/president-muhammad-ajmal.jpg",
            bio: "Leading the society with a vision for unity and professional excellence.",
        },
        {
            name: "Mr. Ahmad Kamal",
            role: "General Secretary",
            image_url: "/secretary-ahmed-kamal.jpg",
            bio: "Ensuring smooth operations and strategic implementation of society goals.",
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-white relative">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="badge bg-primary/10 text-primary">Our Leadership</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-primary-900 leading-tight">
                        {content?.title || "Executive Cabinet"}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {content?.subtitle || "Guided by distinguished professionals committed to advancing vision sciences in Pakistan."}
                    </p>
                </div>

                {/* Central Cabinet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 justify-center">
                    {displayCabinet.map((leader: any, index: number) => (
                        <div key={index} className="group relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300">
                            {/* Image */}
                            <div className="relative h-80 w-full bg-gray-200 overflow-hidden">
                                <Image
                                    src={leader.image_url || "/images/portrait_pakistani_male_dr.png"}
                                    alt={leader.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    {/* Future Socials */}
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-4 text-center">
                                <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary transition-colors">
                                    {leader.name}
                                </h3>
                                <p className="text-accent font-medium text-sm mb-2">{leader.role}</p>
                                {leader.bio && (
                                    <p className="text-gray-500 text-sm line-clamp-2">{leader.bio}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Wings Section */}
                <div className="space-y-16">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-4xl font-bold text-primary-900 mb-4">
                            Professional Wings
                        </h3>
                        <div className="h-1 w-24 bg-accent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {(wings || []).map((wing: any, index: number) => (
                            <div key={index} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col">
                                {/* Wing Header with Pattern */}
                                <div className="bg-gradient-to-b from-gray-50/80 to-white p-6 border-b border-gray-100 flex flex-col items-center gap-3 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-accent relative z-10 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg md:text-xl font-bold text-gray-900 relative z-10 text-center group-hover:text-primary transition-colors duration-300">
                                        {wing.name}
                                    </h4>
                                </div>

                                {/* Connected List */}
                                <div className="p-8 md:p-10 relative flex-1 flex flex-col items-center justify-center">
                                    {/* Vertical Connecting Line */}
                                    <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-0.5 bg-gray-100 group-hover:bg-primary-100 transition-colors duration-500 rounded-full"></div>

                                    <div className="space-y-12 relative z-10 w-full">
                                        {wing.wing_members
                                            .filter((m: any) => m.is_active !== false) // Default true
                                            .sort((a: any, b: any) => a.role === 'President' ? -1 : 1) // President First
                                            .map((member: any, mIndex: number) => {

                                                // Determine Name and Image (Manual First)
                                                const name = member.manual_name || member.profiles?.full_name || 'Unknown Member';
                                                const image = member.manual_image || member.profiles?.avatar_url || "/images/portrait_pakistani_male_dr.png";
                                                const isPresident = member.role === 'President';

                                                return (
                                                    <div key={mIndex} className="flex flex-col items-center text-center gap-3 group/member">
                                                        {/* Avatar */}
                                                        <div className="relative">
                                                            <div className={`relative ${isPresident ? 'w-24 h-24 md:w-28 md:h-28' : 'w-20 h-20 md:w-24 md:h-24'} rounded-full border-[4px] border-white shadow-lg overflow-hidden bg-gray-100 z-10 transition-all duration-500 group-hover:ring-4 group-hover:ring-primary-50 group-hover:shadow-xl`}>
                                                                <Image
                                                                    src={image}
                                                                    alt={name}
                                                                    fill
                                                                    className="object-cover transform transition-transform duration-700 group-hover/member:scale-110"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Info */}
                                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-transparent group-hover:border-gray-50 transition-colors">
                                                            <h5 className={`font-bold text-gray-900 ${isPresident ? 'text-lg md:text-xl' : 'text-base md:text-lg'} leading-tight mb-1`}>
                                                                {name}
                                                            </h5>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${isPresident
                                                                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                                }`}>
                                                                {member.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
