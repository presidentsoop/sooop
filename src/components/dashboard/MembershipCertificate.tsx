"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CertificateProps {
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

export default function MembershipCertificate({ profile }: CertificateProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [photoLoaded, setPhotoLoaded] = useState(!profile.profile_photo_url);

    // ═══ Convert profile photo to base64 data URL for server ═══
    useEffect(() => {
        if (!profile.profile_photo_url) {
            setPhotoLoaded(true);
            return;
        }

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
                console.error('Failed to convert profile photo:', e);
            }
            setPhotoLoaded(true);
        };
        img.onerror = () => {
            console.error('Failed to load profile photo');
            setPhotoLoaded(true);
        };
        img.src = profile.profile_photo_url;
    }, [profile.profile_photo_url]);

    // ═══ Generate QR code on-demand ═══
    const generateQRDataUrl = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            const verificationUrl = `https://sooopvision.com/verify/${profile.registration_number || profile.id}`;

            import('qrcode')
                .then((QRCode) => {
                    QRCode.toDataURL(verificationUrl, {
                        width: 300,
                        margin: 1,
                        color: {
                            dark: '#001F54',
                            light: '#ffffff',
                        },
                        errorCorrectionLevel: 'H',
                    })
                        .then((url: string) => resolve(url))
                        .catch((err: Error) => reject(err));
                })
                .catch(reject);
        });
    }, [profile.registration_number, profile.id]);

    // ═══ Download handler ═══
    const handleDownloadCertificate = async () => {
        if (!photoLoaded) {
            toast.error('Profile photo is still loading. Please wait.');
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading('Generating Membership Certificate...');

        try {
            // Generate QR code
            const qrDataUrl = await generateQRDataUrl();

            // Send to server for sharp-based image overlay + PDF generation
            const response = await fetch('/api/generate-certificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile,
                    qrDataUrl,
                    photoDataUrl: photoDataUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate Certificate');
            }

            // Download the PDF
            const pdfBlob = await response.blob();
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SOOOP-Certificate-${profile.registration_number || 'Member'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Certificate downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error('Certificate Generation Error:', error);
            toast.error(
                `Failed to generate Certificate: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { id: toastId }
            );
        } finally {
            setIsDownloading(false);
        }
    };

    // ═══ Preview data formatting ═══
    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ')
        : 'Full';

    const validFrom = profile.subscription_start_date
        ? new Date(profile.subscription_start_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });

    const validUntil = profile.subscription_end_date
        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        })
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(
            'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }
        );

    const serialNumber = profile.registration_number || profile.id?.slice(0, 8)?.toUpperCase() || 'PENDING';

    // ═══ Gold circle position (percentages of 1250x884) ═══
    // Center: (106, 102) → percentage
    // Inner diameter: 148px
    const circleLeftPercent = ((106 - 74) / 1250) * 100;    // ~2.56%
    const circleTopPercent = ((102 - 74) / 884) * 100;      // ~3.17%
    const circleSizePercent = (148 / 1250) * 100;            // ~11.84%
    const circleSizePercentH = (148 / 884) * 100;            // ~16.74%

    return (
        <div className="w-full flex flex-col items-center gap-8 py-8">
            {/* ═══════════ CERTIFICATE PREVIEW ═══════════ */}
            <div className="w-full max-w-5xl relative shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                <div className="relative" style={{ aspectRatio: '1250 / 884' }}>
                    {/* Template Background */}
                    <img
                        src="/certificate-template.png"
                        alt="Certificate Template"
                        className="w-full h-full object-contain select-none pointer-events-none"
                        draggable={false}
                    />

                    {/* ── 1. PROFILE PHOTO (inside gold circle, top-left) ── */}
                    <div
                        className="absolute overflow-hidden"
                        style={{
                            left: `${circleLeftPercent}%`,
                            top: `${circleTopPercent}%`,
                            width: `${circleSizePercent}%`,
                            height: `${circleSizePercentH}%`,
                            borderRadius: '50%',
                        }}
                    >
                        {(photoDataUrl || profile.profile_photo_url) ? (
                            <img
                                src={photoDataUrl || profile.profile_photo_url}
                                alt="Member"
                                className="w-full h-full object-cover"
                                style={{ borderRadius: '50%' }}
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center bg-gray-700/80"
                                style={{ borderRadius: '50%' }}
                            >
                                <span className="text-white text-xs font-medium">PHOTO</span>
                            </div>
                        )}
                    </div>

                    {/* ── 2. Serial Number (after "SERIAL:") ── */}
                    <div
                        className="absolute font-bold"
                        style={{
                            left: `${(1015 / 1250) * 100}%`,
                            top: `${(18 / 884) * 100}%`,
                            fontSize: 'clamp(8px, 1.6vw, 20px)',
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            color: '#c0392b',
                        }}
                    >
                        {serialNumber}
                    </div>

                    {/* ── 3. Member Name (centered below "THIS IS TO HEREBY THAT") ── */}
                    <div
                        className="absolute font-bold text-center"
                        style={{
                            left: '50%',
                            top: `${(320 / 884) * 100}%`,
                            transform: 'translateX(-50%)',
                            fontSize: 'clamp(12px, 2.7vw, 34px)',
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            color: '#001F54',
                            letterSpacing: '1.5px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {profile.full_name}
                    </div>

                    {/* ── 4. Membership Type (cover "Full Membership") ── */}
                    <div
                        className="absolute text-center font-bold"
                        style={{
                            left: '50%',
                            top: `${(460 / 884) * 100}%`,
                            transform: 'translateX(-50%)',
                            fontSize: 'clamp(7px, 1.35vw, 17px)',
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            color: '#222222',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'white',
                            padding: '0 6px',
                        }}
                    >
                        {membershipType} Membership
                    </div>

                    {/* ── 5. Validity Dates ── */}
                    <div
                        className="absolute text-center"
                        style={{
                            left: `${(575 / 1250) * 100}%`,
                            top: `${(506 / 884) * 100}%`,
                            transform: 'translateX(-50%)',
                            fontSize: 'clamp(6px, 1.28vw, 16px)',
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            color: '#333333',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'white',
                            padding: '0 8px',
                            letterSpacing: '0.5px',
                        }}
                    >
                        This document is valid from {validFrom} to {validUntil}
                    </div>

                    {/* ── 6. QR Code (bottom-left) ── */}
                    <div
                        className="absolute flex items-center justify-center"
                        style={{
                            left: `${(15 / 1250) * 100}%`,
                            top: `${(718 / 884) * 100}%`,
                            width: `${(120 / 1250) * 100}%`,
                            height: `${(120 / 884) * 100}%`,
                        }}
                    >
                        <div className="border border-dashed border-gray-300 rounded w-full h-full flex items-center justify-center bg-white/80">
                            <span className="text-gray-400 text-[7px] md:text-[10px] text-center font-medium">QR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ ACTION BUTTONS ═══════════ */}
            <div className="flex flex-col items-center gap-4 w-full px-4">
                <button
                    onClick={handleDownloadCertificate}
                    disabled={isDownloading || !photoLoaded}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Certificate...
                        </>
                    ) : !photoLoaded ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading Photo...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download Official Certificate
                        </>
                    )}
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Official Document with Verification QR Code</span>
                </div>
            </div>
        </div>
    );
}
