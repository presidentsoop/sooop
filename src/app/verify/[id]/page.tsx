import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Calendar, MapPin, Award, ArrowLeft } from "lucide-react";

interface VerifyPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Verify Member ${id} - SOOOP`,
        description: "Verify SOOOP membership authenticity",
    };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Try to find member by registration_number first, then by id
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, registration_number, membership_status, membership_type, designation, city, profile_photo_url, subscription_end_date, created_at')
        .eq('registration_number', id)
        .single();

    // If not found by registration_number, try by UUID
    if (!profile) {
        const result = await supabase
            .from('profiles')
            .select('id, full_name, registration_number, membership_status, membership_type, designation, city, profile_photo_url, subscription_end_date, created_at')
            .eq('id', id)
            .single();
        profile = result.data;
        error = result.error;
    }

    const isValid = profile && profile.membership_status === 'active';
    const isPending = profile && profile.membership_status === 'pending';
    const isExpired = profile && profile.subscription_end_date && new Date(profile.subscription_end_date) < new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image src="/logo.jpg" alt="SOOOP" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-xl text-gray-900">SOOOP</span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-lg">

                    {/* Verification Result Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                        {/* Status Banner */}
                        <div className={`p-6 text-center ${isValid && !isExpired ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                            isPending ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                isExpired ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                    'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                                {isValid && !isExpired ? (
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                ) : isPending ? (
                                    <AlertTriangle className="w-12 h-12 text-white" />
                                ) : isExpired ? (
                                    <XCircle className="w-12 h-12 text-white" />
                                ) : (
                                    <XCircle className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {isValid && !isExpired ? 'Verified Member' :
                                    isPending ? 'Pending Verification' :
                                        isExpired ? 'Membership Expired' :
                                            'Member Not Found'}
                            </h1>
                            <p className="text-white/80 text-sm">
                                {isValid && !isExpired ? 'This is an authentic SOOOP member' :
                                    isPending ? 'Application is under review' :
                                        isExpired ? 'Membership subscription has expired' :
                                            'No matching record found in our database'}
                            </p>
                        </div>

                        {/* Member Details */}
                        {profile ? (
                            <div className="p-6 space-y-6">

                                {/* Profile Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative flex-shrink-0">
                                        {profile.profile_photo_url ? (
                                            <Image
                                                src={profile.profile_photo_url}
                                                alt={profile.full_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                                                {profile.full_name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                                        <p className="text-sm text-primary-600 font-medium">
                                            {profile.designation || profile.membership_type || 'Member'}
                                        </p>
                                        {profile.city && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {profile.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Member ID</span>
                                        </div>
                                        <p className="text-lg font-mono font-bold text-gray-900">
                                            {profile.registration_number || 'Pending'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Award className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                                        </div>
                                        <p className={`text-lg font-bold capitalize ${profile.membership_status === 'active' ? 'text-green-600' :
                                            profile.membership_status === 'pending' ? 'text-amber-600' :
                                                'text-gray-600'
                                            }`}>
                                            {isExpired ? 'Expired' : profile.membership_status}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Member Since</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(profile.created_at).toLocaleDateString('en-GB', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Valid Until</span>
                                        </div>
                                        <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                            {profile.subscription_end_date
                                                ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : 'Not Set'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Verification Timestamp */}
                                <div className="text-center pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Verified on {new Date().toLocaleString('en-GB', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500 mb-4">
                                    The member ID <span className="font-mono font-bold">{id}</span> was not found in our records.
                                </p>
                                <p className="text-sm text-gray-400">
                                    If you believe this is an error, please contact us at{' '}
                                    <a href="mailto:contact@soopvision.com" className="text-primary-600 hover:underline">
                                        contact@soopvision.com
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Official verification by SOOOP Pakistan
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 text-center">
                <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan
                </p>
            </footer>
        </div>
    );
}
