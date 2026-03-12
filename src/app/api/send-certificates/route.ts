import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, meetingCertificateEmailTemplate } from '@/lib/email';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60s for Vercel Pro

// ══════════════════════════════════════════════════════════════
// SEND MEETING CERTIFICATES (BATCH - 5 AT A TIME)
// ══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await req.json();
        const { certificateId, recipientIds } = body;

        if (!certificateId || !recipientIds?.length) {
            return NextResponse.json({ error: 'Missing certificateId or recipientIds' }, { status: 400 });
        }

        // Fetch the certificate details
        const { data: certificate, error: certError } = await supabase
            .from('meeting_certificates')
            .select('*')
            .eq('id', certificateId)
            .single();

        if (certError || !certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        // Fetch recipients for this batch
        const { data: recipients, error: recipError } = await supabase
            .from('certificate_recipients')
            .select('*')
            .in('id', recipientIds)
            .eq('status', 'pending');

        if (recipError || !recipients?.length) {
            return NextResponse.json({ error: 'No pending recipients found' }, { status: 404 });
        }

        // Format meeting date
        const meetingDate = new Date(certificate.meeting_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // Load the certificate template
        let templateBuffer: Buffer | null = null;
        if (certificate.template_url) {
            try {
                // Fetch from Supabase Storage
                const { data: fileData } = await supabase.storage
                    .from('certificates')
                    .download(certificate.template_url);
                if (fileData) {
                    templateBuffer = Buffer.from(await fileData.arrayBuffer());
                }
            } catch (e) {
                console.error('[Cert] Failed to download template:', e);
            }
        }

        // Fallback: use default template if exists
        if (!templateBuffer) {
            const defaultPath = path.join(process.cwd(), 'public', 'meeting-certificate-template.png');
            if (fs.existsSync(defaultPath)) {
                templateBuffer = fs.readFileSync(defaultPath);
            }
        }

        const results: { id: string; status: string; error?: string }[] = [];

        for (const recipient of recipients) {
            try {
                // Generate personalized PDF
                const pdfBuffer = await generateMeetingCertificatePDF(
                    recipient.full_name,
                    certificate.title,
                    meetingDate,
                    templateBuffer
                );

                // Send email with PDF attachment
                const emailResult = await sendEmail({
                    to: recipient.email,
                    subject: `Your Participation Certificate - ${certificate.title}`,
                    html: meetingCertificateEmailTemplate(
                        recipient.full_name,
                        certificate.title,
                        meetingDate
                    ),
                    attachments: [{
                        filename: `Certificate-${certificate.title.replace(/\s+/g, '-')}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf',
                    }],
                });

                if (emailResult.success) {
                    // Update recipient status to sent
                    await supabase
                        .from('certificate_recipients')
                        .update({ status: 'sent', sent_at: new Date().toISOString() })
                        .eq('id', recipient.id);

                    results.push({ id: recipient.id, status: 'sent' });
                } else {
                    // Update recipient status to failed
                    await supabase
                        .from('certificate_recipients')
                        .update({ status: 'failed', error_message: emailResult.error })
                        .eq('id', recipient.id);

                    results.push({ id: recipient.id, status: 'failed', error: emailResult.error });
                }
            } catch (error: any) {
                // Mark as failed
                await supabase
                    .from('certificate_recipients')
                    .update({ status: 'failed', error_message: error.message })
                    .eq('id', recipient.id);

                results.push({ id: recipient.id, status: 'failed', error: error.message });
            }
        }

        // Update certificate counters
        const sentCount = results.filter(r => r.status === 'sent').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        await supabase
            .from('meeting_certificates')
            .update({
                sent_count: (certificate.sent_count || 0) + sentCount,
                failed_count: (certificate.failed_count || 0) + failedCount,
                updated_at: new Date().toISOString()
            })
            .eq('id', certificateId);

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            results
        });

    } catch (error: any) {
        console.error('[SendCerts] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// ══════════════════════════════════════════════════════════════
// GENERATE MEETING CERTIFICATE PDF
// ══════════════════════════════════════════════════════════════

async function generateMeetingCertificatePDF(
    memberName: string,
    meetingTitle: string,
    meetingDate: string,
    templateBuffer: Buffer | null
): Promise<Buffer> {
    const pdf = await PDFDocument.create();

    // Landscape A4 page
    const PAGE_W = 842; // A4 landscape width in points
    const PAGE_H = 595; // A4 landscape height in points
    const page = pdf.addPage([PAGE_W, PAGE_H]);

    // Load fonts
    const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman);
    const timesBoldItalic = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);

    if (templateBuffer) {
        // If template image provided, use it as background
        try {
            // Check if PNG or JPEG
            const isPng = templateBuffer[0] === 0x89 && templateBuffer[1] === 0x50;
            const bgImg = isPng
                ? await pdf.embedPng(templateBuffer)
                : await pdf.embedJpg(templateBuffer);

            page.drawImage(bgImg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
        } catch (e) {
            console.error('[Cert] Failed to embed template, using generated design:', e);
            drawGeneratedBackground(page, PAGE_W, PAGE_H);
        }
    } else {
        // Generate a professional certificate design
        drawGeneratedBackground(page, PAGE_W, PAGE_H);
    }

    // ── Draw text overlays (only if no template, or always for generated) ──
    if (!templateBuffer) {
        // SOOOP Header
        const headerText = 'SOCIETY OF OPTOMETRISTS OF PAKISTAN';
        const headerW = helveticaBold.widthOfTextAtSize(headerText, 16);
        page.drawText(headerText, {
            x: (PAGE_W - headerW) / 2,
            y: PAGE_H - 100,
            size: 16,
            font: helveticaBold,
            color: rgb(0, 0.12, 0.33),
        });

        // Certificate Title
        const certTitle = 'CERTIFICATE OF PARTICIPATION';
        const titleW = helveticaBold.widthOfTextAtSize(certTitle, 28);
        page.drawText(certTitle, {
            x: (PAGE_W - titleW) / 2,
            y: PAGE_H - 160,
            size: 28,
            font: helveticaBold,
            color: rgb(0, 0.12, 0.33),
        });

        // "This is to certify that"
        const certifyText = 'This is to certify that';
        const certifyW = timesRoman.widthOfTextAtSize(certifyText, 16);
        page.drawText(certifyText, {
            x: (PAGE_W - certifyW) / 2,
            y: PAGE_H - 220,
            size: 16,
            font: timesRoman,
            color: rgb(0.25, 0.25, 0.25),
        });

        // Member Name (large, bold, italic)
        const nameW = timesBoldItalic.widthOfTextAtSize(memberName, 32);
        page.drawText(memberName, {
            x: (PAGE_W - nameW) / 2,
            y: PAGE_H - 270,
            size: 32,
            font: timesBoldItalic,
            color: rgb(0, 0.12, 0.33),
        });

        // Decorative line under name
        page.drawLine({
            start: { x: (PAGE_W / 2) - 150, y: PAGE_H - 285 },
            end: { x: (PAGE_W / 2) + 150, y: PAGE_H - 285 },
            thickness: 1.5,
            color: rgb(0.05, 0.58, 0.54),
        });

        // "has successfully participated in"
        const participatedText = 'has successfully participated in';
        const partW = timesRoman.widthOfTextAtSize(participatedText, 14);
        page.drawText(participatedText, {
            x: (PAGE_W - partW) / 2,
            y: PAGE_H - 320,
            size: 14,
            font: timesRoman,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Meeting Title
        const meetTitleSize = meetingTitle.length > 40 ? 18 : 22;
        const meetTitleW = helveticaBold.widthOfTextAtSize(meetingTitle, meetTitleSize);
        page.drawText(meetingTitle, {
            x: (PAGE_W - meetTitleW) / 2,
            y: PAGE_H - 360,
            size: meetTitleSize,
            font: helveticaBold,
            color: rgb(0.05, 0.58, 0.54),
        });

        // Date
        const dateText = `held on ${meetingDate}`;
        const dateW = timesRoman.widthOfTextAtSize(dateText, 14);
        page.drawText(dateText, {
            x: (PAGE_W - dateW) / 2,
            y: PAGE_H - 395,
            size: 14,
            font: timesRoman,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Signature area
        page.drawLine({
            start: { x: PAGE_W / 2 - 100, y: 100 },
            end: { x: PAGE_W / 2 + 100, y: 100 },
            thickness: 1,
            color: rgb(0.5, 0.5, 0.5),
        });

        const sigText = 'Authorized Signatory';
        const sigW = helvetica.widthOfTextAtSize(sigText, 10);
        page.drawText(sigText, {
            x: (PAGE_W - sigW) / 2,
            y: 82,
            size: 10,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
        });
    } else {
        // Template provided - overlay name, title, and date at standard positions
        const nameW = timesBoldItalic.widthOfTextAtSize(memberName, 30);
        page.drawText(memberName, {
            x: (PAGE_W - nameW) / 2,
            y: PAGE_H * 0.48,
            size: 30,
            font: timesBoldItalic,
            color: rgb(0, 0.12, 0.33),
        });

        const meetTitleSize = meetingTitle.length > 40 ? 16 : 20;
        const meetTitleW = helveticaBold.widthOfTextAtSize(meetingTitle, meetTitleSize);
        page.drawText(meetingTitle, {
            x: (PAGE_W - meetTitleW) / 2,
            y: PAGE_H * 0.35,
            size: meetTitleSize,
            font: helveticaBold,
            color: rgb(0.05, 0.58, 0.54),
        });

        const dateText = meetingDate;
        const dateW = timesRoman.widthOfTextAtSize(dateText, 14);
        page.drawText(dateText, {
            x: (PAGE_W - dateW) / 2,
            y: PAGE_H * 0.28,
            size: 14,
            font: timesRoman,
            color: rgb(0.25, 0.25, 0.25),
        });
    }

    const pdfBytes = await pdf.save();
    return Buffer.from(pdfBytes);
}

function drawGeneratedBackground(page: any, w: number, h: number) {
    // White background
    page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: rgb(1, 1, 1) });

    // Border
    page.drawRectangle({
        x: 20, y: 20, width: w - 40, height: h - 40,
        borderColor: rgb(0, 0.12, 0.33),
        borderWidth: 2,
        color: rgb(1, 1, 1),
    });

    // Inner border
    page.drawRectangle({
        x: 30, y: 30, width: w - 60, height: h - 60,
        borderColor: rgb(0.05, 0.58, 0.54),
        borderWidth: 0.5,
        color: rgb(1, 1, 1),
    });

    // Top accent bar
    page.drawRectangle({
        x: 30, y: h - 65, width: w - 60, height: 35,
        color: rgb(0, 0.12, 0.33),
    });
}
