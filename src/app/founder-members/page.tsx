import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Founder Members - SOOOP',
    description: 'Honoring the founder members of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
    alternates: {
        canonical: '/founder-members',
    },
};

const founderMembers = [
    { srNo: 1, name: "HAMZA ALI", profession: "Orthoptist", institution: "COAVS/KEMU" },
    { srNo: 2, name: "MUHAMMAD NADEEM", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 3, name: "ASMA KIRAN", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 4, name: "SAIRA FALAK", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 5, name: "AYESHA SALEEM", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 6, name: "SHUMAILA SHEHZADI", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 7, name: "BEENISH LATIF", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 8, name: "SOMIA MUBARAK", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 9, name: "MEHWISH ILYAS", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 10, name: "AYESHA SARFRAZ", profession: "Orthoptist", institution: "COAVS/KEMU" },
    { srNo: 11, name: "AYESHA TARIQ", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 12, name: "ZARA MAQSOOD", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 13, name: "USMAN YASEEN", profession: "Orthoptist", institution: "COAVS/KEMU" },
    { srNo: 14, name: "UBAID ULLAH JAN", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 15, name: "HIRA JAVED BUUT", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 16, name: "HAFSA JABEEN", profession: "Orthoptist", institution: "COAVS/KEMU" },
    { srNo: 17, name: "NOOR UL HUDA", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 18, name: "TAHIRA KALSOOM", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 19, name: "KANWAL ANJUM", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 20, name: "KIRAN AMAN", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 21, name: "MUHAMMAD ANWAR", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 22, name: "IRFAN ALI", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 23, name: "FAISAL RASHEED", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 24, name: "RABIA MOBEEN", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 25, name: "ZIA UR REHMAN", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 26, name: "AMNA ISLAM KHAN", profession: "Ophthalmic Technologist", institution: "COAVS/KEMU" },
    { srNo: 27, name: "RAO UMAIR ALAM", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 28, name: "ZUNAIRA QAYYUM", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 29, name: "SAIMA ASGHAR", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 30, name: "AMAL NUSRAT", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 31, name: "MADIHA NAZLY", profession: "Optometrist", institution: "COAVS/KEMU" },
    { srNo: 32, name: "MUHAMMAD ALI", profession: "Orthoptist", institution: "COAVS/KEMU" },
    { srNo: 33, name: "IMRAN KHALID", profession: "Orthoptist", institution: "COAVS/KEMU" },
];

export default function FounderMembersPage() {
    return (
        <>
            <Header />
            <main className="bg-white min-h-screen">
                {/* Hero */}
                <section className="bg-gradient-primary py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <span className="badge bg-accent text-white mb-4 animate-fade-in-up">History</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up delay-100">
                            Founder Members
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
                            Honoring the visionaries who established the foundation of our society.
                        </p>
                    </div>
                </section>

                {/* Breadcrumb & Content */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        {/* Breadcrumb */}
                        <nav className="flex mb-8" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm font-medium">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                        <span className="ml-1 text-gray-400 md:ml-2">Founder Members</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        {/* Resolution Text */}
                        <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-8 mb-12 shadow-sm">
                            <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                                <span className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </span>
                                Resolution III
                            </h2>
                            <div className="prose prose-lg text-gray-700 max-w-none leading-relaxed">
                                <p>
                                    A meeting of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan was held on <span className="font-semibold text-primary-900">14th June 2010</span>.
                                    All the founder members passed a resolution unanimously that <span className="font-bold text-primary-900">Prof Dr Asad Aslam Khan (S.I)</span> shall be the Patron In – Chief of the Society of Optometrists, Orthoptists and ophthalmic Technologists Pakistan.
                                </p>
                                <p className="mt-4 font-medium text-gray-900">
                                    The names of the founder members present in the meeting are as follows:
                                </p>
                            </div>
                        </div>

                        {/* Founder Members Table */}

                        {/* Founder Members Table - Desktop/Tablet */}
                        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-soft-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Sr. No.</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Profession</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {founderMembers.map((member) => (
                                            <tr key={member.srNo} className="hover:bg-primary-50/30 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
                                                    {member.srNo.toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {member.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.profession === 'Optometrist' ? 'bg-blue-100 text-blue-800' :
                                                        member.profession === 'Orthoptist' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {member.profession}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                    {member.institution}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Founder Members Cards - Mobile */}
                        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {founderMembers.map((member) => (
                                <div key={member.srNo} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 font-bold text-4xl text-gray-400 select-none group-hover:text-primary group-hover:opacity-20 transition-all">
                                        {member.srNo.toString().padStart(2, '0')}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="mb-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${member.profession === 'Optometrist' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                member.profession === 'Orthoptist' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                    'bg-green-50 text-green-700 border border-green-100'
                                                }`}>
                                                {member.profession}
                                            </span>
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                {member.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-3 pt-3 border-t border-gray-50">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <span className="font-mono text-xs">{member.institution}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
