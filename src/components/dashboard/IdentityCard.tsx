"use client";

import { useRef, useState, useEffect } from 'react';
import { Download, Loader2, RotateCcw, Shield, AlertCircle, CreditCard } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

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
        subscription_start_date?: string;
        blood_group?: string;
        father_name?: string;
        contact_number?: string;
        email?: string;
    };
}

export default function IdentityCard({ profile }: IdentityCardProps) {
    // Refs for PDF generation (hidden container)
    const pdfFrontRef = useRef<HTMLDivElement>(null);
    const pdfBackRef = useRef<HTMLDivElement>(null);

    const [isDownloading, setIsDownloading] = useState(false);
    const [showBack, setShowBack] = useState(false);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    // Convert images to data URLs for PDF generation
    useEffect(() => {
        // Convert profile photo
        if (profile.profile_photo_url) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        setPhotoDataUrl(canvas.toDataURL('image/png'));
                    }
                } catch (e) {
                    console.error('Failed to convert profile image:', e);
                }
            };
            img.src = profile.profile_photo_url;
        }

        // Convert logo
        const logoImg = new window.Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = logoImg.width;
                canvas.height = logoImg.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(logoImg, 0, 0);
                    setLogoDataUrl(canvas.toDataURL('image/png'));
                }
            } catch (e) {
                console.error('Failed to convert logo:', e);
            }
        };
        logoImg.src = '/logo.jpg';
    }, [profile.profile_photo_url]);

    const handleDownloadPDF = async () => {
        if (!pdfFrontRef.current || !pdfBackRef.current) {
            toast.error("Card elements not ready. Please try again.");
            return;
        }

        setIsDownloading(true);

        // Get parent container
        const container = pdfFrontRef.current.parentElement;

        // Helper function to wrap canvas capture with timeout
        const captureWithTimeout = (element: HTMLElement, options: Parameters<typeof html2canvas>[1], timeoutMs: number = 10000): Promise<HTMLCanvasElement> => {
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Canvas capture timed out'));
                }, timeoutMs);

                html2canvas(element, options)
                    .then((canvas) => {
                        clearTimeout(timeoutId);
                        resolve(canvas);
                    })
                    .catch((err) => {
                        clearTimeout(timeoutId);
                        reject(err);
                    });
            });
        };

        try {
            // Temporarily make the hidden container visible for capture
            if (container) {
                container.style.position = 'fixed';
                container.style.left = '0';
                container.style.top = '0';
                container.style.opacity = '1';
                container.style.zIndex = '9999';
                container.style.background = 'white';
            }

            // Wait for DOM update
            await new Promise(resolve => setTimeout(resolve, 500));

            // Card dimensions in mm (CR80 standard)
            const cardWidth = 85.6;
            const cardHeight = 54;

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [cardWidth, cardHeight],
            });

            // Simplified html2canvas options
            const canvasOptions = {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true, // Enable logging for debugging
                imageTimeout: 5000,
                removeContainer: false,
                foreignObjectRendering: false,
            };

            // Capture Front Side
            console.log('Capturing front side...');
            const frontCanvas = await captureWithTimeout(
                pdfFrontRef.current,
                { ...canvasOptions, backgroundColor: '#0a3d62' },
                15000
            );

            console.log('Front canvas captured:', frontCanvas.width, 'x', frontCanvas.height);
            const frontImg = frontCanvas.toDataURL('image/png');
            pdf.addImage(frontImg, 'PNG', 0, 0, cardWidth, cardHeight);

            // Add new page for back
            pdf.addPage([cardWidth, cardHeight], 'landscape');

            // Capture Back Side
            console.log('Capturing back side...');
            const backCanvas = await captureWithTimeout(
                pdfBackRef.current,
                { ...canvasOptions, backgroundColor: '#ffffff' },
                15000
            );

            console.log('Back canvas captured:', backCanvas.width, 'x', backCanvas.height);
            const backImg = backCanvas.toDataURL('image/png');
            pdf.addImage(backImg, 'PNG', 0, 0, cardWidth, cardHeight);

            // Hide container again
            if (container) {
                container.style.position = 'fixed';
                container.style.left = '-9999px';
                container.style.opacity = '0';
                container.style.zIndex = '-1';
                container.style.background = 'transparent';
            }

            // Save the PDF
            const fileName = `SOOOP-Card-${profile.registration_number || 'Member'}.pdf`;
            pdf.save(fileName);
            toast.success("Membership card downloaded successfully!");

        } catch (error) {
            console.error("PDF Generation Error:", error);

            // Make sure to hide container even on error
            if (container) {
                container.style.position = 'fixed';
                container.style.left = '-9999px';
                container.style.opacity = '0';
                container.style.zIndex = '-1';
                container.style.background = 'transparent';
            }

            toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    // Verification URL for QR Code
    const verificationUrl = `https://sooop.org.pk/verify/${profile.registration_number || profile.id}`;

    // Format CNIC with dashes: 00000-0000000-0
    const formatCNIC = (cnic: string) => {
        if (!cnic) return 'N/A';
        const cleaned = cnic.replace(/\D/g, '');
        if (cleaned.length === 13) {
            return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
        }
        return cnic;
    };

    // Get validity year range
    const getValidityPeriod = () => {
        if (!profile.subscription_start_date || !profile.subscription_end_date) return null;
        const start = new Date(profile.subscription_start_date);
        const end = new Date(profile.subscription_end_date);
        return `${start.getFullYear()} - ${end.getFullYear()}`;
    };

    // Check if membership is valid
    const isValid = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date();

    // Can download card only if approved
    const canDownload = !!profile.registration_number;

    // Common card content component for both preview and PDF
    const FrontCardContent = ({ forPdf = false }: { forPdf?: boolean }) => (
        <div
            className="rounded-2xl shadow-2xl relative overflow-hidden"
            style={{
                width: forPdf ? '428px' : '100%',
                height: forPdf ? '270px' : 'auto',
                aspectRatio: forPdf ? undefined : '85.6/54',
                background: 'linear-gradient(135deg, #0a3d62 0%, #1e5f74 40%, #0a3d62 100%)',
                minHeight: forPdf ? undefined : '200px',
            }}
        >
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex w-full h-full p-5">
                {/* Left Section - Photo */}
                <div className="flex flex-col items-center justify-center pr-5 border-r border-white/20">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-xl" style={{
                        border: '3px solid rgba(45, 212, 191, 0.7)',
                        background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(10, 61, 98, 0.3) 100%)'
                    }}>
                        {(photoDataUrl || profile.profile_photo_url) ? (
                            <img
                                src={forPdf ? (photoDataUrl ?? profile.profile_photo_url ?? '') : (profile.profile_photo_url ?? photoDataUrl ?? '')}
                                alt={profile.full_name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' }}>
                                <span className="text-white text-4xl font-bold">
                                    {profile.full_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <span
                        className="mt-2.5 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                        style={{
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(45, 212, 191, 0.4)'
                        }}
                    >
                        {profile.membership_type || "Member"}
                    </span>
                </div>

                {/* Right Section - Details */}
                <div className="flex-1 flex flex-col justify-between pl-5">
                    {/* Header with Name & Logo */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                            <h2 className="text-xl font-bold text-white leading-tight tracking-wide">
                                {profile.full_name}
                            </h2>
                            {profile.designation && (
                                <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: '#2dd4bf' }}>
                                    {profile.designation}
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg p-1 shadow-lg">
                            <img
                                src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                alt="SOOOP"
                                className="w-full h-full object-contain rounded"
                                crossOrigin="anonymous"
                            />
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 mt-4">
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'rgba(255,255,255,0.5)' }}>Registration No.</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {profile.registration_number || "PENDING"}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'rgba(255,255,255,0.5)' }}>CNIC</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {formatCNIC(profile.cnic)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'rgba(255,255,255,0.5)' }}>City</span>
                            <span className="text-sm font-semibold text-white">
                                {profile.city || "Pakistan"}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider block" style={{ color: 'rgba(255,255,255,0.5)' }}>Valid Until</span>
                            <span className={`text-sm font-bold ${isValid ? 'text-emerald-300' : 'text-red-400'}`}>
                                {profile.subscription_end_date
                                    ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* Bottom Organization Name */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/15">
                        <span className="text-[7px] uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Strip */}
            <div className="absolute bottom-0 left-0 w-full h-1.5" style={{
                background: 'linear-gradient(90deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%)'
            }} />
        </div>
    );

    const BackCardContent = ({ forPdf = false }: { forPdf?: boolean }) => (
        <div
            className="bg-white rounded-2xl shadow-2xl relative overflow-hidden"
            style={{
                width: forPdf ? '428px' : '100%',
                height: forPdf ? '270px' : 'auto',
                aspectRatio: forPdf ? undefined : '85.6/54',
                minHeight: forPdf ? undefined : '200px',
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-60"
                    style={{ background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(10, 61, 98, 0.1) 0%, transparent 70%)' }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex w-full h-full p-5">
                {/* Left - QR Code */}
                <div className="flex flex-col items-center justify-center pr-5 border-r border-gray-200">
                    <div className="p-2.5 bg-white rounded-xl shadow-md" style={{ border: '2px solid rgba(45, 212, 191, 0.4)' }}>
                        <QRCodeCanvas
                            value={verificationUrl}
                            size={90}
                            level="H"
                            fgColor="#0a3d62"
                            bgColor="#ffffff"
                            includeMargin={false}
                        />
                    </div>
                    <p className="mt-2 text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: '#14b8a6' }}>
                        Scan to Verify
                    </p>
                </div>

                {/* Right - Info */}
                <div className="flex-1 flex flex-col justify-between pl-5">
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9">
                            <img
                                src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                alt="SOOOP"
                                className="w-full h-full object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-wide" style={{ color: '#0a3d62' }}>SOOOP Pakistan</h3>
                            <p className="text-[8px] uppercase tracking-wider font-semibold" style={{ color: '#14b8a6' }}>Official Member Card</p>
                        </div>
                    </div>

                    {/* Member Info Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3">
                        <div>
                            <span className="text-[8px] uppercase font-bold tracking-wider block text-gray-400">Father/Husband</span>
                            <span className="text-xs font-semibold text-gray-800 truncate block">
                                {profile.father_name || "N/A"}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-[8px] uppercase font-bold tracking-wider block text-gray-400">Blood Group</span>
                            <span className="text-xl font-black" style={{ color: '#EF4444' }}>
                                {profile.blood_group || "—"}
                            </span>
                        </div>
                        {getValidityPeriod() && (
                            <div className="col-span-2">
                                <span className="text-[8px] uppercase font-bold tracking-wider block text-gray-400">Validity Period</span>
                                <span className="text-xs font-semibold text-gray-800">
                                    {getValidityPeriod()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Important Notice */}
                    <div className="p-2 rounded-lg mt-auto" style={{ background: 'rgba(10, 61, 98, 0.05)', border: '1px solid rgba(10, 61, 98, 0.1)' }}>
                        <p className="text-[7px] leading-relaxed text-gray-500">
                            <strong className="text-gray-700">Note:</strong> This card is property of SOOOP Pakistan. If found, please return to: <span className="font-semibold">contact@sooop.org.pk</span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3" style={{ color: '#14b8a6' }} />
                            <span className="text-[8px] font-semibold" style={{ color: '#0a3d62' }}>www.sooop.org.pk</span>
                        </div>
                        <span className="text-[8px] text-gray-400 font-mono">
                            {profile.registration_number || "PENDING"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Strip */}
            <div className="absolute bottom-0 left-0 w-full h-1.5" style={{
                background: 'linear-gradient(90deg, #0a3d62 0%, #1e5f74 100%)'
            }} />
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-6 sm:gap-8 animate-fade-in px-2 sm:px-0">

            {/* Hidden container for PDF generation - positioned off-screen but still rendered */}
            <div
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '0',
                    width: '428px',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
                aria-hidden="true"
            >
                <div ref={pdfFrontRef} style={{ width: '428px', height: '270px', background: '#0a3d62' }}>
                    <FrontCardContent forPdf={true} />
                </div>
                <div ref={pdfBackRef} style={{ width: '428px', height: '270px', marginTop: '20px', background: '#ffffff' }}>
                    <BackCardContent forPdf={true} />
                </div>
            </div>

            {/* Status Banner */}
            {!canDownload && (
                <div className="w-full max-w-lg bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Membership Pending Approval</p>
                        <p className="text-xs text-amber-600 mt-1">
                            Your membership card will be available for download once your application is approved and a registration number is assigned.
                        </p>
                    </div>
                </div>
            )}

            {/* Card Preview Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={() => setShowBack(false)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showBack ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <CreditCard className="w-4 h-4" />
                    Front
                </button>
                <button
                    onClick={() => setShowBack(true)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${showBack ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <RotateCcw className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* ============================ */}
            {/*    VISIBLE CARD PREVIEW     */}
            {/* ============================ */}
            <div className="w-full max-w-[428px] mx-auto">
                {!showBack ? (
                    <FrontCardContent forPdf={false} />
                ) : (
                    <BackCardContent forPdf={false} />
                )}
            </div>

            {/* ============================ */}
            {/*       DOWNLOAD SECTION       */}
            {/* ============================ */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md px-4 sm:px-0">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || !canDownload}
                    className={`
                        w-full flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all
                        ${canDownload
                            ? 'text-white hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                    style={canDownload ? {
                        background: 'linear-gradient(135deg, #0a3d62 0%, #1e5f74 100%)',
                        boxShadow: '0 10px 30px rgba(10, 61, 98, 0.3)'
                    } : {}}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            Download Membership Card
                        </>
                    )}
                </button>

                {/* Help Text */}
                <p className="text-[10px] sm:text-xs text-gray-400 text-center">
                    {canDownload
                        ? "PDF includes front and back of the card (CR80 standard size)"
                        : "Card download available after membership approval"
                    }
                </p>
            </div>
        </div>
    );
}
