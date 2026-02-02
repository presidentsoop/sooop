"use client";

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// Strict Type Definition based on our Schema
interface IdentityCardProps {
    profile: {
        id: string;
        full_name: string;
        profile_photo_url?: string;
        registration_number?: string;
        membership_type?: string;
        designation?: string;
        city?: string;
        cnic: string;
        subscription_end_date?: string;
        blood_group?: string;
    };
}

export default function IdentityCard({ profile }: IdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);

        try {
            // High Scale for better quality
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true, // Important for external images
                backgroundColor: null,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Calculate dimensions to fit neatly on A4
            const imgWidth = 210; // A4 width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
            pdf.save(`SOOOP-Membership-Card-${profile.registration_number || 'Pending'}.pdf`);
            toast.success("Card downloaded successfully!");

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Verification URL for QR Code
    const verificationUrl = `https://sooop.org.pk/verify/${profile.registration_number || profile.id}`;

    return (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
            {/* CARD CONTAINER (This part gets printed) */}
            <div ref={cardRef} className="flex flex-col gap-8 items-center bg-gray-50 p-8 rounded-xl">

                {/* === FRONT SIDE === */}
                <div className="w-[350px] h-[550px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-gray-200">

                    {/* Header */}
                    <div className="h-36 bg-gradient-to-br from-primary-700 to-primary-900 relative p-6 text-center">
                        <div className="absolute inset-0 pattern-dots opacity-10"></div>
                        <div className="absolute inset-0 pattern-dots opacity-10"></div>
                        <div className="flex items-center justify-center gap-3 mb-1">
                            <div className="relative w-10 h-10">
                                <Image src="/logo.jpg" alt="SOOOP Logo" fill className="object-contain" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-widest">SOOOP</h1>
                        </div>
                        <p className="text-[9px] text-white/80 uppercase tracking-widest leading-tight">Society of Optometrists Orthoptists <br />& Ophthalmic Technologists Pakistan</p>
                    </div>

                    {/* Photo */}
                    <div className="relative -mt-16 mx-auto w-32 h-32">
                        <div className="w-full h-full rounded-full border-[6px] border-white shadow-lg bg-gray-200 overflow-hidden relative">
                            {profile.profile_photo_url ? (
                                <Image
                                    src={profile.profile_photo_url}
                                    alt={profile.full_name}
                                    fill
                                    className="object-cover"
                                    referrerPolicy="no-referrer" // Helps with CORS sometimes
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200 text-4xl font-bold">
                                    {profile.full_name[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col items-center pt-4 pb-8 px-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{profile.full_name}</h2>
                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-6">
                            {profile.designation || profile.membership_type || "Member"}
                        </p>

                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Membership ID</span>
                                <span className="text-sm font-mono font-bold text-gray-800">
                                    {profile.registration_number || "PENDING"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">CNIC</span>
                                <span className="text-sm font-mono font-bold text-gray-800">{profile.cnic}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Valid Until</span>
                                <span className="text-sm font-bold text-red-600">
                                    {profile.subscription_end_date
                                        ? new Date(profile.subscription_end_date).toLocaleDateString()
                                        : "Not Active"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">City</span>
                                <span className="text-sm font-bold text-gray-800">{profile.city || "Pakistan"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="h-2 bg-primary w-full mt-auto"></div>
                </div>


                {/* === BACK SIDE === */}
                <div className="w-[350px] h-[550px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-gray-200 print:break-before-page">
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">

                        {/* QR Code */}
                        <div className="p-3 bg-white border-2 border-primary-100 rounded-xl shadow-sm">
                            <QRCodeSVG value={verificationUrl} size={120} level="H" fgColor="#0f172a" />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Scan to Verify</p>

                        <div className="w-full border-t border-gray-100 my-4"></div>

                        {/* Emergency Info */}
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-400 font-bold">Blood Group</p>
                            <p className="text-xl font-bold text-red-600">{profile.blood_group || "N/A"}</p>
                        </div>

                        <div className="mt-8 text-[9px] text-gray-400 leading-relaxed max-w-[200px]">
                            <p className="mb-2">This card is the property of SOOOP. If found, please return to:</p>
                            <p className="font-semibold text-gray-600">123 Optometry House, Gulberg, Lahore, Pakistan.</p>
                            <p className="mt-2">Tel: +92 300 1234567</p>
                            <p>Email: contact@sooop.org.pk</p>
                        </div>
                    </div>
                    <div className="h-6 bg-gray-900 w-full mt-auto flex items-center justify-center">
                        <span className="text-[8px] text-white/50 tracking-[0.3em] uppercase">www.sooop.org.pk</span>
                    </div>
                </div>

            </div>

            {/* DOWNLOAD BUTTON */}
            <button
                onClick={handleDownloadPDF}
                disabled={isDownloading || !profile.registration_number}
                className="btn btn-primary px-8 py-4 rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating PDF...
                    </>
                ) : (
                    <>
                        <Download className="w-5 h-5" /> Download Official ID Card
                    </>
                )}
            </button>
            {!profile.registration_number && (
                <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg">
                    Membership Pending Approval
                </p>
            )}
        </div>
    );
}
