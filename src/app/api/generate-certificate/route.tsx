import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import MembershipCertificatePDF from '@/components/dashboard/MembershipCertificatePDF';

// Force dynamic rendering to handle request body parsing
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            profile,
            photoDataUrl,
            logoDataUrl,
            qrDataUrl,
            signatureDataUrl,
        } = body;

        // Validate required fields
        if (!profile || !profile.full_name) {
            return NextResponse.json(
                { error: 'Missing required profile information', details: 'full_name is required' },
                { status: 400 }
            );
        }

        console.log(`[Certificate Generation] Generating certificate for: ${profile.full_name}`);

        // Generate PDF stream
        const stream = await renderToStream(
            <MembershipCertificatePDF
                profile={profile}
                logoDataUrl={logoDataUrl}
                qrDataUrl={qrDataUrl}
                photoDataUrl={photoDataUrl}
                signatureDataUrl={signatureDataUrl}
            />
        );

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        // @ts-ignore - readable stream async iterator
        for await (const chunk of stream) {
            chunks.push(chunk as any);
        }
        const buffer = Buffer.concat(chunks);

        // Generate filename
        const filename = `SOOOP-Certificate-${profile.registration_number || profile.id.slice(0, 8) || 'Member'
            }.pdf`;

        console.log(`[Certificate Generation] Certificate generated successfully: ${filename}`);

        // Return PDF as response
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
        });
    } catch (error) {
        console.error('[Certificate Generation] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : '';

        return NextResponse.json(
            {
                error: 'Failed to generate Certificate',
                details: errorMessage,
                stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            },
            { status: 500 }
        );
    }
}
