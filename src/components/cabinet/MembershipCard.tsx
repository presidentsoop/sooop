'use client';

import { useRef } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Loader2, Download } from 'lucide-react';
import { useState } from 'react';

type CardProps = {
    member: {
        name: string;
        specialty: string;
        registration_no: string;
        cnic: string;
        expiry: string;
        photo_url: string;
        phone: string;
        address: string;
    }
};

export default function MembershipCard({ member }: CardProps) {
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!frontRef.current || !backRef.current) return;
        setIsDownloading(true);

        try {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 53.98] // Standard ID-1 card size
            });

            // Capture Front
            const frontCanvas = await html2canvas(frontRef.current, { scale: 4, useCORS: true });
            const frontImgData = frontCanvas.toDataURL('image/png');
            pdf.addImage(frontImgData, 'PNG', 0, 0, 85.6, 53.98);

            // Add Back
            pdf.addPage([85.6, 53.98], 'landscape');
            const backCanvas = await html2canvas(backRef.current, { scale: 4, useCORS: true });
            const backImgData = backCanvas.toDataURL('image/png');
            pdf.addImage(backImgData, 'PNG', 0, 0, 85.6, 53.98);

            pdf.save(`SOOOP-Membership-Card-${member.registration_no.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Failed to generate PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8">
            {/* Visual Display (Scale up for visibility, but keep aspect ratio) */}
            <div className="flex flex-col xl:flex-row gap-8">

                {/* FRONT SIDE */}
                <div
                    ref={frontRef}
                    className="relative w-[85.6mm] h-[53.98mm] bg-white overflow-hidden shadow-2xl flex-shrink-0 text-xs text-black"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    {/* Layout: Left White (30%), Right Blue (70%) */}
                    <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-white z-10">
                        {/* President Sign */}
                        <div className="absolute left-1 top-4 bottom-4 w-6 border-r border-gray-200 flex flex-col items-center justify-center">
                            <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                <span className="font-bold text-[8px] tracking-wide text-primary">President Sign.</span>
                            </div>
                            {/* Placeholder Signature */}
                            <div className="mt-2 w-4 h-8 relative opacity-70">
                                {/* Using a path to simulate a signature or a placeholder image */}
                                <svg viewBox="0 0 100 100" className="w-full h-full stroke-black fill-none">
                                    <path d="M10,50 Q30,20 50,50 T90,50" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-[70%] bg-[#0070BA] z-0 text-white p-3 pl-8">
                        {/* Right Content */}
                        <div className="flex flex-col h-full">
                            {/* Header Text */}
                            <div className="mb-2">
                                <h1 className="font-bold text-[9px] leading-tight">
                                    Society of Optometrists Orthoptists<br />
                                    and Ophthalmic Technologists Pakistan
                                </h1>
                                <p className="text-[6px] opacity-80 mt-0.5">Saving Vision-Spreading Knowledge</p>
                            </div>

                            {/* SOOOP Logo Large Watermark/Text */}
                            <div className="absolute right-2 top-10 opactiy-90">
                                <div className="text-3xl font-extrabold tracking-tighter text-blue-900/40">SOOOP</div>
                            </div>

                            {/* Fields */}
                            <div className="mt-auto space-y-1 relative z-10">
                                <p className="font-bold text-[8px] mb-1">Is Registered as full Member With SOOOP</p>

                                <div className="grid grid-cols-[50px_1fr] gap-0 text-[7px] items-center">
                                    <span className="font-semibold text-blue-200">Specialty:</span>
                                    <span className="font-bold uppercase">{member.specialty}</span>
                                </div>
                                <div className="grid grid-cols-[50px_1fr] gap-0 text-[7px] items-center">
                                    <span className="font-semibold text-blue-200">Registration:</span>
                                    <span className="font-bold">{member.registration_no}</span>
                                </div>
                                <div className="grid grid-cols-[50px_1fr] gap-0 text-[7px] items-center">
                                    <span className="font-semibold text-blue-200">CNIC#:</span>
                                    <span className="font-bold">{member.cnic}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Photo (Overlapping) */}
                    <div className="absolute left-[20%] top-6 w-[22mm] h-[22mm] rounded-full border-2 border-white bg-gray-200 overflow-hidden z-20 shadow-md">
                        {member.photo_url ? (
                            <img src={member.photo_url} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-[8px]">Photo</div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="absolute left-[28%] top-2 overflow-visible whitespace-nowrap z-30">
                        <span className="font-bold text-sm text-[#0070BA]">{member.name}</span>
                    </div>
                    <div className="absolute left-[10%] top-[70%] z-20">
                        {/* Adjusted content slightly to match image better */}
                    </div>
                </div>

                {/* BACK SIDE */}
                <div
                    ref={backRef}
                    className="relative w-[85.6mm] h-[53.98mm] bg-white overflow-hidden shadow-2xl flex-shrink-0 text-xs text-black"
                >
                    {/* Blue Corners */}
                    {/* Top Left Triangle */}
                    <div className="absolute -left-4 -top-4 w-12 h-12 bg-[#0070BA] rotate-45 transform"></div>
                    {/* Bottom Right Triangle */}
                    <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#0070BA] rotate-45 transform"></div>

                    <div className="h-full flex flex-col justify-between p-4 relative z-10">
                        <div className="space-y-1 text-[8px]">
                            <div className="flex gap-2">
                                <span className="font-bold text-[#0070BA] w-10">Cell:</span>
                                <span>{member.phone}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold text-[#0070BA] w-10">Address:</span>
                                <span className="w-48 leading-tight">{member.address}</span>
                            </div>
                        </div>

                        {/* Center Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-[#002B5C] text-white px-3 py-1 rounded-full text-[8px] font-bold shadow-sm">
                                SOOOP House
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="absolute left-1/2 top-[35%] -translate-x-1/2 flex flex-col gap-1 text-[7px] text-center w-full">
                            <div className="flex justify-center gap-1">
                                <span className="font-semibold">Issue Date:</span>
                                <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-center gap-1">
                                <span className="font-semibold">Valid Date:</span>
                                <span>{member.expiry ? new Date(member.expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-2 text-center">
                            <p className="text-[6px] font-bold text-[#002B5C] leading-tight">
                                College of Ophthalmology and Allied Vision Science K.E.M.U /<br />
                                Mayo Hospital Lahore
                            </p>
                            <p className="text-[5px] text-gray-600 mt-0.5">
                                Tel: +92-42-3735998 E-mail: sooop.pakistan@gmail.com
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn btn-primary"
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4 mr-2" /> Download Member Card (PDF)
                    </>
                )}
            </button>
        </div>
    );
}
