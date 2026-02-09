"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, Loader2, RotateCcw, Shield, AlertCircle, CreditCard } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
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
    // CR80 Standard ID Card: 85.6mm x 54mm (3.375" x 2.125")
    const CARD_WIDTH_PX = 506;
    const CARD_HEIGHT_PX = 319;

    const [isDownloading, setIsDownloading] = useState(false);
    const [showBack, setShowBack] = useState(false);
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
    }, [profile.profile_photo_url]);

    // Generate QR code data URL
    const generateQRDataUrl = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            const verificationUrl = `https://soopvision.com/verify/${profile.registration_number || profile.id}`;

            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            // Render QR code
            const qrElement = document.createElement('canvas');
            container.appendChild(qrElement);

            // Use QRCodeCanvas to generate
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

    // Handle PDF download using Server API
    const handleDownloadPDF = async () => {
        if (!imagesLoaded) {
            toast.error("Images are still loading. Please wait a moment.");
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading("Generating ID Card PDF...");

        try {
            // Generate QR code data URL if not ready
            let currentQrUrl = qrDataUrl;
            if (!currentQrUrl) {
                currentQrUrl = await generateQRDataUrl();
                setQrDataUrl(currentQrUrl);
            }

            // Call API to generate PDF
            const response = await fetch('/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile,
                    photoDataUrl: photoDataUrl,
                    logoDataUrl: logoDataUrl,
                    qrDataUrl: currentQrUrl
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate PDF');
            }

            // Get the blob from response
            const pdfBlob = await response.blob();

            // Download the PDF
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SOOOP-Card-${profile.registration_number || 'Member'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Membership card downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    // Verification URL for QR Code
    const verificationUrl = `https://soopvision.com/verify/${profile.registration_number || profile.id}`;

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

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Check if membership is valid
    const isValid = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date();

    // Can download card only if approved
    const canDownload = !!profile.registration_number;

    // ============================================
    // FRONT CARD COMPONENT (for preview)
    // ============================================
    const FrontCardPreview = () => {
        const cardStyle: React.CSSProperties = {
            width: '100%',
            aspectRatio: '85.6 / 54',
            background: 'linear-gradient(135deg, #0a3d62 0%, #1a5276 40%, #0a3d62 100%)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        };

        return (
            <div style={cardStyle}>
                {/* Top accent line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%)',
                }} />

                {/* Bottom accent line */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%)',
                }} />

                {/* Main content wrapper */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: '18px',
                    paddingTop: '22px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left section - Photo */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '110px',
                        flexShrink: 0,
                    }}>
                        {/* Photo container */}
                        <div style={{
                            width: '90px',
                            height: '106px',
                            borderRadius: '8px',
                            border: '3px solid rgba(45, 212, 191, 0.6)',
                            overflow: 'hidden',
                            background: '#0d4a6e',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                        }}>
                            {(photoDataUrl || profile.profile_photo_url) ? (
                                <img
                                    src={profile.profile_photo_url ?? photoDataUrl ?? ''}
                                    alt={profile.full_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                                }}>
                                    <span style={{ color: 'white', fontSize: '34px', fontWeight: 'bold' }}>
                                        {profile.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Membership badge */}
                        <div style={{
                            marginTop: '8px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            boxShadow: '0 2px 10px rgba(45, 212, 191, 0.4)',
                        }}>
                            <span style={{
                                color: 'white',
                                fontSize: '8px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                {profile.membership_type || 'Member'}
                            </span>
                        </div>
                    </div>

                    {/* Vertical divider */}
                    <div style={{
                        width: '1px',
                        height: '90%',
                        alignSelf: 'center',
                        background: 'linear-gradient(180deg, transparent 0%, rgba(45, 212, 191, 0.4) 20%, rgba(45, 212, 191, 0.4) 80%, transparent 100%)',
                        margin: '0 14px',
                    }} />

                    {/* Right section - Details */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                    }}>
                        {/* Header with name and logo */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ flex: 1, paddingRight: '10px', minWidth: 0 }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                }}>
                                    {profile.full_name}
                                </h2>
                                {profile.designation && (
                                    <p style={{
                                        margin: '3px 0 0 0',
                                        fontSize: '9px',
                                        fontWeight: 600,
                                        color: '#5eead4',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {profile.designation}
                                    </p>
                                )}
                            </div>
                            {/* Logo */}
                            <div style={{
                                width: '52px',
                                height: '52px',
                                background: 'white',
                                borderRadius: '10px',
                                padding: '5px',
                                flexShrink: 0,
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                            }}>
                                <img
                                    src="/logo.jpg"
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                />
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px 16px',
                            marginTop: '8px',
                            flex: 1,
                        }}>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Registration No.</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: 'white',
                                    fontFamily: 'monospace',
                                }}>
                                    {profile.registration_number || 'PENDING'}
                                </span>
                            </div>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>CNIC</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'white',
                                    fontFamily: 'monospace',
                                }}>
                                    {formatCNIC(profile.cnic)}
                                </span>
                            </div>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>City</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: 'white',
                                }}>
                                    {profile.city || 'Pakistan'}
                                </span>
                            </div>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Valid Until</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#2dd4bf',
                                }}>
                                    {formatDate(profile.subscription_end_date)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: 0,
                    width: '100%',
                    textAlign: 'center',
                }}>
                    <span style={{
                        fontSize: '6px',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}>
                        Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan
                    </span>
                </div>
            </div>
        );
    };

    // ============================================
    // BACK CARD COMPONENT (for preview)
    // ============================================
    const BackCardPreview = () => {
        const cardStyle: React.CSSProperties = {
            width: '100%',
            aspectRatio: '85.6 / 54',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        };

        return (
            <div style={cardStyle}>
                {/* Top accent line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #0a3d62 0%, #1a5276 50%, #0a3d62 100%)',
                }} />

                {/* Bottom accent line */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #0a3d62 0%, #1a5276 50%, #0a3d62 100%)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: '18px',
                    paddingTop: '22px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left - QR Code */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '110px',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            padding: '8px',
                            background: 'white',
                            borderRadius: '10px',
                            border: '2px solid rgba(10, 61, 98, 0.15)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                        }}>
                            <QRCodeCanvas
                                value={verificationUrl}
                                size={80}
                                level="H"
                                fgColor="#0a3d62"
                                bgColor="#ffffff"
                                includeMargin={false}
                            />
                        </div>
                        <p style={{
                            marginTop: '8px',
                            fontSize: '7px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            fontWeight: 700,
                            color: '#14b8a6',
                            textAlign: 'center',
                        }}>
                            Scan to Verify
                        </p>
                    </div>

                    {/* Vertical divider */}
                    <div style={{
                        width: '1px',
                        height: '85%',
                        alignSelf: 'center',
                        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 61, 98, 0.15) 20%, rgba(10, 61, 98, 0.15) 80%, transparent 100%)',
                        margin: '0 14px',
                    }} />

                    {/* Right - Info */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                    }}>
                        {/* Header - Logo with member name */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '6px',
                            paddingBottom: '6px',
                            borderBottom: '1px solid rgba(10, 61, 98, 0.1)',
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: 'white',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                padding: '5px',
                                flexShrink: 0,
                            }}>
                                <img
                                    src="/logo.jpg"
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#0a3d62',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>{profile.full_name}</h3>
                                <p style={{
                                    margin: '3px 0 0 0',
                                    fontSize: '6px',
                                    fontWeight: 700,
                                    color: '#14b8a6',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>Official Member Card</p>
                            </div>
                        </div>

                        {/* Member Info Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px 12px',
                            flex: 1,
                        }}>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '6px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '2px',
                                }}>Father/Husband</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {profile.father_name || 'N/A'}
                                </span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{
                                    display: 'block',
                                    fontSize: '6px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '2px',
                                }}>Blood Group</span>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    color: '#EF4444',
                                }}>
                                    {profile.blood_group || '—'}
                                </span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{
                                    display: 'block',
                                    fontSize: '6px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '2px',
                                }}>Validity Period</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: '#1f2937',
                                }}>
                                    {getValidityPeriod() || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Notice */}
                        <div style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(10, 61, 98, 0.04)',
                            border: '1px solid rgba(10, 61, 98, 0.08)',
                            marginTop: '8px',
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '6px',
                                lineHeight: 1.5,
                                color: '#6b7280',
                            }}>
                                <strong style={{ color: '#374151' }}>Note:</strong> This card is property of SOOOP Pakistan. If found, please return to: <span style={{ fontWeight: 600, color: '#0a3d62' }}>contact@soopvision.com</span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '8px',
                            marginTop: '6px',
                            borderTop: '1px solid rgba(10, 61, 98, 0.1)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield style={{ width: '10px', height: '10px', color: '#14b8a6' }} />
                                <span style={{
                                    fontSize: '8px',
                                    fontWeight: 600,
                                    color: '#0a3d62',
                                }}>www.soopvision.com</span>
                            </div>
                            <span style={{
                                fontSize: '8px',
                                color: '#6b7280',
                                fontFamily: 'monospace',
                                fontWeight: 600,
                            }}>
                                {profile.registration_number || 'PENDING'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center gap-6 sm:gap-8 animate-fade-in px-2 sm:px-0">

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

            {/* Card Preview */}
            <div className="w-full max-w-md perspective-1000">
                <div
                    className={`relative transition-transform duration-700 preserve-3d ${showBack ? 'rotate-y-180' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face */}
                    <div
                        className={`w-full ${showBack ? 'invisible' : 'visible'}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <FrontCardPreview />
                    </div>

                    {/* Back Face */}
                    <div
                        className={`absolute inset-0 w-full ${showBack ? 'visible' : 'invisible'}`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <BackCardPreview />
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div className="flex flex-col items-center gap-3">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || !canDownload}
                    className={`
                        flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold
                        transition-all duration-300 shadow-lg
                        ${canDownload
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl hover:scale-105'
                            : 'bg-gray-300 cursor-not-allowed'
                        }
                        ${isDownloading ? 'opacity-70' : ''}
                    `}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download Card PDF
                        </>
                    )}
                </button>

                {!imagesLoaded && (
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading images...
                    </p>
                )}

                <p className="text-xs text-gray-500 text-center max-w-xs">
                    Professional CR80 card format (85.6mm × 54mm) • Print-ready quality
                </p>
            </div>
        </div>
    );
}
