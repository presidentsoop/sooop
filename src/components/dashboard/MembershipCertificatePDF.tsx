
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Svg,
    Path,
    Rect
} from '@react-pdf/renderer';

// Color Palette - OAK Style
const colors = {
    primary: '#4b0082', // Deep Purple (Brand)
    secondary: '#D4AF37', // Gold (Accent)
    text: '#1f2937', // Dark Gray
    lightText: '#6b7280', // Light Gray
    red: '#dc2626', // For Serial Number
    white: '#ffffff',
    lightPurple: '#f3e8ff', // For QR background
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    // Left Sidebar (Purple Ribbon)
    sidebar: {
        width: '22%',
        height: '100%',
        backgroundColor: 'transparent', // We draw the shape with absolute positioning or SVG
        position: 'relative',
        zIndex: 2,
    },
    // The curved purple shape
    sidebarCurve: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
    },
    sidebarContent: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        zIndex: 3,
    },
    // Photo Circle (Badge)
    photoBadge: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.white,
        padding: 4,
        marginBottom: 40,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        objectFit: 'cover',
    },
    // Gold Diamond Accent
    diamond: {
        width: 30,
        height: 30,
        backgroundColor: colors.secondary,
        transform: 'rotate(45deg)',
        marginBottom: 'auto', // Pushes QR down
    },
    // QR Block
    qrBlock: {
        backgroundColor: colors.white,
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 40,
    },
    qrCode: {
        width: 90,
        height: 90,
    },
    scanMe: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 5,
        textTransform: 'uppercase',
    },

    // Main Content Area
    content: {
        flex: 1,
        padding: 40,
        paddingTop: 45,
        position: 'relative',
    },
    // Border
    border: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: `2px solid #000`,
        top: 0,
        left: 0,
        zIndex: 1,
    },

    // Header Zone
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        borderBottom: `1px solid ${colors.secondary}`, // Gold divider line concept
        paddingBottom: 20,
    },
    titleGroup: {
        alignItems: 'flex-start',
    },
    certTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 2,
    },
    certSubtitle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: colors.text,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginTop: 5,
    },

    // Right Header (Logo + Serial)
    headerRight: {
        alignItems: 'flex-end',
    },
    serialNo: {
        fontSize: 12,
        color: colors.red,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 50,
        height: 50,
        objectFit: 'contain',
    },
    orgName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
        maxWidth: 100,
        textAlign: 'right',
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: colors.secondary,
        marginHorizontal: 15,
    },

    // Body
    body: {
        alignItems: 'center',
        marginTop: 20,
    },
    certifyText: {
        fontSize: 12,
        color: colors.lightText,
        marginBottom: 15,
    },
    memberName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.secondary, // Gold
        textTransform: 'capitalize',
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    membershipNoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    membershipLabel: {
        fontSize: 14,
        color: colors.primary, // Purple
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    membershipValue: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
        marginLeft: 5,
    },

    bodyParagraph: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.text,
        lineHeight: 1.6,
        marginTop: 30,
        marginBottom: 30,
        maxWidth: 500,
    },

    validity: {
        fontSize: 11,
        color: colors.text,
        marginBottom: 50,
        fontStyle: 'italic',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 'auto',
        width: '100%',
        paddingBottom: 20,
    },
    sigBlock: {
        width: 200,
        alignItems: 'center',
    },
    sigImage: {
        height: 40,
        marginBottom: 5,
        objectFit: 'contain',
    },
    sigLine: {
        width: '100%',
        height: 3,
        backgroundColor: colors.primary, // Purple thick bar
        marginBottom: 4,
    },
    sigRole: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
    },

    // Center Badge/Seal
    centerBadge: {
        alignItems: 'center',
    },

    // Bottom Verify
    verifyRow: {
        position: 'absolute',
        bottom: 10,
        width: '100%', // Relative to content area
        textAlign: 'center',
        left: 40, // content padding offset
        fontSize: 9,
        color: colors.lightText,
    },
    verifyUrl: {
        color: colors.secondary,
        fontWeight: 'bold',
    },

    // Corner Accents
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
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
        role?: string;
    };
    logoDataUrl?: string | null;
    qrDataUrl?: string | null;
    photoDataUrl?: string | null;
    signatureDataUrl?: string | null;
}

const MembershipCertificatePDF = ({ profile, logoDataUrl, qrDataUrl, photoDataUrl, signatureDataUrl }: CertificateProps) => {
    // Format Dates
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // Default 1 year validity
    const validFrom = profile.subscription_start_date
        ? new Date(profile.subscription_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : issueDate;

    const validUntil = profile.subscription_end_date
        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* 1. Purple Ribbon Sidebar */}
                <View style={[styles.sidebar, { width: '25%' }]}>
                    {/* Purple Background Shape (Curved) */}
                    <Svg style={styles.sidebarCurve} viewBox="0 0 200 800">
                        <Path
                            d="M0,0 L160,0 Q200,400 160,800 L0,800 Z"
                            fill={colors.primary}
                        />
                    </Svg>

                    <View style={styles.sidebarContent}>
                        {/* Photo */}
                        <View style={styles.photoBadge}>
                            {photoDataUrl ? (
                                <Image src={photoDataUrl} style={styles.photo} />
                            ) : null}
                        </View>

                        {/* Gold Diamond */}
                        <View style={styles.diamond} />

                        {/* QR Code */}
                        <View style={styles.qrBlock}>
                            {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCode} />}
                            <Text style={styles.scanMe}>Scan me</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Main Content Area */}
                <View style={styles.content}>
                    {/* Outline Border (Visual Frame) */}
                    <View style={{
                        position: 'absolute',
                        top: 20, left: 0, right: 20, bottom: 20,
                        border: '1px solid #000',
                        zIndex: -1
                    }} />

                    {/* Corner Accent: Gold Triangle Top Right */}
                    <Svg style={{ position: 'absolute', top: 20, left: 0, width: 50, height: 50 }} viewBox="0 0 50 50">
                        <Path d="M0,0 L50,0 L0,50 Z" fill={colors.secondary} />
                    </Svg>
                    {/* Corner Accent: Gold Triangle Bottom Right */}
                    <Svg style={{ position: 'absolute', bottom: 20, right: 20, width: 50, height: 50 }} viewBox="0 0 50 50">
                        <Path d="M50,0 L50,50 L0,50 Z" fill={colors.secondary} />
                    </Svg>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleGroup}>
                            <Text style={styles.certTitle}>Certificate</Text>
                            <Text style={styles.certSubtitle}>Of Membership</Text>
                        </View>

                        <View style={styles.headerRight}>
                            <Text style={styles.serialNo}>Serial No: {profile.id.slice(0, 8).toUpperCase()}</Text>
                            <View style={styles.logoRow}>
                                <View style={styles.divider} />
                                <View>
                                    <Text style={styles.orgName}>SOCIETY OF</Text>
                                    <Text style={styles.orgName}>OPTOMETRISTS</Text>
                                    <Text style={styles.orgName}>PAKISTAN</Text>
                                </View>
                                {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                            </View>
                        </View>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        <Text style={styles.certifyText}>this is to certify that</Text>

                        <Text style={styles.memberName}>{profile.full_name}</Text>

                        <View style={styles.membershipNoRow}>
                            <Text style={styles.membershipLabel}>MEMBERSHIP NO:</Text>
                            <Text style={styles.membershipValue}>{profile.registration_number || 'PENDING'}</Text>
                        </View>

                        <Text style={styles.bodyParagraph}>
                            is a member of good standing and abides by the constitution, by-laws and code of ethics of the Society of Optometrists Pakistan (SOOOP) under {membershipType} membership.
                        </Text>

                        <Text style={styles.validity}>
                            This document is valid from {validFrom} to {validUntil}
                        </Text>
                    </View>

                    {/* Footer / Signatures */}
                    <View style={styles.footer}>
                        {/* Secretary Signature (Left) */}
                        <View style={styles.sigBlock}>
                            {/* If we had a sig for secretary, it would go here. Layout preserved. */}
                            <View style={{ height: 40 }} />
                            <View style={styles.sigLine} />
                            <Text style={styles.sigRole}>Secretary General</Text>
                        </View>

                        {/* Center Seal/Badge (Optional placeholder) */}
                        <View style={styles.centerBadge}>
                            {/* Could put a globe icon here if available */}
                        </View>

                        {/* President Signature (Right) */}
                        <View style={styles.sigBlock}>
                            {signatureDataUrl ? (
                                <Image src={signatureDataUrl} style={styles.sigImage} />
                            ) : <View style={{ height: 40 }} />}
                            <View style={styles.sigLine} />
                            <Text style={styles.sigRole}>SOOOP President</Text>
                        </View>
                    </View>

                    {/* Bottom Verification Text */}
                    <Text style={{
                        fontSize: 9,
                        color: colors.lightText,
                        textAlign: 'center',
                        marginTop: 10
                    }}>
                        Visit <Text style={{ color: colors.secondary, fontWeight: 'bold' }}>sooopvision.com/verify</Text> to validate
                    </Text>

                </View>
            </Page>
        </Document>
    );
};

export default MembershipCertificatePDF;
