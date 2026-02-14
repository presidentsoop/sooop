
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

// Color Palette - Professional & Trustworthy
const colors = {
    primary: '#1e3a8a', // Deep Royal Blue
    secondary: '#1e40af', // Lighter Blue
    accent: '#cbceeb', // Soft blueish background
    gold: '#D4AF37', // Metallic Gold
    text: '#1f2937', // Dark Gray
    lightText: '#6b7280', // Medium Gray
    white: '#ffffff',
};

// Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        position: 'relative',
        fontFamily: 'Helvetica',
    },
    // Background decorations
    bgCurveTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 200,
    },
    bgCurveBottom: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100%',
        height: 200,
        transform: 'rotate(180deg)',
    },
    // Main Container
    container: {
        padding: 40,
        height: '100%',
        flexDirection: 'row',
    },
    // Left Sidebar (Photo & QR)
    sidebar: {
        width: 180,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingBottom: 20,
        borderRight: `1px solid ${colors.gold}`,
        paddingRight: 20,
    },
    photoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        border: `3px solid ${colors.gold}`,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
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
    qrContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    qrCode: {
        width: 100,
        height: 100,
        border: `1px solid ${colors.gold}`,
        padding: 5,
        backgroundColor: 'white',
    },
    qrLabel: {
        fontSize: 8,
        color: colors.primary,
        marginTop: 5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Right Content Area
    content: {
        flex: 1,
        paddingLeft: 40,
        paddingTop: 20,
        alignItems: 'center',
    },
    // Header Section
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: `2px solid ${colors.gold}`,
        paddingBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
        objectFit: 'contain',
    },
    orgInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    orgName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    orgSubtitle: {
        fontSize: 10,
        color: colors.lightText,
        letterSpacing: 1,
    },
    // Body Section
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.gold, // Gold Title
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    certifyText: {
        fontSize: 12,
        color: colors.lightText,
        fontStyle: 'italic',
        marginBottom: 15,
    },
    memberName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    memberLine: {
        width: 300,
        height: 1,
        backgroundColor: colors.gold,
        marginBottom: 20,
    },
    bodyText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.text,
        lineHeight: 1.6,
        maxWidth: 450,
        marginBottom: 30,
    },
    membershipBadge: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        borderRadius: 15,
        marginBottom: 10,
    },
    membershipText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Valid Dates Row
    datesRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 40,
        marginBottom: 40,
    },
    dateItem: {
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 8,
        color: colors.lightText,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
    },
    // Signatures
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 'auto',
        paddingTop: 20,
    },
    sigBlock: {
        alignItems: 'center',
        width: 140,
    },
    sigLine: {
        width: '100%',
        height: 1,
        backgroundColor: colors.text,
        marginBottom: 5,
    },
    sigName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
    },
    sigTitle: {
        fontSize: 8,
        color: colors.primary,
        textTransform: 'uppercase',
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
}

const MembershipCertificatePDF = ({ profile, logoDataUrl, qrDataUrl, photoDataUrl }: CertificateProps) => {
    // Format Dates
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // Default 1 year validity if not provided
    const validUntil = profile.subscription_end_date
        ? new Date(profile.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const membershipType = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Decorative SVG Curve - Top Left */}
                <Svg style={styles.bgCurveTop} viewBox="0 0 842 200">
                    <Path
                        d="M0,0 L842,0 L842,20 Q600,180 0,50 Z"
                        fill={colors.primary}
                        opacity={0.05}
                    />
                    <Path
                        d="M0,0 L400,0 Q200,100 0,150 Z"
                        fill={colors.gold}
                        opacity={0.1}
                    />
                </Svg>

                {/* Decorative SVG Curve - Bottom Right (Mirrored logic in styling) */}
                <Svg style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: 100 }} viewBox="0 0 842 100">
                    <Path
                        d="M0,100 L842,100 L842,0 Q600,80 0,100 Z"
                        fill={colors.primary}
                        opacity={0.05}
                    />
                </Svg>

                <View style={styles.container}>
                    {/* Left Sidebar: Photo & QR */}
                    <View style={styles.sidebar}>
                        {/* Profile Photo */}
                        <View style={styles.photoContainer}>
                            {photoDataUrl ? (
                                <Image src={photoDataUrl} style={styles.photo} />
                            ) : (
                                <Text style={styles.photoPlaceholder}>No Photo</Text>
                            )}
                        </View>

                        {/* Membership Number */}
                        <View style={{ marginTop: 20, alignItems: 'center' }}>
                            <Text style={{ fontSize: 8, color: colors.lightText }}>MEMBERSHIP ID</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary, marginTop: 2 }}>
                                {profile.registration_number || 'PENDING'}
                            </Text>
                        </View>

                        {/* QR Code */}
                        <View style={styles.qrContainer}>
                            {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCode} />}
                            <Text style={styles.qrLabel}>Scan to Verify</Text>
                        </View>
                    </View>

                    {/* Right Content */}
                    <View style={styles.content}>
                        {/* Header with Logo */}
                        <View style={styles.header}>
                            {/* Organization Info (Left aligned in this section) */}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.orgName}>Society of Optometrists</Text>
                                <Text style={[styles.orgName, { fontSize: 14, color: colors.gold }]}>Pakistan (SOOOP)</Text>
                            </View>
                            {/* Logo */}
                            {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                        </View>

                        {/* Certificate Title */}
                        <Text style={styles.title}>Certificate of Membership</Text>

                        {/* Body */}
                        <Text style={styles.certifyText}>This is to certify that</Text>

                        <Text style={styles.memberName}>{profile.full_name}</Text>
                        <View style={styles.memberLine} />

                        <Text style={styles.bodyText}>
                            has been succesfully admitted as a member in good standing of the Society of Optometrists Pakistan.
                            This membership is verifiable via the QR code provided.
                        </Text>

                        {/* Membership Badge */}
                        <View style={styles.membershipBadge}>
                            <Text style={styles.membershipText}>{membershipType}</Text>
                        </View>

                        {/* Dates */}
                        <View style={styles.datesRow}>
                            <View style={styles.dateItem}>
                                <Text style={styles.dateLabel}>Issue Date</Text>
                                <Text style={styles.dateValue}>{issueDate}</Text>
                            </View>
                            <View style={styles.dateItem}>
                                <Text style={styles.dateLabel}>Valid Until</Text>
                                <Text style={styles.dateValue}>{validUntil}</Text>
                            </View>
                        </View>

                        {/* Signatures */}
                        <View style={styles.signatures}>
                            <View style={styles.sigBlock}>
                                {/* President Sig Placeholder */}
                                <View style={{ height: 40 }} />
                                <View style={styles.sigLine} />
                                <Text style={styles.sigName}>Dr. Muhammad Ajmal</Text>
                                <Text style={styles.sigTitle}>President</Text>
                            </View>

                            <View style={styles.sigBlock}>
                                {/* Secretary Sig Placeholder */}
                                <View style={{ height: 40 }} />
                                <View style={styles.sigLine} />
                                <Text style={styles.sigName}>Dr. Ahmed Kamal</Text>
                                <Text style={styles.sigTitle}>General Secretary</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default MembershipCertificatePDF;
