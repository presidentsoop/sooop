
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import IdentityCardPDF from '@/components/dashboard/IdentityCardPDF';

// Force dynamic rendering to handle request body parsing
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profile, photoDataUrl, logoDataUrl, qrDataUrl } = body;

        console.log("Generating PDF for:", profile.full_name);

        // Generate PDF stream
        const stream = await renderToStream(
            <IdentityCardPDF
                profile={profile}
                photoDataUrl={photoDataUrl}
                logoDataUrl={logoDataUrl}
                qrDataUrl={qrDataUrl}
            />
        );

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        // @ts-ignore - readable stream async iterator
        for await (const chunk of stream) {
            chunks.push(chunk as any);
        }
        const buffer = Buffer.concat(chunks);

        // Return PDF as response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="SOOOP-Card-${profile.registration_number || 'Member'}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
