"use client";

import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// Register a professional font (optional - uses default if not registered)
// Font.register({
//     family: 'Inter',
//     src: '/fonts/Inter-Regular.ttf',
// });

// CR80 Standard ID Card dimensions
// Physical: 85.6mm x 54mm (3.375" x 2.125")
// In points: 1 inch = 72pt, so 3.375" x 72 = 243pt, 2.125" x 72 = 153pt
const CARD_WIDTH = 243; // 3.375 inches in points
const CARD_HEIGHT = 153; // 2.125 inches in points

// Color palette
const colors = {
    primary: '#0a3d62',
    primaryLight: '#1a5276',
    accent: '#2dd4bf',
    accentLight: '#5eead4',
    white: '#ffffff',
    gray: '#6b7280',
    darkGray: '#374151',
    red: '#EF4444',
    lightBg: '#f8fafc',
};

// Styles for the PDF
const styles = StyleSheet.create({
    // Front Card Styles
    frontPage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.primary,
        position: 'relative',
        overflow: 'hidden',
    },
    frontAccentTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: colors.accent,
    },
    frontAccentBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: colors.accent,
    },
    frontContent: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 14,
        height: '100%',
    },
    // Photo Section
    photoSection: {
        width: 70,
        alignItems: 'center',
    },
    photoContainer: {
        width: 58,
        height: 70,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(45, 212, 191, 0.6)',
        overflow: 'hidden',
        backgroundColor: '#0d4a6e',
    },
    photo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoInitial: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    membershipBadge: {
        marginTop: 6,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: colors.accent,
    },
    membershipText: {
        fontSize: 6,
        fontWeight: 'bold',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Divider
    verticalDivider: {
        width: 1,
        height: '85%',
        backgroundColor: 'rgba(45, 212, 191, 0.4)',
        marginHorizontal: 10,
        alignSelf: 'center',
    },
    // Details Section
    detailsSection: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    nameContainer: {
        flex: 1,
        paddingRight: 6,
    },
    memberName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 2,
    },
    designation: {
        fontSize: 7,
        fontWeight: 'semibold',
        color: colors.accentLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    logoContainer: {
        width: 50,
        height: 50,
        backgroundColor: colors.white,
        borderRadius: 6,
        padding: 4,
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    // Info Grid
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    infoItem: {
        width: '50%',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 5,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 1,
    },
    infoValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.white,
    },
    infoValueMono: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.white,
        fontFamily: 'Courier',
    },
    validUntil: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.accent,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 6,
        left: 12,
        right: 12,
    },
    footerText: {
        fontSize: 5,
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    // Back Card Styles
    backPage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.white,
        position: 'relative',
        overflow: 'hidden',
    },
    backAccentTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: colors.primary,
    },
    backAccentBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: colors.primary,
    },
    backContent: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 14,
        height: '100%',
    },
    // QR Section
    qrSection: {
        width: 75,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrContainer: {
        padding: 6,
        backgroundColor: colors.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(10, 61, 98, 0.15)',
    },
    qrImage: {
        width: 60,
        height: 60,
    },
    scanText: {
        marginTop: 6,
        fontSize: 5,
        fontWeight: 'bold',
        color: colors.accent,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Back Divider
    backDivider: {
        width: 1,
        height: '85%',
        backgroundColor: 'rgba(10, 61, 98, 0.15)',
        marginHorizontal: 10,
        alignSelf: 'center',
    },
    // Back Info Section
    backInfoSection: {
        flex: 1,
    },
    backHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 6,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(10, 61, 98, 0.1)',
    },
    backLogoContainer: {
        width: 54,
        height: 54,
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 4,
        marginRight: 10,
    },
    backNameContainer: {
        flex: 1,
    },
    backMemberName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
    },
    backSubtitle: {
        fontSize: 5,
        fontWeight: 'bold',
        color: colors.accent,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Back Info Grid
    backInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    backInfoItem: {
        width: '50%',
        marginBottom: 4,
    },
    backInfoItemFull: {
        width: '100%',
        marginBottom: 4,
    },
    backInfoLabel: {
        fontSize: 5,
        fontWeight: 'bold',
        color: colors.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 1,
    },
    backInfoValue: {
        fontSize: 8,
        fontWeight: 'semibold',
        color: colors.darkGray,
    },
    bloodGroup: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.red,
    },
    // Notice
    notice: {
        marginTop: 4,
        padding: 5,
        backgroundColor: 'rgba(10, 61, 98, 0.04)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(10, 61, 98, 0.08)',
    },
    noticeText: {
        fontSize: 5,
        color: colors.gray,
        lineHeight: 1.4,
    },
    noticeBold: {
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    noticeEmail: {
        fontWeight: 'semibold',
        color: colors.primary,
    },
    // Back Footer
    backFooter: {
        position: 'absolute',
        bottom: 6,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(10, 61, 98, 0.1)',
    },
    backFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backFooterUrl: {
        fontSize: 6,
        fontWeight: 'semibold',
        color: colors.primary,
    },
    backFooterReg: {
        fontSize: 6,
        color: colors.gray,
        fontFamily: 'Courier',
    },
});

// Props interface
interface IdentityCardPDFProps {
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
    };
    photoDataUrl?: string | null;
    logoDataUrl?: string | null;
    qrDataUrl?: string | null;
}

// Helper functions
const formatCNIC = (cnic: string): string => {
    if (!cnic) return 'N/A';
    const cleaned = cnic.replace(/\D/g, '');
    if (cleaned.length === 13) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
    }
    return cnic;
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const getValidityPeriod = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getFullYear()} - ${end.getFullYear()}`;
};

// Front Card Component
const FrontCard = ({ profile, photoDataUrl, logoDataUrl }: IdentityCardPDFProps) => (
    <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.frontPage}>
        {/* Top accent line */}
        <View style={styles.frontAccentTop} />

        {/* Bottom accent line */}
        <View style={styles.frontAccentBottom} />

        {/* Main content */}
        <View style={styles.frontContent}>
            {/* Photo Section */}
            <View style={styles.photoSection}>
                <View style={styles.photoContainer}>
                    {photoDataUrl ? (
                        <Image src={photoDataUrl} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoInitial}>
                                {profile.full_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.membershipBadge}>
                    <Text style={styles.membershipText}>
                        {profile.membership_type || 'Member'}
                    </Text>
                </View>
            </View>

            {/* Vertical Divider */}
            <View style={styles.verticalDivider} />

            {/* Details Section */}
            <View style={styles.detailsSection}>
                {/* Header with name and logo */}
                <View style={styles.headerRow}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.memberName}>{profile.full_name}</Text>
                        {profile.designation && (
                            <Text style={styles.designation}>{profile.designation}</Text>
                        )}
                    </View>
                    <View style={styles.logoContainer}>
                        {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Registration No.</Text>
                        <Text style={styles.infoValueMono}>
                            {profile.registration_number || 'PENDING'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>CNIC</Text>
                        <Text style={styles.infoValueMono}>{formatCNIC(profile.cnic)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>City</Text>
                        <Text style={styles.infoValue}>{profile.city || 'Pakistan'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Valid Until</Text>
                        <Text style={styles.validUntil}>
                            {formatDate(profile.subscription_end_date)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                Society of Optometrists, Orthoptists &amp; Ophthalmic Technologists Pakistan
            </Text>
        </View>
    </Page>
);

// Back Card Component
const BackCard = ({ profile, logoDataUrl, qrDataUrl }: IdentityCardPDFProps) => (
    <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.backPage}>
        {/* Top accent line */}
        <View style={styles.backAccentTop} />

        {/* Bottom accent line */}
        <View style={styles.backAccentBottom} />

        {/* Main content */}
        <View style={styles.backContent}>
            {/* QR Section */}
            <View style={styles.qrSection}>
                <View style={styles.qrContainer}>
                    {qrDataUrl && <Image src={qrDataUrl} style={styles.qrImage} />}
                </View>
                <Text style={styles.scanText}>Scan to Verify</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.backDivider} />

            {/* Info Section */}
            <View style={styles.backInfoSection}>
                {/* Header with logo and name */}
                <View style={styles.backHeader}>
                    <View style={styles.backLogoContainer}>
                        {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                    </View>
                    <View style={styles.backNameContainer}>
                        <Text style={styles.backMemberName}>{profile.full_name}</Text>
                        <Text style={styles.backSubtitle}>Official Member Card</Text>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.backInfoGrid}>
                    <View style={styles.backInfoItem}>
                        <Text style={styles.backInfoLabel}>Father/Husband</Text>
                        <Text style={styles.backInfoValue}>
                            {profile.father_name || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.backInfoItem}>
                        <Text style={styles.backInfoLabel}>Blood Group</Text>
                        <Text style={styles.bloodGroup}>
                            {profile.blood_group || '—'}
                        </Text>
                    </View>
                    <View style={styles.backInfoItemFull}>
                        <Text style={styles.backInfoLabel}>Validity Period</Text>
                        <Text style={styles.backInfoValue}>
                            {getValidityPeriod(
                                profile.subscription_start_date,
                                profile.subscription_end_date
                            )}
                        </Text>
                    </View>
                </View>

                {/* Notice */}
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>
                        <Text style={styles.noticeBold}>Note: </Text>
                        This card is property of SOOOP Pakistan. If found, please return to:{' '}
                        <Text style={styles.noticeEmail}>contact@soopvision.com</Text>
                    </Text>
                </View>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.backFooter}>
            <View style={styles.backFooterLeft}>
                <Text style={styles.backFooterUrl}>www.soopvision.com</Text>
            </View>
            <Text style={styles.backFooterReg}>
                {profile.registration_number || 'PENDING'}
            </Text>
        </View>
    </Page>
);

// Main PDF Document Component
const IdentityCardPDF = (props: IdentityCardPDFProps) => (
    <Document
        title={`SOOOP Membership Card - ${props.profile.full_name}`}
        author="SOOOP Pakistan"
        subject="Official Membership Card"
        creator="SOOOP Membership Portal"
    >
        <FrontCard {...props} />
        <BackCard {...props} />
    </Document>
);

export default IdentityCardPDF;
export { CARD_WIDTH, CARD_HEIGHT };
