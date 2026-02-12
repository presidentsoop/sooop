import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// Register fonts if available, otherwise fallback to Helvetica
// Ideally we would register a formal font like Times New Roman or similar for certificates
// Font.register({
//   family: 'Times-Roman',
//   src: '/fonts/Times-Roman.ttf'
// });

const colors = {
    primary: '#0a3d62', // Navy
    secondary: '#1a5276',
    gold: '#D4AF37', // Certificate Gold
    text: '#1f2937',
    lightText: '#6b7280',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        position: 'relative',
    },
    border: {
        border: `4px solid ${colors.primary}`,
        height: '100%',
        width: '100%',
        padding: 5, // Inner padding for double border effect
    },
    innerBorder: {
        border: `1px solid ${colors.gold}`,
        height: '100%',
        width: '100%',
        padding: 30,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
        objectFit: 'contain',
    },
    orgName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    certificateTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.gold,
        fontFamily: 'Helvetica-Bold', // Fallback
        marginBottom: 30,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    body: {
        alignItems: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
    },
    certifyText: {
        fontSize: 14,
        color: colors.lightText,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    memberName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        borderBottom: `1px solid ${colors.gold}`,
        paddingBottom: 5,
        minWidth: 400,
    },
    bodyText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: 20,
        maxWidth: 600,
    },
    membershipType: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginTop: 40,
        borderTop: `1px solid #e5e7eb`,
        paddingTop: 20,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 10,
        color: colors.lightText,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 50,
        alignItems: 'flex-end',
    },
    signatureBlock: {
        alignItems: 'center',
        width: 150,
    },
    signatureLine: {
        width: '100%',
        height: 1,
        backgroundColor: colors.text,
        marginBottom: 5,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    signatureTitle: {
        fontSize: 10,
        color: colors.lightText,
    },
    verificationBlock: {
        alignItems: 'center',
    },
    qrCode: {
        width: 70,
        height: 70,
        marginBottom: 5,
    },
    verificationText: {
        fontSize: 8,
        color: colors.lightText,
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-150, -150)', // Center roughly
        opacity: 0.05,
        width: 300,
        height: 300,
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
}

const MembershipCertificatePDF = ({ profile, logoDataUrl, qrDataUrl }: CertificateProps) => {
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Formatting membership type for display
    const membershipTypeDisplay = profile.membership_type
        ? profile.membership_type.replace(/_/g, ' ').toUpperCase()
        : 'MEMBER';

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.border}>
                    <View style={styles.innerBorder}>
                        {/* Background Watermark (Optional, if logo provided) */}
                        {/* {logoDataUrl && <Image src={logoDataUrl} style={styles.watermark} />} */}

                        {/* Header */}
                        <View style={styles.header}>
                            {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
                            <Text style={styles.orgName}>Society of Optometrists Pakistan</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.certificateTitle}>Certificate of Membership</Text>

                        {/* Body content */}
                        <View style={styles.body}>
                            <Text style={styles.certifyText}>This is to certify that</Text>

                            <Text style={styles.memberName}>{profile.full_name}</Text>

                            <Text style={styles.bodyText}>
                                has been admitted as a{' '}
                                <Text style={styles.membershipType}>{membershipTypeDisplay}</Text>
                                {'\n'}of the Society of Optometrists Pakistan (SOOOP).
                            </Text>

                            {/* Details Row */}
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Registration No.</Text>
                                    <Text style={styles.detailValue}>{profile.registration_number || 'PENDING'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Date of Issue</Text>
                                    <Text style={styles.detailValue}>{issueDate}</Text>
                                </View>
                                {/* Validity could be added here if needed */}
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            {/* President Signature */}
                            <View style={styles.signatureBlock}>
                                {/* TODO: Place Signature Image Here */}
                                <View style={{ height: 30 }} />
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureName}>Dr. Muhammad Ajmal</Text>
                                <Text style={styles.signatureTitle}>President, SOOOP</Text>
                            </View>

                            {/* Verification QR */}
                            <View style={styles.verificationBlock}>
                                {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCode} />}
                                <Text style={styles.verificationText}>Scan to Verify</Text>
                            </View>

                            {/* Secretary Signature */}
                            <View style={styles.signatureBlock}>
                                {/* TODO: Place Signature Image Here */}
                                <View style={{ height: 30 }} />
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureName}>Dr. Ahmed Kamal</Text>
                                <Text style={styles.signatureTitle}>General Secretary, SOOOP</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default MembershipCertificatePDF;
