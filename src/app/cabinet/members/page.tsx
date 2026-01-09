import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Linkedin, Award, Users } from 'lucide-react';

interface CabinetMember {
    name: string;
    role: string;
    image: string;
    qualification?: string;
    bio?: string;
    email?: string;
    position?: string;
}

interface CabinetPageContent {
    patrons: CabinetMember[];
    executive: CabinetMember[];
    committee: CabinetMember[];
}

export const metadata: Metadata = {
    title: 'Executive Cabinet | SOOOP',
    description: 'Meet the distinguished leadership and executive cabinet members of the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.',
};

const defaultContent: CabinetPageContent = {
    patrons: [
        {
            name: 'Prof. Dr. Asad Aslam Khan',
            role: 'Patron in Chief',
            image: '/patron-chief-asad-khan.jpg',
            qualification: 'Sitara-e-Imtiaz, Pro-Vice Chancellor KEMU (Rtd)',
            bio: 'A visionary ophthalmologist and educationist who has shaped the landscape of eye care in Pakistan.',
        },
        {
            name: 'Prof. Dr. Muhammad Moin',
            role: 'Patron',
            image: '/patron-muhammad-moin.jpg',
            qualification: 'Principal, College of Ophthalmology & Allied Vision Sciences',
            bio: 'Leading academic excellence and clinical standards in ophthalmic education.',
        }
    ],
    executive: [
        {
            name: 'Mr. Muhammad Ajmal',
            role: 'President',
            image: '/president-muhammad-ajmal.jpg',
            qualification: 'Optometrist & Vision Scientist',
            bio: 'Dedicated to the professional growth and legal recognition of optometrists in Pakistan.',
            email: 'president@sooop.org.pk'
        },
        {
            name: 'Mr. Ahmed Kamal',
            role: 'General Secretary',
            image: '/secretary-ahmed-kamal.jpg',
            qualification: 'Senior Optometrist',
            bio: 'Driving organizational strategies and strengthening member community engagement.',
            email: 'secretary@sooop.org.pk'
        }
    ],
    committee: [
        { name: 'Dr. Ayesha Saleem', position: 'President', role: 'President', image: '' },
        { name: 'Dr. Agha Saad Khan', position: 'General Secretary', role: 'General Secretary', image: '' },
        { name: 'Dr. Muhammad Arslan Ashraf', position: 'Finance Secretary', role: 'Finance Secretary', image: '' },
        { name: 'Dr. Faiza Akhtar', position: 'Executive Member', role: 'Executive Member', image: '' },
        { name: 'Dr. Rubina Shah', position: 'Executive Member', role: 'Executive Member', image: '' }
    ]
};

export default function CabinetMembersPage() {
    const content = defaultContent;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 bg-primary-900 overflow-hidden">
                    {/* Background Image/Texture */}
                    <div className="absolute inset-0 opacity-10">
                        <Image
                            src="/images/textured_background_navy.png"
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900/40" />

                    <div className="container relative z-10 px-4 mx-auto text-center">
                        <Link
                            href="/cabinet"
                            className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-blue-200 transition-colors hover:text-white group"
                        >
                            <span className="w-8 h-[1px] bg-blue-400 group-hover:w-12 transition-all" />
                            Back to Cabinet Overview
                        </Link>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl font-heading">
                            Executive <span className="text-accent">Cabinet</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg text-blue-100 md:text-xl">
                            Distinguished professionals dedicated to advancing the standards of optometry and vision sciences in Pakistan.
                        </p>
                    </div>
                </section>

                {/* Patrons Section */}
                <section className="py-20">
                    <div className="container px-4 mx-auto">
                        <div className="mb-16 text-center">
                            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-wider text-accent uppercase bg-accent-50 rounded-full">
                                Guidance & Leadership
                            </span>
                            <h2 className="text-3xl font-bold text-primary-900 md:text-4xl">Our Patrons</h2>
                            <div className="w-24 h-1 mx-auto mt-6 rounded-full bg-accent" />
                        </div>

                        <div className="grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
                            {content.patrons.map((patron, index) => (
                                <div
                                    key={index}
                                    className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-gray-100"
                                >
                                    <div className="relative w-full md:w-2/5 h-80 md:h-auto bg-gray-100">
                                        <Image
                                            src={patron.image.startsWith('/') ? patron.image : `/images/${patron.image}`}
                                            alt={patron.name}
                                            fill
                                            className="object-cover object-top"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center p-8 md:w-3/5 space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-primary-900 mb-1">{patron.name}</h3>
                                            <p className="text-accent font-semibold">{patron.role}</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Award className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                            <p className="text-sm font-medium text-gray-700">{patron.qualification}</p>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {patron.bio}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Executive Cabinet Section */}
                <section className="py-20 bg-white">
                    <div className="container px-4 mx-auto">
                        <div className="mb-16 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary-50 text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-primary-900 md:text-4xl">Executive Cabinet</h2>
                            <p className="mt-4 text-gray-600">Leading the daily operations and strategic vision</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {content.executive.map((member, index) => (
                                <div
                                    key={index}
                                    className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                                >
                                    {/* Image Area */}
                                    <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                                        <Image
                                            src={member.image.startsWith('/') ? member.image : `/images/${member.image}`}
                                            alt={member.name}
                                            fill
                                            className="object-cover object-top transform transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Social Links shown on hover */}
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <a href={`mailto:${member.email}`} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </a>
                                            <button className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 text-center flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary transition-colors">
                                            {member.name}
                                        </h3>
                                        <p className="text-accent font-medium mb-3 pb-3 border-b border-gray-100">
                                            {member.role}
                                        </p>

                                        <div className="mb-4 flex-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Qualification</p>
                                            <p className="text-sm text-gray-700">{member.qualification}</p>
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Executive Committee Section (Restored from Old Site) */}
                <section className="py-20 bg-gray-50">
                    <div className="container px-4 mx-auto">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-primary-900 md:text-4xl">Executive Committee</h2>
                            <p className="mt-4 text-gray-600">Dedicated members serving in key leadership roles</p>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-soft overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Name</th>
                                            <th className="px-6 py-4 text-left font-semibold">Position</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {content.committee.map((member, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-900 font-medium">{member.name}</td>
                                                <td className="px-6 py-4 text-accent font-medium">{member.position}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action for Nominations */}
                <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
                    <div className="container px-4 mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Interested in Serving the Community?</h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Nominations for executive positions open every 2 years. Learn more about the eligibility criteria and nomination fees.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/cabinet/nomination"
                                className="px-8 py-3 bg-white text-primary-900 font-bold rounded-lg hover:bg-accent hover:text-white transition-all shadow-lg"
                            >
                                Nomination Details
                            </Link>
                            <Link
                                href="/contact"
                                className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Contact Secretariat
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
