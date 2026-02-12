"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, Loader2, Award, CheckCircle } from 'lucide-react';
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
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Convert images to data URLs for PDF generation
    useEffect(() => {
        let photoLoaded = !profile.profile_photo_url;
        let logoLoaded = false;

        const checkAllLoaded = () => {
            if (photoLoaded && logoLoaded) {
                setImagesLoaded(true);
            }
        };

        // Convert profile photo (if needed for certificate, maybe not but good to have)
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
                photoLoaded = true;
                checkAllLoaded();
            };
            img.onerror = () => {
                photoLoaded = true;
                checkAllLoaded();
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
            logoLoaded = true;
            checkAllLoaded();
        };
        logoImg.onerror = () => {
            logoLoaded = true;
            checkAllLoaded();
        };
        logoImg.src = '/logo.jpg';
    }, [profile.profile_photo_url]);

    // Generate QR code data URL
    const generateQRDataUrl = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            const verificationUrl = `https://soopvision.com/verify/${profile.registration_number || profile.id}`;

            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            import('qrcode').then((QRCode) => {
                QRCode.toDataURL(verificationUrl, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#0a3d62',
                        light: '#ffffff',
                    },
                    errorCorrectionLevel: 'H',
                }).then((url: string) => {
                    document.body.removeChild(container);
                    resolve(url);
                }).catch((err: Error) => {
                    document.body.removeChild(container);
                    reject(err);
                });
            }).catch(reject);
        });
    }, [profile.registration_number, profile.id]);

    const handleDownloadCertificate = async () => {
        if (!imagesLoaded) {
            toast.error("Assets are still loading. Please wait a moment.");
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading("Generating Membership Certificate...");

        try {
            let currentQrUrl = qrDataUrl;
            if (!currentQrUrl) {
                currentQrUrl = await generateQRDataUrl();
                setQrDataUrl(currentQrUrl);
            }

            const response = await fetch('/api/generate-certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile,
                    logoDataUrl: logoDataUrl,
                    qrDataUrl: currentQrUrl
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate Certificate');
            }

            const pdfBlob = await response.blob();
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SOOOP-Certificate-${profile.registration_number || 'Member'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Certificate downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("Certificate Generation Error:", error);
            toast.error(`Failed to generate Certificate: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {/* Certificate Preview Card */}
            <div className="w-full max-w-3xl aspect-[1.414] bg-white text-gray-900 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 border-4 border-slate-900 mt-4 rounded-sm scale-95 md:scale-100 transition-all duration-300">
                {/* Inner Gold Border */}
                <div className="absolute inset-2 border border-yellow-500 pointer-events-none"></div>

                {/* Watermark/Background decoration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <Award size={300} />
                </div>

                {/* Header */}
                <div className="text-center z-10 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-1">Society of Optometrists Pakistan</h2>
                    <div className="w-24 h-1 bg-yellow-500 mx-auto mt-2"></div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-serif text-yellow-600 font-bold mb-6 text-center uppercase z-10 drop-shadow-sm">
                    Certificate of Membership
                </h1>

                {/* Body */}
                <div className="text-center z-10 space-y-4 max-w-2xl">
                    <p className="text-gray-500 italic text-lg">This is to certify that</p>

                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 border-b border-yellow-500 pb-2 px-8 inline-block min-w-[300px]">
                        {profile.full_name}
                    </h2>

                    <div className="text-lg md:text-xl text-gray-700 leading-relaxed mt-4">
                        <p>has been admitted as a</p>
                        <p className="text-slate-900 font-bold text-2xl my-2">{membershipType}</p>
                        <p>of the Society of Optometrists Pakistan (SOOOP).</p>
                    </div>
                </div>

                {/* Footer Details */}
                <div className="absolute bottom-12 w-full px-16 flex justify-between items-end z-10 text-sm">
                    <div className="text-center">
                        <div className="w-40 border-b border-gray-900 mb-2"></div>
                        <p className="font-bold">President</p>
                        <p className="text-xs text-gray-500">Dr. Muhammad Ajmal</p>
                    </div>

                    <div className="text-center">
                        <p className="font-bold text-slate-900">Reg. No: {profile.registration_number || 'PENDING'}</p>
                        <p className="text-gray-500">{issueDate}</p>
                    </div>

                    <div className="text-center">
                        <div className="w-40 border-b border-gray-900 mb-2"></div>
                        <p className="font-bold">General Secretary</p>
                        <p className="text-xs text-gray-500">Dr. Ahmed Kamal</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 w-full px-4">
                <button
                    onClick={handleDownloadCertificate}
                    disabled={isDownloading || !imagesLoaded}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed scale-100 hover:scale-105 active:scale-95"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Certificate...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download Official Certificate
                        </>
                    )}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Official Document with Verification QR</span>
                </div>
            </div>
        </div>
    );
}
