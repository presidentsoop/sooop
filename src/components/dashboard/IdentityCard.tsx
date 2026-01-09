"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { Download, Share2, MapPin, Phone, Globe } from 'lucide-react';

interface IdentityCardProps {
    profile: any;
}

export default function IdentityCard({ profile }: IdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        // Simple print trick for "PDF Download" simulation
        // In a real app, use html2canvas or satori
        const printContent = cardRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.outerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore state
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* ID CARD CONTAINER */}
            <div
                ref={cardRef}
                className="w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col font-sans border border-gray-100 print:shadow-none print:w-full print:h-full"
                style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)' }}
            >
                {/* Header / Brand Pattern */}
                <div className="h-32 bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-dots"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full">
                        <h1 className="text-2xl font-black tracking-widest">SOOOP</h1>
                        <p className="text-[10px] uppercase opacity-80 tracking-[0.2em] mt-1">Society of Official OOP</p>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black opacity-10 rounded-full blur-xl"></div>
                </div>

                {/* Profile Photo Wrapper */}
                <div className="relative -mt-16 mx-auto">
                    <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl bg-gray-200 overflow-hidden relative z-20">
                        {profile?.profile_photo_url ? (
                            <Image
                                src={profile.profile_photo_url}
                                alt={profile.full_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-4xl font-bold">
                                {profile?.full_name?.[0]}
                            </div>
                        )}
                    </div>
                    <span className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 border-4 border-white rounded-full z-30 shadow-sm" title="Active"></span>
                </div>

                {/* Member Details */}
                <div className="text-center px-8 mt-4 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.full_name}</h2>
                    <p className="text-primary font-medium text-sm bg-primary/5 px-3 py-1 rounded-full inline-block mb-6">
                        {profile?.role === 'professional' ? 'Professional Member' : 'Student Member'}
                    </p>

                    <div className="space-y-4 text-left">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm text-xs font-bold">ID</div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Membership ID</p>
                                <p className="text-sm font-semibold text-gray-900 font-mono">SOOOP-{profile?.id?.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm text-xs font-bold">#</div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CNIC</p>
                                <p className="text-sm font-semibold text-gray-900 font-mono">{profile?.cnic || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valid Thru</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {profile?.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">City</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.city || 'Karachi'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto bg-gray-900 text-white p-6 relative w-full overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-2 opacity-80">
                        <div className="flex items-center gap-2 text-[10px]">
                            <MapPin className="w-3 h-3 text-primary" />
                            <span>123 Tech Avenue, Gulshan, Karachi</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <Globe className="w-3 h-3 text-primary" />
                            <span>www.sooop.org.pk</span>
                        </div>
                    </div>
                    {/* QR Code Placeholder */}
                    <div className="absolute right-6 bottom-6 w-16 h-16 bg-white rounded-lg p-1">
                        <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center text-[8px] text-center text-gray-400">
                            QR Code
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary-600 transition hover:scale-105 active:scale-95"
                >
                    <Download className="w-5 h-5" /> Download / Print
                </button>
            </div>
            <p className="text-sm text-gray-500 max-w-xs text-center">
                This card acts as your official proof of membership. Please carry it for all SOOOP events.
            </p>
        </div>
    );
}
