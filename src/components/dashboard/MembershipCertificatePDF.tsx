
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Svg,
    Path,
} from '@react-pdf/renderer';

// --- COLOR PALETTE ---
const colors = {
    purple: '#4b0082',
    gold: '#D4AF37',
    text: '#111827',
    lightText: '#6b7280',
    red: '#dc2626',
    white: '#ffffff',
    bg: '#ffffff'
};

// --- A4 LANDSCAPE DIMENSIONS (POINTS) ---
// Width: 841.89pt, Height: 595.28pt
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 40;

const styles = StyleSheet.create({
    page: {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        backgroundColor: colors.bg,
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    // --- LAYOUT LAYERS ---
    // 1. Sidebar (Left Curve)
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 260, // Fixed width for sidebar area
        height: PAGE_HEIGHT,
        zIndex: 1,
    },
    // 2. Main Content Container (Right)
    content: {
        position: 'absolute',
        top: MARGIN,
        left: 260, // Starts after sidebar
        right: MARGIN,
        bottom: MARGIN,
        height: PAGE_HEIGHT - (MARGIN * 2),
        width: PAGE_WIDTH - 260 - MARGIN,
        zIndex: 2,
    },
    // 3. Border (Overlay)
    border: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        width: PAGE_WIDTH - 40,
        height: PAGE_HEIGHT - 40,
        border: `1px solid black`,
        zIndex: 3,
        pointerEvents: 'none'
    },

    // --- SIDEBAR ELEMENTS ---
    sidebarContent: {
        position: 'absolute',
        top: 60,
        left: 0,
        width: 220, // Content is slightly narrower than curve
        alignItems: 'center',
    },
    photoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.white,
        border: `4px solid ${colors.white}`,
        overflow: 'hidden',
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    photoPlaceholder: {
        fontSize: 10,
        color: colors.lightText,
        textAlign: 'center',
    },
    diamond: {
        width: 20,
        height: 20,
        backgroundColor: colors.gold,
        transform: 'rotate(45deg)',
        marginBottom: 180, // Space between diamond and QR
    },
    qrContainer: {
        width: 110,
        padding: 8,
        backgroundColor: colors.white,
        borderRadius: 4,
        alignItems: 'center',
    },
    qrCode: {
        width: 94,
        height: 94,
    },
    scanText: {
        marginTop: 4,
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.purple,
        textTransform: 'uppercase',
    },

    // --- CORNER DECORATIONS ---
    topLeftTriangle: {
        position: 'absolute',
        top: 20,
        left: 0,
        width: 60,
        height: 60,
        zIndex: 4,
    },
    bottomRightTriangle: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        zIndex: 4,
    },

    // --- CONTENT SECTIONS ---
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        borderBottom: `1px solid ${colors.gold}`,
        paddingBottom: 20,
    },
    titleSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    certTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.text,
        letterSpacing: 2,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    certSubtitle: {
        fontSize: 16,
        marginTop: 5,
        color: colors.text,
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    // Right Header Block
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    serialNo: {
        fontSize: 12,
        color: colors.red,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
    },
    logoBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoTextGroup: {
        alignItems: 'flex-end',
        marginRight: 10,
        paddingRight: 10,
        borderRight: `1px solid ${colors.gold}`,
    },
    logoText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
        textAlign: 'right',
    },
    logo: {
        width: 50,
        height: 50,
        objectFit: 'contain',
    },

    // Body
    body: {
        alignItems: 'center',
        width: '100%',
    },
    certifyText: {
        fontSize: 12,
        color: colors.lightText,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    memberName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.gold,
        textTransform: 'capitalize',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
    },
    memberNo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.purple,
        textTransform: 'uppercase',
        marginBottom: 30,
        fontFamily: 'Helvetica-Bold',
    },
    bodyParagraph: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.text,
        lineHeight: 1.6,
        maxWidth: 480,
        marginBottom: 40,
    },
    validity: {
        fontSize: 11,
        fontStyle: 'italic',
        color: colors.text,
        marginBottom: 50,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        marginTop: 'auto',
        position: 'absolute',
        bottom: 20,
    },
    sigBlock: {
        width: 180,
        alignItems: 'center',
    },
    sigImage: {
        height: 50,
        width: 120,
        objectFit: 'contain',
        marginBottom: 5,
    },
    sigBar: {
        width: '100%',
        height: 4,
        backgroundColor: colors.purple,
        marginBottom: 5,
    },
    sigRole: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
    },

    // Bottom Verification
    verifyBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
    },
    verifyText: {
        fontSize: 9,
        color: colors.lightText,
    },
    verifyUrl: {
        color: colors.gold,
        fontWeight: 'bold',
        textDecoration: 'none',
    }
});

interface CertificateProps {
    profile: {
        id: string;
        full_name: string;
        registration_number?: string;
        membership_type?: string;
        subscription_start_date?: string;
        subscription_end_date?: string;
    };
    logoDataUrl?: string | null;
    qrDataUrl?: string | null;
    photoDataUrl?: string | null;
    signatureDataUrl?: string | null;
}

const MembershipCertificatePDF = ({ profile, logoDataUrl, qrDataUrl, photoDataUrl, signatureDataUrl }: CertificateProps) => {

    // --- DATA PREPARATION ---
    const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const validFrom = profile.subscription_start_date
        ? new Date(profile.subscription_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : issueDate;

    const validUntil = profile.subscription_end_date
        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    // --- RENDER ---
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>

                {/* 1. OUTER BORDER */}
                <View style={styles.border} />

                {/* 2. SIDEBAR (Reference: Left Curved Purple Panel) */}
                <View style={styles.sidebar}>
                    {/* Background Curve SVG */}
                    <Svg width={260} height={PAGE_HEIGHT} viewBox={`0 0 260 ${PAGE_HEIGHT}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                        <Path
                            d={`M0,0 L200,0 Q260,${PAGE_HEIGHT / 2} 200,${PAGE_HEIGHT} L0,${PAGE_HEIGHT} Z`}
                            fill={colors.purple}
                        />
                    </Svg>

                    {/* Sidebar Content Overlay */}
                    <View style={styles.sidebarContent}>
                        {/* Member Photo (Circle) */}
                        <View style={styles.photoContainer}>
                            {photoDataUrl ? (
                                <Image src={photoDataUrl} style={styles.photo} />
                            ) : (
                                <Text style={styles.photoPlaceholder}>NO PHOTO</Text>
                            )}
                        </View>

                        {/* Gold Diamond Decoration */}
                        <View style={styles.diamond} />

                        {/* Bottom QR Block */}
                        <View style={styles.qrContainer}>
                            {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCode} />}
                            <Text style={styles.scanText}>Scan me</Text>
                        </View>
                    </View>
                </View>

                {/* 3. CORNER DECORATIONS */}
                {/* Top Left Gold Triangle (Behind border) */}
                <Svg style={styles.topLeftTriangle} viewBox="0 0 60 60">
                    <Path d="M0,0 L60,0 L0,60 Z" fill={colors.gold} />
                </Svg>

                {/* Bottom Right Gold Triangle */}
                <Svg style={styles.bottomRightTriangle} viewBox="0 0 60 60">
                    <Path d="M60,0 L60,60 L0,60 Z" fill={colors.gold} />
                </Svg>

                {/* 4. MAIN CONTENT AREA */}
                <View style={styles.content}>

                    {/* Header: Title + Logo Block */}
                    <View style={styles.header}>
                        <View style={styles.titleSection}>
                            <Text style={styles.certTitle}>Certificate</Text>
                            <Text style={styles.certSubtitle}>Of Membership</Text>
                        </View>

                        <View style={styles.headerRight}>
                            <Text style={styles.serialNo}>Serial No: {profile.id.slice(0, 8).toUpperCase()}</Text>

                            <View style={styles.logoBlock}>
                                <View style={styles.logoTextGroup}>
                                    <Text style={styles.logoText}>Society of</Text>
                                    <Text style={styles.logoText}>Optometrists</Text>
                                    <Text style={styles.logoText}>Pakistan</Text>
                                </View>
                                {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                            </View>
                        </View>
                    </View>

                    {/* Body: Name + Details */}
                    <View style={styles.body}>
                        <Text style={styles.certifyText}>this is to certify that</Text>

                        <Text style={styles.memberName}>{profile.full_name}</Text>

                        <Text style={styles.memberNo}>MEMBERSHIP NO: {profile.registration_number || 'PENDING'}</Text>

                        <Text style={styles.bodyParagraph}>
                            is a member of good standing and abides by the constitution, by-laws and code of ethics of the
                            Society of Optometrists Pakistan (SOOOP) under {membershipType} membership.
                        </Text>

                        <Text style={styles.validity}>
                            This document is valid from {validFrom} to {validUntil}
                        </Text>
                    </View>

                    {/* Footer: Signatures */}
                    <View style={styles.footer}>
                        {/* Left: Secretary General */}
                        <View style={styles.sigBlock}>
                            {/* Placeholder for Sec Gen sig if available, otherwise space */}
                            <View style={{ height: 50, marginBottom: 5 }} />
                            <View style={styles.sigBar} />
                            <Text style={styles.sigRole}>Secretary General</Text>
                        </View>

                        {/* Right: President */}
                        <View style={styles.sigBlock}>
                            {signatureDataUrl ? (
                                <Image src={signatureDataUrl} style={styles.sigImage} />
                            ) : (
                                <View style={{ height: 50, marginBottom: 5 }} />
                            )}
                            <View style={styles.sigBar} />
                            <Text style={styles.sigRole}>SOOOP President</Text>
                        </View>
                    </View>

                    {/* Bottom Center: Verification Line */}
                    <View style={styles.verifyBar}>
                        <Text style={styles.verifyText}>
                            Visit <Text style={styles.verifyUrl}>sooopvision.com/verify</Text> to validate
                        </Text>
                    </View>

                </View>

            </Page>
        </Document>
    );
};

export default MembershipCertificatePDF;
