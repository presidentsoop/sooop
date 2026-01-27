import Image from "next/image";
import { Award, User } from "lucide-react";

export default function LeadershipSection({ content, cabinet = [], wings = [] }: { content?: any, cabinet?: any[], wings?: any[] }) {

    // Helper to sort wing members (President first, then General Secretary)
    const sortMembers = (members: any[]) => {
        const roleOrder: Record<string, number> = { 'President': 1, 'General Secretary': 2 };
        return [...(members || [])].sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
    };

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

                {/* Unified Leadership Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 justify-center">
                    {/* Patron Card (First) */}
                    <div className="group relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 lg:col-start-2 lg:col-span-2"> {/* Centered or larger span if desired, but user asked for "same size". Let's try uniform first, or maybe spans. 
                    Wait, "Make the cards in the same size".
                    If I put Patron in the same grid, it enforces same size. 
                    Let's do a standalone centered Patron card SAME SIZE as others? Or just putting them all in one grid? 
                    The Patron is "Prof Dr Asad Aslam Khan".  
                    Let's keep Patron separate but use the EXACT SAME structural HTML/Classes as the cabinet cards below, just centered.
                    */}
                    </div>
                </div>

                {/* Actually, let's keep the sections distinct structurally but visually identical.
                    User: "make the cards in the same size"
                    I will replace the 'Patron in Chief' special horizontal layout with a Vertical Card Layout.
                */}

                {/* Patron in Chief - Now Vertical to match others */}
                <div className="flex justify-center mb-12">
                    <div className="group relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 w-full max-w-sm border border-gray-100">
                        {/* Image */}
                        <div className="relative h-72 w-full bg-gray-200 overflow-hidden">
                            <Image
                                src="/patron-chief-asad-khan.jpg"
                                alt="Prof. Dr. Asad Aslam Khan"
                                fill
                                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                    Patron in Chief
                                </span>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="p-6 text-center space-y-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                                    Prof. Dr. Asad Aslam Khan
                                </h3>
                                <p className="text-accent font-semibold text-sm flex items-center justify-center gap-1 mt-1">
                                    <Award className="w-4 h-4" /> Sitara-e-Imtiaz
                                </p>
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                A visionary leader and the driving force behind the advancement of vision sciences in Pakistan. Founder & Guardian of SOOOP.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Central Cabinet Grid */}
                {cabinet.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 justify-center max-w-6xl mx-auto px-4">
                        {cabinet.map((leader, index) => (
                            <div key={leader.id || index} className="group relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-gray-100">
                                {/* Image */}
                                <div className="relative h-72 w-full bg-gray-200 overflow-hidden">
                                    {leader.image_url ? (
                                        <Image
                                            src={leader.image_url}
                                            alt={leader.name}
                                            fill
                                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                            <User className="w-24 h-24" />
                                        </div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="p-6 text-center space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                                        {leader.name}
                                    </h3>
                                    <p className="text-accent font-medium text-sm uppercase tracking-wide">{leader.role}</p>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{leader.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">Loading Cabinet...</div>
                )}


                {/* Wings Section */}
                <div className="space-y-16">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-4xl font-bold text-primary-900 mb-4">
                            Professional Wings
                        </h3>
                        <div className="h-1 w-24 bg-accent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {wings.map((wing, index) => (
                            <div key={wing.id || index} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col">
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
                                        {sortMembers(wing.wing_members).map((member: any, mIndex: number) => {
                                            const isPresident = member.role === 'President';
                                            const memberImage = member.manual_image || member.profile?.avatar_url || '/images/portrait_pakistani_male_dr.png';
                                            const memberName = member.manual_name || member.profile?.full_name || 'Member';

                                            return (
                                                <div key={member.id || mIndex} className="flex flex-col items-center text-center gap-3 group/member">
                                                    {/* Avatar */}
                                                    <div className="relative">
                                                        <div className={`relative ${isPresident ? 'w-24 h-24 md:w-28 md:h-28' : 'w-20 h-20 md:w-24 md:h-24'} rounded-full border-[4px] border-white shadow-lg overflow-hidden bg-gray-100 z-10 transition-all duration-500 group-hover:ring-4 group-hover:ring-primary-50 group-hover:shadow-xl`}>
                                                            <Image
                                                                src={memberImage}
                                                                alt={memberName}
                                                                fill
                                                                className="object-cover transform transition-transform duration-700 group-hover/member:scale-110"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-transparent group-hover:border-gray-50 transition-colors">
                                                        <h5 className={`font-bold text-gray-900 ${isPresident ? 'text-lg md:text-xl' : 'text-base md:text-lg'} leading-tight mb-1`}>
                                                            {memberName}
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
                                        {(!wing.wing_members || wing.wing_members.length === 0) && (
                                            <div className="text-gray-400 text-sm italic">Members to be announced</div>
                                        )}
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
