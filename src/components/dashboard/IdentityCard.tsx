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

    // Check if membership is valid
    const isValid = profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date();

    // Can download card only if approved
    const canDownload = !!profile.registration_number;

    // Common card content component for both preview and PDF
    const FrontCardContent = ({ forPdf = false }: { forPdf?: boolean }) => {
        // Fixed card dimensions
        const cardStyle: React.CSSProperties = {
            width: forPdf ? '428px' : '100%',
            height: forPdf ? '270px' : 'auto',
            aspectRatio: forPdf ? undefined : '85.6 / 54',
            background: 'linear-gradient(135deg, #0a3d62 0%, #1a5276 50%, #0a3d62 100%)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        };

        return (
            <div style={cardStyle}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-60px',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '-40px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
                }} />

                {/* Main content wrapper */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: forPdf ? '20px' : '16px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left section - Photo */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingRight: forPdf ? '20px' : '14px',
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        flexShrink: 0,
                    }}>
                        {/* Photo container */}
                        <div style={{
                            width: forPdf ? '100px' : '80px',
                            height: forPdf ? '100px' : '80px',
                            borderRadius: '12px',
                            border: '3px solid rgba(45, 212, 191, 0.7)',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.3) 0%, rgba(10, 61, 98, 0.5) 100%)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                        }}>
                            {(photoDataUrl || profile.profile_photo_url) ? (
                                <img
                                    src={forPdf ? (photoDataUrl ?? profile.profile_photo_url ?? '') : (profile.profile_photo_url ?? photoDataUrl ?? '')}
                                    alt={profile.full_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    crossOrigin="anonymous"
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
                                    <span style={{ color: 'white', fontSize: forPdf ? '36px' : '28px', fontWeight: 'bold' }}>
                                        {profile.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Membership type badge */}
                        <span style={{
                            marginTop: '10px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            color: 'white',
                            fontSize: forPdf ? '9px' : '8px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 8px rgba(45, 212, 191, 0.4)',
                        }}>
                            {profile.membership_type || 'Member'}
                        </span>
                    </div>

                    {/* Right section - Details */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: forPdf ? '20px' : '14px',
                        minWidth: 0,
                    }}>
                        {/* Header with name and logo */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1, paddingRight: '10px', minWidth: 0 }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: forPdf ? '18px' : '16px',
                                    fontWeight: 700,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {profile.full_name}
                                </h2>
                                {profile.designation && (
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        fontSize: forPdf ? '10px' : '9px',
                                        fontWeight: 600,
                                        color: '#2dd4bf',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {profile.designation}
                                    </p>
                                )}
                            </div>
                            {/* Logo */}
                            <div style={{
                                width: forPdf ? '44px' : '36px',
                                height: forPdf ? '44px' : '36px',
                                background: 'white',
                                borderRadius: '8px',
                                padding: '4px',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            }}>
                                <img
                                    src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </div>

                        {/* Details Grid - 2x2 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: forPdf ? '12px 20px' : '8px 14px',
                            marginTop: forPdf ? '14px' : '10px',
                        }}>
                            {/* Registration No */}
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>Registration No.</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '12px' : '11px',
                                    fontWeight: 700,
                                    color: 'white',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {profile.registration_number || 'PENDING'}
                                </span>
                            </div>
                            {/* CNIC */}
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>CNIC</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '11px' : '10px',
                                    fontWeight: 700,
                                    color: 'white',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {formatCNIC(profile.cnic)}
                                </span>
                            </div>
                            {/* City */}
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>City</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '12px' : '11px',
                                    fontWeight: 600,
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {profile.city || 'Pakistan'}
                                </span>
                            </div>
                            {/* Valid Until */}
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>Valid Until</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '12px' : '11px',
                                    fontWeight: 700,
                                    color: isValid ? '#6ee7b7' : '#fca5a5',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {profile.subscription_end_date
                                        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                                        : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Footer - Organization name */}
                        <div style={{
                            marginTop: 'auto',
                            paddingTop: forPdf ? '10px' : '8px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        }}>
                            <span style={{
                                fontSize: forPdf ? '7px' : '6px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 500,
                            }}>
                                Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom accent strip */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: 'linear-gradient(90deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%)',
                }} />
            </div>
        );
    };

    const BackCardContent = ({ forPdf = false }: { forPdf?: boolean }) => {
        const cardStyle: React.CSSProperties = {
            width: forPdf ? '428px' : '100%',
            height: forPdf ? '270px' : 'auto',
            aspectRatio: forPdf ? undefined : '85.6 / 54',
            background: 'white',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        };

        return (
            <div style={cardStyle}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '-40px',
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(10, 61, 98, 0.1) 0%, transparent 70%)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: forPdf ? '20px' : '16px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left - QR Code */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingRight: forPdf ? '20px' : '14px',
                        borderRight: '1px solid #e5e7eb',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            padding: '10px',
                            background: 'white',
                            borderRadius: '12px',
                            border: '2px solid rgba(45, 212, 191, 0.4)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}>
                            <QRCodeCanvas
                                value={verificationUrl}
                                size={forPdf ? 90 : 70}
                                level="H"
                                fgColor="#0a3d62"
                                bgColor="#ffffff"
                                includeMargin={false}
                            />
                        </div>
                        <p style={{
                            marginTop: '8px',
                            fontSize: forPdf ? '8px' : '7px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 700,
                            color: '#14b8a6',
                            textAlign: 'center',
                        }}>
                            Scan to Verify
                        </p>
                    </div>

                    {/* Right - Info */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: forPdf ? '20px' : '14px',
                        minWidth: 0,
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: forPdf ? '36px' : '28px', height: forPdf ? '36px' : '28px' }}>
                                <img
                                    src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: forPdf ? '14px' : '12px',
                                    fontWeight: 700,
                                    color: '#0a3d62',
                                    letterSpacing: '0.5px',
                                }}>SOOOP Pakistan</h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: forPdf ? '8px' : '7px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 600,
                                    color: '#14b8a6',
                                }}>Official Member Card</p>
                            </div>
                        </div>

                        {/* Member Info Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: forPdf ? '8px 16px' : '6px 12px',
                            padding: forPdf ? '12px 0' : '8px 0',
                        }}>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: '#9ca3af',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>Father/Husband</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '11px' : '10px',
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
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 700,
                                    color: '#9ca3af',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '2px',
                                }}>Blood Group</span>
                                <span style={{
                                    fontSize: forPdf ? '20px' : '16px',
                                    fontWeight: 900,
                                    color: '#EF4444',
                                }}>
                                    {profile.blood_group || '—'}
                                </span>
                            </div>
                            {getValidityPeriod() && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{
                                        display: 'block',
                                        fontSize: forPdf ? '8px' : '7px',
                                        fontWeight: 700,
                                        color: '#9ca3af',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '2px',
                                    }}>Validity Period</span>
                                    <span style={{
                                        display: 'block',
                                        fontSize: forPdf ? '11px' : '10px',
                                        fontWeight: 600,
                                        color: '#1f2937',
                                    }}>
                                        {getValidityPeriod()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Important Notice */}
                        <div style={{
                            padding: forPdf ? '8px' : '6px',
                            borderRadius: '8px',
                            background: 'rgba(10, 61, 98, 0.05)',
                            border: '1px solid rgba(10, 61, 98, 0.1)',
                            marginTop: 'auto',
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: forPdf ? '7px' : '6px',
                                lineHeight: 1.4,
                                color: '#6b7280',
                            }}>
                                <strong style={{ color: '#374151' }}>Note:</strong> This card is property of SOOOP Pakistan. If found, please return to: <span style={{ fontWeight: 600 }}>contact@soopvision.com</span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: forPdf ? '8px' : '6px',
                            marginTop: forPdf ? '8px' : '6px',
                            borderTop: '1px solid #f3f4f6',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield style={{ width: forPdf ? '12px' : '10px', height: forPdf ? '12px' : '10px', color: '#14b8a6' }} />
                                <span style={{
                                    fontSize: forPdf ? '8px' : '7px',
                                    fontWeight: 600,
                                    color: '#0a3d62',
                                }}>www.soopvision.com</span>
                            </div>
                            <span style={{
                                fontSize: forPdf ? '8px' : '7px',
                                color: '#9ca3af',
                                fontFamily: 'monospace',
                            }}>
                                {profile.registration_number || 'PENDING'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Strip */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: 'linear-gradient(90deg, #0a3d62 0%, #1e5f74 100%)',
                }} />
            </div>
        );
    };

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
