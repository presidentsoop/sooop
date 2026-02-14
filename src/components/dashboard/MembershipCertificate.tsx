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
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Convert images to data URLs for PDF generation
    useEffect(() => {
        let photoLoaded = !profile.profile_photo_url;
        let logoLoaded = false;
        let signatureLoaded = false;

        const checkAllLoaded = () => {
            if (photoLoaded && logoLoaded && signatureLoaded) {
                setImagesLoaded(true);
            }
        };

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

        // Convert signature
        const sigImg = new window.Image();
        sigImg.crossOrigin = 'anonymous';
        sigImg.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = sigImg.width;
                canvas.height = sigImg.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(sigImg, 0, 0);
                    setSignatureDataUrl(canvas.toDataURL('image/png'));
                }
            } catch (e) {
                console.error('Failed to convert signature:', e);
            }
            signatureLoaded = true;
            checkAllLoaded();
        };
        sigImg.onerror = () => {
            signatureLoaded = true;
            checkAllLoaded();
        };
        sigImg.src = '/signature.png';
    }, [profile.profile_photo_url]);

    // Generate QR code data URL
    const generateQRDataUrl = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            const verificationUrl = `https://sooopvision.com/verify/${profile.registration_number || profile.id}`;

            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            import('qrcode')
                .then((QRCode) => {
                    QRCode.toDataURL(verificationUrl, {
                        width: 200,
                        margin: 1,
                        color: {
                            dark: '#4b0082',
                            light: '#ffffff',
                        },
                        errorCorrectionLevel: 'H',
                    })
                        .then((url: string) => {
                            document.body.removeChild(container);
                            resolve(url);
                        })
                        .catch((err: Error) => {
                            document.body.removeChild(container);
                            reject(err);
                        });
                })
                .catch(reject);
        });
    }, [profile.registration_number, profile.id]);

    const handleDownloadCertificate = async () => {
        if (!imagesLoaded) {
            toast.error('Assets are still loading. Please wait a moment.');
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading('Generating Membership Certificate...');

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
                    qrDataUrl: currentQrUrl,
                    photoDataUrl: photoDataUrl,
                    signatureDataUrl: signatureDataUrl,
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

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    const validFrom = profile.subscription_start_date
        ? new Date(profile.subscription_start_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    const validUntil = profile.subscription_end_date
        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(
            'en-GB',
            { day: 'numeric', month: 'long', year: 'numeric' }
        );

    return (
        <div className="w-full flex flex-col items-center gap-8 py-8">
            {/* CERTIFICATE PREVIEW */}
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden border-2 border-gray-900 aspect-[1.414]">
                <div className="relative w-full h-full flex">
                    {/* SIDEBAR */}
                    <div className="w-[28%] bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 relative flex flex-col items-center justify-between py-6 px-4">
                        {/* PHOTO */}
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg flex-shrink-0">
                            {photoDataUrl ? (
                                <img
                                    src={photoDataUrl}
                                    alt="Member Photo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">
                                    NO PHOTO
                                </div>
                            )}
                        </div>

                        {/* DIAMOND */}
                        <div className="flex-grow flex items-center justify-center">
                            <div
                                className="w-5 h-5 bg-yellow-500 transform rotate-45"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
                            />
                        </div>

                        {/* QR CODE */}
                        <div className="bg-white rounded-lg p-2 flex flex-col items-center gap-1 flex-shrink-0">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    className="w-24 h-24"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-yellow-400" />
                            )}
                            <p className="text-xs font-bold text-purple-900 uppercase tracking-widest">Scan me</p>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 relative flex flex-col justify-between p-8 bg-white">
                        {/* BORDER */}
                        <div className="absolute inset-0 border border-black pointer-events-none" style={{ margin: '10px' }} />

                        {/* TOP LEFT TRIANGLE */}
                        <div className="absolute top-2 left-2 w-12 h-12 bg-yellow-500 clip-triangle" style={{
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                        }} />

                        {/* BOTTOM RIGHT TRIANGLE */}
                        <div className="absolute bottom-2 right-2 w-12 h-12 bg-yellow-500" style={{
                            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                        }} />

                        {/* HEADER */}
                        <div className="relative z-10 flex justify-between items-start border-b border-yellow-500 pb-4 mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">Certificate</h2>
                                <p className="text-sm text-gray-900 uppercase tracking-widest">of Membership</p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-bold text-red-600 mb-2">
                                    Serial No: {profile.id.slice(0, 8).toUpperCase()}
                                </p>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className="text-right border-r border-yellow-500 pr-2">
                                        <p className="text-[7px] font-bold text-gray-900 uppercase leading-tight">Society of</p>
                                        <p className="text-[7px] font-bold text-gray-900 uppercase leading-tight">Optometrists</p>
                                        <p className="text-[7px] font-bold text-gray-900 uppercase leading-tight">Pakistan</p>
                                    </div>
                                    {logoDataUrl && (
                                        <img
                                            src={logoDataUrl}
                                            alt="Logo"
                                            className="w-8 h-8 object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* BODY - CENTERED */}
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center gap-2">
                            <p className="text-xs text-gray-500 italic">this is to certify that</p>

                            <h3 className="text-4xl font-bold text-yellow-500 uppercase tracking-wide">
                                {profile.full_name}
                            </h3>

                            <p className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                                MEMBERSHIP NO: {profile.registration_number || 'PENDING'}
                            </p>

                            <p className="text-xs text-gray-700 leading-relaxed max-w-md mt-2">
                                is a member of good standing and abides by the constitution, by-laws and code of ethics of the
                                Society of Optometrists Pakistan (SOOOP) under {membershipType} membership.
                            </p>

                            <p className="text-xs text-gray-600 italic mt-3">
                                This document is valid from {validFrom} to {validUntil}
                            </p>
                        </div>

                        {/* FOOTER SIGNATURES */}
                        <div className="relative z-10 flex justify-between items-end mt-6 text-center text-xs">
                            <div className="flex flex-col items-center w-1/3">
                                <div className="h-8 mb-1" />
                                <div className="w-24 h-0.5 bg-purple-900 mb-1" />
                                <p className="font-bold text-gray-900 uppercase text-[7px] tracking-wide">
                                    Secretary General
                                </p>
                            </div>

                            <div className="w-1/3" />

                            <div className="flex flex-col items-center w-1/3">
                                {signatureDataUrl ? (
                                    <img
                                        src={signatureDataUrl}
                                        alt="Signature"
                                        className="h-8 mb-1 object-contain"
                                    />
                                ) : (
                                    <div className="h-8 mb-1" />
                                )}
                                <div className="w-24 h-0.5 bg-purple-900 mb-1" />
                                <p className="font-bold text-gray-900 uppercase text-[7px] tracking-wide">
                                    SOOOP President
                                </p>
                            </div>
                        </div>

                        {/* VERIFICATION URL */}
                        <div className="relative z-10 text-center text-xs text-gray-500 mt-4">
                            <p>
                                Visit{' '}
                                <span className="font-bold text-yellow-500">sooopvision.com/verify</span> to validate
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col items-center gap-4 w-full px-4">
                <button
                    onClick={handleDownloadCertificate}
                    disabled={isDownloading || !imagesLoaded}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Certificate...
                        </>
                    ) : !imagesLoaded ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading Assets...
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
