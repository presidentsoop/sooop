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
    // CR80 Standard ID Card: 85.6mm x 54mm (3.375" x 2.125")
    // At 300 DPI: 1012 x 638 pixels - we use 506 x 319 for PDF (150 DPI equivalent)
    const CARD_WIDTH = 506;
    const CARD_HEIGHT = 319;

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

        // Check if logo is loaded
        if (!logoDataUrl) {
            toast.error("Logo not loaded yet. Please wait and try again.");
            return;
        }

        setIsDownloading(true);

        // Get parent container
        const container = pdfFrontRef.current.parentElement;

        // Helper to wait for all images in a container to load
        const waitForImages = async (element: HTMLElement): Promise<void> => {
            const images = element.querySelectorAll('img');
            const promises = Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if image fails
                });
            });
            await Promise.all(promises);
        };

        try {
            // Make container visible for capture
            if (container) {
                container.style.position = 'fixed';
                container.style.left = '0';
                container.style.top = '0';
                container.style.opacity = '1';
                container.style.zIndex = '9999';
                container.style.background = 'white';
                container.style.padding = '20px';
            }

            // Wait for DOM update
            await new Promise(resolve => setTimeout(resolve, 300));

            // Wait for all images in both card containers to load
            await waitForImages(pdfFrontRef.current);
            await waitForImages(pdfBackRef.current);

            // Additional wait for rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // CR80 card dimensions in mm (standard ID card)
            const cardWidthMM = 85.6;
            const cardHeightMM = 54;

            // Card dimensions in pixels (506 x 319 at 150 DPI equivalent)
            const cardWidthPx = CARD_WIDTH;
            const cardHeightPx = CARD_HEIGHT;

            // Create PDF with exact card dimensions
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [cardWidthMM, cardHeightMM],
            });

            // High quality html2canvas options - CRITICAL: set explicit dimensions
            const createCanvasOptions = (bgColor: string) => ({
                scale: 3, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: bgColor,
                imageTimeout: 10000,
                removeContainer: false,
                foreignObjectRendering: false,
                // CRITICAL: Explicitly set dimensions to prevent cropping
                width: cardWidthPx,
                height: cardHeightPx,
                windowWidth: cardWidthPx,
                windowHeight: cardHeightPx,
            });

            // Capture Front Card
            console.log('Capturing front card...');
            const frontElement = pdfFrontRef.current;

            // Ensure the element has correct dimensions before capture
            frontElement.style.width = `${cardWidthPx}px`;
            frontElement.style.height = `${cardHeightPx}px`;
            frontElement.style.overflow = 'visible';

            const frontCanvas = await html2canvas(frontElement, createCanvasOptions('#0a3d62'));
            console.log('Front canvas:', frontCanvas.width, 'x', frontCanvas.height);

            const frontImg = frontCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(frontImg, 'PNG', 0, 0, cardWidthMM, cardHeightMM, undefined, 'FAST');

            // Add new page for back
            pdf.addPage([cardWidthMM, cardHeightMM], 'landscape');

            // Capture Back Card
            console.log('Capturing back card...');
            const backElement = pdfBackRef.current;

            // Ensure the element has correct dimensions before capture
            backElement.style.width = `${cardWidthPx}px`;
            backElement.style.height = `${cardHeightPx}px`;
            backElement.style.overflow = 'visible';

            const backCanvas = await html2canvas(backElement, createCanvasOptions('#ffffff'));
            console.log('Back canvas:', backCanvas.width, 'x', backCanvas.height);

            const backImg = backCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(backImg, 'PNG', 0, 0, cardWidthMM, cardHeightMM, undefined, 'FAST');

            // Hide container again
            if (container) {
                container.style.position = 'fixed';
                container.style.left = '-9999px';
                container.style.opacity = '0';
                container.style.zIndex = '-1';
                container.style.background = 'transparent';
                container.style.padding = '0';
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

    const FrontCardContent = ({ forPdf = false }: { forPdf?: boolean }) => {

        const cardStyle: React.CSSProperties = {
            width: forPdf ? `${CARD_WIDTH}px` : '100%',
            height: forPdf ? `${CARD_HEIGHT}px` : 'auto',
            aspectRatio: forPdf ? undefined : '85.6 / 54',
            background: 'linear-gradient(135deg, #0a3d62 0%, #1a5276 40%, #0a3d62 100%)',
            borderRadius: forPdf ? '12px' : '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: forPdf ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        };

        return (
            <div style={cardStyle}>
                {/* Decorative wave pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(135deg, transparent 0%, rgba(45, 212, 191, 0.08) 50%, transparent 100%)',
                    clipPath: 'ellipse(80% 100% at 100% 50%)',
                }} />

                {/* Top accent line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
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
                    padding: forPdf ? '24px' : '18px',
                    paddingTop: forPdf ? '28px' : '22px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left section - Photo */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: forPdf ? '130px' : '110px',
                        flexShrink: 0,
                    }}>
                        {/* Photo container with professional frame */}
                        <div style={{
                            width: forPdf ? '110px' : '90px',
                            height: forPdf ? '130px' : '106px',
                            borderRadius: '8px',
                            border: '3px solid rgba(45, 212, 191, 0.6)',
                            overflow: 'hidden',
                            background: '#0d4a6e',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(45, 212, 191, 0.1)',
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
                                    <span style={{ color: 'white', fontSize: forPdf ? '42px' : '34px', fontWeight: 'bold' }}>
                                        {profile.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Membership type badge */}
                        <div style={{
                            marginTop: forPdf ? '10px' : '8px',
                            padding: forPdf ? '5px 16px' : '4px 12px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            boxShadow: '0 2px 10px rgba(45, 212, 191, 0.4)',
                        }}>
                            <span style={{
                                color: 'white',
                                fontSize: forPdf ? '10px' : '8px',
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
                        margin: forPdf ? '0 20px' : '0 14px',
                    }} />

                    {/* Right section - Details */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                    }}>
                        {/* Header with name and logo */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: forPdf ? '6px' : '4px' }}>
                            <div style={{ flex: 1, paddingRight: '10px', minWidth: 0 }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: forPdf ? '22px' : '18px',
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
                                        fontSize: forPdf ? '11px' : '9px',
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
                                width: forPdf ? '65px' : '52px',
                                height: forPdf ? '65px' : '52px',
                                background: 'white',
                                borderRadius: '10px',
                                padding: '5px',
                                flexShrink: 0,
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                            }}>
                                <img
                                    src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </div>

                        {/* Details Grid - 2x2 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: forPdf ? '12px 24px' : '8px 16px',
                            marginTop: forPdf ? '12px' : '8px',
                            flex: 1,
                        }}>
                            {/* Registration No */}
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Registration No.</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '14px' : '12px',
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
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>CNIC</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '13px' : '11px',
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
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>City</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '14px' : '12px',
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
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Valid Until</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '14px' : '12px',
                                    fontWeight: 700,
                                    color: isValid ? '#5eead4' : '#fca5a5',
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
                            paddingTop: forPdf ? '10px' : '6px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        }}>
                            <span style={{
                                fontSize: forPdf ? '8px' : '6px',
                                color: 'rgba(255, 255, 255, 0.55)',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
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
                    height: '4px',
                    background: 'linear-gradient(90deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%)',
                }} />
            </div>
        );
    };

    const BackCardContent = ({ forPdf = false }: { forPdf?: boolean }) => {
        const cardStyle: React.CSSProperties = {
            width: forPdf ? `${CARD_WIDTH}px` : '100%',
            height: forPdf ? `${CARD_HEIGHT}px` : 'auto',
            aspectRatio: forPdf ? undefined : '85.6 / 54',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: forPdf ? '12px' : '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: forPdf ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.15)',
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

                {/* Decorative wave pattern */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    height: '60%',
                    background: 'linear-gradient(135deg, transparent 0%, rgba(10, 61, 98, 0.03) 50%, transparent 100%)',
                    clipPath: 'ellipse(100% 80% at 100% 100%)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: forPdf ? '24px' : '18px',
                    paddingTop: forPdf ? '28px' : '22px',
                    boxSizing: 'border-box',
                }}>
                    {/* Left - QR Code */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: forPdf ? '130px' : '110px',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            padding: forPdf ? '10px' : '8px',
                            background: 'white',
                            borderRadius: '10px',
                            border: '2px solid rgba(10, 61, 98, 0.15)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                        }}>
                            <QRCodeCanvas
                                value={verificationUrl}
                                size={forPdf ? 100 : 80}
                                level="H"
                                fgColor="#0a3d62"
                                bgColor="#ffffff"
                                includeMargin={false}
                            />
                        </div>
                        <p style={{
                            marginTop: forPdf ? '10px' : '8px',
                            fontSize: forPdf ? '9px' : '7px',
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
                        margin: forPdf ? '0 20px' : '0 14px',
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
                            gap: forPdf ? '12px' : '10px',
                            marginBottom: forPdf ? '8px' : '6px',
                            paddingBottom: forPdf ? '8px' : '6px',
                            borderBottom: '1px solid rgba(10, 61, 98, 0.1)',
                        }}>
                            <div style={{
                                width: forPdf ? '70px' : '56px',
                                height: forPdf ? '70px' : '56px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: 'white',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                padding: '5px',
                                flexShrink: 0,
                            }}>
                                <img
                                    src={forPdf && logoDataUrl ? logoDataUrl : '/logo.jpg'}
                                    alt="SOOOP"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: forPdf ? '16px' : '13px',
                                    fontWeight: 700,
                                    color: '#0a3d62',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>{profile.full_name}</h3>
                                <p style={{
                                    margin: forPdf ? '4px 0 0 0' : '3px 0 0 0',
                                    fontSize: forPdf ? '8px' : '6px',
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
                            gap: forPdf ? '10px 16px' : '6px 12px',
                            flex: 1,
                        }}>
                            <div>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '8px' : '6px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '2px',
                                }}>Father/Husband</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '12px' : '10px',
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
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Blood Group</span>
                                <span style={{
                                    fontSize: forPdf ? '24px' : '18px',
                                    fontWeight: 900,
                                    color: '#EF4444',
                                }}>
                                    {profile.blood_group || '—'}
                                </span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '9px' : '7px',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '3px',
                                }}>Validity Period</span>
                                <span style={{
                                    display: 'block',
                                    fontSize: forPdf ? '13px' : '11px',
                                    fontWeight: 600,
                                    color: '#1f2937',
                                }}>
                                    {getValidityPeriod() || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div style={{
                            padding: forPdf ? '10px 12px' : '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(10, 61, 98, 0.04)',
                            border: '1px solid rgba(10, 61, 98, 0.08)',
                            marginTop: forPdf ? '10px' : '8px',
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: forPdf ? '8px' : '6px',
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
                            paddingTop: forPdf ? '10px' : '8px',
                            marginTop: forPdf ? '8px' : '6px',
                            borderTop: '1px solid rgba(10, 61, 98, 0.1)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield style={{ width: forPdf ? '14px' : '10px', height: forPdf ? '14px' : '10px', color: '#14b8a6' }} />
                                <span style={{
                                    fontSize: forPdf ? '10px' : '8px',
                                    fontWeight: 600,
                                    color: '#0a3d62',
                                }}>www.soopvision.com</span>
                            </div>
                            <span style={{
                                fontSize: forPdf ? '10px' : '8px',
                                color: '#6b7280',
                                fontFamily: 'monospace',
                                fontWeight: 600,
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
                    height: '4px',
                    background: 'linear-gradient(90deg, #0a3d62 0%, #1a5276 50%, #0a3d62 100%)',
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
                    width: `${CARD_WIDTH + 40}px`,
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
                aria-hidden="true"
            >
                <div ref={pdfFrontRef} style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px`, background: '#0a3d62', overflow: 'hidden' }}>
                    <FrontCardContent forPdf={true} />
                </div>
                <div ref={pdfBackRef} style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px`, marginTop: '20px', background: '#ffffff', overflow: 'hidden' }}>
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
