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
    darkPurple: '#3d0066',
    gold: '#D4AF37',
    text: '#111827',
    lightText: '#6b7280',
    red: '#dc2626',
    white: '#ffffff',
    bg: '#ffffff',
    border: '#000000'
};

// --- A4 LANDSCAPE DIMENSIONS (POINTS) ---
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 20;
const SIDEBAR_WIDTH = 240; // ~28% of page width

const styles = StyleSheet.create({
    page: {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        backgroundColor: colors.bg,
        fontFamily: 'Helvetica',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    },

    // --- OUTER BORDER ---
    borderContainer: {
        position: 'absolute',
        top: MARGIN,
        left: MARGIN,
        right: MARGIN,
        bottom: MARGIN,
        width: PAGE_WIDTH - (MARGIN * 2),
        height: PAGE_HEIGHT - (MARGIN * 2),
        borderWidth: 2,
        borderColor: colors.border,
        zIndex: 1,
        pointerEvents: 'none',
    },

    // --- SIDEBAR (LEFT SECTION) ---
    sidebarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: PAGE_HEIGHT,
        zIndex: 2,
    },

    sidebarCurve: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: PAGE_HEIGHT,
        zIndex: 2,
    },

    sidebarContent: {
        position: 'absolute',
        top: MARGIN + 20,
        left: MARGIN,
        right: MARGIN,
        width: SIDEBAR_WIDTH - (MARGIN * 2),
        height: PAGE_HEIGHT - (MARGIN * 2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 3,
    },

    // --- PHOTO SECTION ---
    photoContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.white,
        borderWidth: 3,
        borderColor: colors.white,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    photo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },

    photoPlaceholder: {
        fontSize: 9,
        color: colors.lightText,
        textAlign: 'center',
    },

    // --- DIAMOND DECORATION ---
    diamondContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },

    diamond: {
        width: 18,
        height: 18,
        backgroundColor: colors.gold,
        transform: 'rotate(45deg)',
    },

    // --- QR CODE SECTION ---
    qrSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 4,
        padding: 8,
        flexShrink: 0,
    },

    qrCode: {
        width: 90,
        height: 90,
    },

    scanText: {
        marginTop: 6,
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.purple,
        textTransform: 'uppercase',
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },

    // --- MAIN CONTENT AREA ---
    contentContainer: {
        position: 'absolute',
        top: MARGIN,
        left: SIDEBAR_WIDTH,
        right: MARGIN,
        bottom: MARGIN,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - (MARGIN * 2),
        height: PAGE_HEIGHT - (MARGIN * 2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 4,
        paddingHorizontal: 30,
        paddingVertical: 25,
    },

    // --- HEADER SECTION ---
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: colors.gold,
        paddingBottom: 16,
        marginBottom: 25,
        width: '100%',
    },

    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },

    certTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        letterSpacing: 2,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },

    certSubtitle: {
        fontSize: 14,
        color: colors.text,
        letterSpacing: 3,
        textTransform: 'uppercase',
        fontFamily: 'Helvetica',
    },

    headerRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },

    serialNo: {
        fontSize: 10,
        color: colors.red,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'Helvetica-Bold',
    },

    orgBlock: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },

    orgText: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        borderRightWidth: 1,
        borderRightColor: colors.gold,
        paddingRight: 8,
    },

    orgLine: {
        fontSize: 7,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
        textAlign: 'right',
        lineHeight: 1.2,
    },

    logo: {
        width: 40,
        height: 40,
        objectFit: 'contain',
    },

    // --- BODY SECTION ---
    bodySection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        marginBottom: 20,
    },

    certifyText: {
        fontSize: 11,
        color: colors.lightText,
        fontStyle: 'italic',
        marginBottom: 12,
    },

    memberName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.gold,
        textTransform: 'capitalize',
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
    },

    memberNo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.purple,
        textTransform: 'uppercase',
        marginBottom: 20,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
    },

    bodyText: {
        fontSize: 11,
        textAlign: 'center',
        color: colors.text,
        lineHeight: 1.5,
        width: '100%',
        marginBottom: 16,
    },

    validityText: {
        fontSize: 10,
        fontStyle: 'italic',
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
    },

    // --- FOOTER SECTION ---
    footerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        paddingTop: 16,
    },

    signatureBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '30%',
    },

    signatureImage: {
        height: 45,
        width: 110,
        objectFit: 'contain',
        marginBottom: 4,
    },

    signatureLine: {
        width: '100%',
        height: 2,
        backgroundColor: colors.purple,
        marginBottom: 6,
    },

    signatureRole: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },

    // --- VERIFICATION URL ---
    verificationContainer: {
        position: 'absolute',
        bottom: 8,
        left: SIDEBAR_WIDTH,
        right: MARGIN,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - MARGIN,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
    },

    verifyText: {
        fontSize: 9,
        color: colors.lightText,
        textAlign: 'center',
    },

    verifyUrl: {
        color: colors.gold,
        fontWeight: 'bold',
        textDecoration: 'none',
    },

    // --- CORNER DECORATIONS ---
    cornerTriangle: {
        position: 'absolute',
        zIndex: 5,
    },

    topLeftTriangle: {
        top: MARGIN,
        left: MARGIN,
        width: 50,
        height: 50,
    },

    bottomRightTriangle: {
        bottom: MARGIN,
        right: MARGIN,
        width: 50,
        height: 50,
    },
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

const MembershipCertificatePDF = ({
    profile,
    logoDataUrl,
    qrDataUrl,
    photoDataUrl,
    signatureDataUrl,
}: CertificateProps) => {
    // --- DATE FORMATTING ---
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const validFrom = profile.subscription_start_date
        ? new Date(profile.subscription_start_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : issueDate;

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

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* OUTER BORDER */}
                <View style={styles.borderContainer} />

                {/* SIDEBAR BACKGROUND CURVE */}
                <View style={styles.sidebarContainer}>
                    <Svg
                        width={SIDEBAR_WIDTH}
                        height={PAGE_HEIGHT}
                        viewBox={`0 0 ${SIDEBAR_WIDTH} ${PAGE_HEIGHT}`}
                        style={styles.sidebarCurve}
                    >
                        <Path
                            d={`M0,0 L${SIDEBAR_WIDTH * 0.8},0 Q${SIDEBAR_WIDTH},${PAGE_HEIGHT / 2} ${SIDEBAR_WIDTH * 0.8},${PAGE_HEIGHT} L0,${PAGE_HEIGHT} Z`}
                            fill={colors.purple}
                        />
                    </Svg>

                    {/* SIDEBAR CONTENT */}
                    <View style={styles.sidebarContent}>
                        {/* PHOTO */}
                        <View style={styles.photoContainer}>
                            {photoDataUrl ? (
                                <Image src={photoDataUrl} style={styles.photo} />
                            ) : (
                                <Text style={styles.photoPlaceholder}>NO PHOTO</Text>
                            )}
                        </View>

                        {/* DIAMOND DECORATION */}
                        <View style={styles.diamondContainer}>
                            <View style={styles.diamond} />
                        </View>

                        {/* QR CODE */}
                        <View style={styles.qrSection}>
                            {qrDataUrl ? (
                                <Image src={qrDataUrl} style={styles.qrCode} />
                            ) : (
                                <View style={{ width: 90, height: 90, backgroundColor: colors.gold }} />
                            )}
                            <Text style={styles.scanText}>Scan me</Text>
                        </View>
                    </View>
                </View>

                {/* TOP LEFT GOLD TRIANGLE */}
                <Svg style={[styles.cornerTriangle, styles.topLeftTriangle]} viewBox="0 0 50 50">
                    <Path d="M0,0 L50,0 L0,50 Z" fill={colors.gold} />
                </Svg>

                {/* BOTTOM RIGHT GOLD TRIANGLE */}
                <Svg style={[styles.cornerTriangle, styles.bottomRightTriangle]} viewBox="0 0 50 50">
                    <Path d="M50,0 L50,50 L0,50 Z" fill={colors.gold} />
                </Svg>

                {/* MAIN CONTENT */}
                <View style={styles.contentContainer}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.certTitle}>Certificate</Text>
                            <Text style={styles.certSubtitle}>of Membership</Text>
                        </View>

                        <View style={styles.headerRight}>
                            <Text style={styles.serialNo}>Serial No: {profile.id.slice(0, 8).toUpperCase()}</Text>

                            <View style={styles.orgBlock}>
                                <View style={styles.orgText}>
                                    <Text style={styles.orgLine}>Society of</Text>
                                    <Text style={styles.orgLine}>Optometrists</Text>
                                    <Text style={styles.orgLine}>Pakistan</Text>
                                </View>
                                {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                            </View>
                        </View>
                    </View>

                    {/* BODY */}
                    <View style={styles.bodySection}>
                        <Text style={styles.certifyText}>this is to certify that</Text>

                        <Text style={styles.memberName}>{profile.full_name}</Text>

                        <Text style={styles.memberNo}>MEMBERSHIP NO: {profile.registration_number || 'PENDING'}</Text>

                        <Text style={styles.bodyText}>
                            is a member of good standing and abides by the constitution, by-laws and code of ethics of the
                            Society of Optometrists Pakistan (SOOOP) under {membershipType} membership.
                        </Text>

                        <Text style={styles.validityText}>
                            This document is valid from {validFrom} to {validUntil} For
                        </Text>
                    </View>

                    {/* FOOTER - SIGNATURES */}
                    <View style={styles.footerContainer}>
                        <View style={styles.signatureBlock}>
                            <View style={{ height: 45, marginBottom: 4 }} />
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureRole}>Secretary General</Text>
                        </View>

                        <View style={styles.signatureBlock} />

                        <View style={styles.signatureBlock}>
                            {signatureDataUrl ? (
                                <Image src={signatureDataUrl} style={styles.signatureImage} />
                            ) : (
                                <View style={{ height: 45, marginBottom: 4 }} />
                            )}
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureRole}>SOOOP President</Text>
                        </View>
                    </View>

                    {/* VERIFICATION URL */}
                    <View style={styles.verificationContainer}>
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
