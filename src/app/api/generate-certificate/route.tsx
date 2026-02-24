import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

// ============================================================
// TEMPLATE & PDF DIMENSIONS
// Template image: 1250 x 884 pixels
// Scale factor: 0.72 (pixels → PDF points)
// PDF page: 900 x 636.48 points
// ============================================================
const IMG_W = 1250;
const IMG_H = 884;
const S = 0.72; // scale factor
const PAGE_W = IMG_W * S;  // 900
const PAGE_H = IMG_H * S;  // 636.48

// Pixel → PDF coordinate converters
const toX = (px: number) => px * S;
const toY = (py: number) => PAGE_H - (py * S); // PDF Y is bottom-up

// ============================================================
// 🔒 LOCKED POSITIONS (from Visual Editor — 24/02/2026 01:34)
// DO NOT modify unless re-measured with the position tool
// ============================================================

// Profile Photo — Gold Circle (top-left)
const PHOTO_CX = 148;
const PHOTO_CY = 143;
const PHOTO_DIA = 213;

// QR Code — bottom-left area
const QR_LEFT = 48;
const QR_TOP = 694;
const QR_SIZE = 156;

// Serial Number — after "SERIAL:" text
const SERIAL_X = 1056;
const SERIAL_BASELINE_Y = 41;
const SERIAL_FONT_PX = 19;

// Member Name — centered below "THIS IS TO HEREBY THAT"
const NAME_CENTER_X = 712;
const NAME_BASELINE_Y = 392;
const NAME_FONT_PX = 34;

// Membership Type — covers "Full Membership"
const MTYPE_CENTER_X = 866;
const MTYPE_BASELINE_Y = 533;
const MTYPE_FONT_PX = 17;
const MTYPE_RECT = { x: 783, y: 516, w: 176, h: 25 };

// Validity Dates — covers "This document is valid from"
const VALID_CENTER_X = 541;
const VALID_BASELINE_Y = 532;
const VALID_FONT_PX = 16;
const VALID_RECT = { x: 340, y: 516, w: 412, h: 24 };

// Circular photo crop using sharp + SVG mask
async function createCircularPhoto(buf: Buffer, dia: number): Promise<Buffer> {
    const resized = await sharp(buf)
        .resize(dia, dia, { fit: 'cover', position: 'centre' })
        .png()
        .toBuffer();

    const r = dia / 2;
    const mask = Buffer.from(
        `<svg width="${dia}" height="${dia}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
    );

    return sharp(resized)
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();
}

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profile, qrDataUrl, photoDataUrl } = body;

        if (!profile?.full_name) {
            return NextResponse.json(
                { error: 'Missing profile', details: 'full_name is required' },
                { status: 400 }
            );
        }

        console.log(`[Cert] Generating for: ${profile.full_name}`);

        // ── Load template ──
        const tplPath = path.join(process.cwd(), 'public', 'certificate-template.png');
        if (!fs.existsSync(tplPath)) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 500 }
            );
        }
        const tplBuffer = fs.readFileSync(tplPath);

        // ── Prepare data ──
        const serial = profile.registration_number
            || profile.id?.slice(0, 8)?.toUpperCase()
            || 'PENDING';

        const memberName = profile.full_name;

        const mType = (profile.membership_type || 'Full').replace(/_/g, ' ');

        const fmtDate = (d?: string) => {
            const date = d ? new Date(d) : new Date();
            return date.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        };
        const validFrom = fmtDate(profile.subscription_start_date);
        const validUntil = fmtDate(
            profile.subscription_end_date ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        );

        // ══════════════════════════════════════════════
        // STEP 1: sharp — composite IMAGES only (no text!)
        //   → Profile photo (circular) + QR code
        // ══════════════════════════════════════════════
        const layers: sharp.OverlayOptions[] = [];

        // Profile photo
        if (photoDataUrl) {
            try {
                const b64 = photoDataUrl.replace(/^data:image\/\w+;base64,/, '');
                const photoBuf = Buffer.from(b64, 'base64');
                const circular = await createCircularPhoto(photoBuf, PHOTO_DIA);
                layers.push({
                    input: circular,
                    top: PHOTO_CY - Math.floor(PHOTO_DIA / 2),
                    left: PHOTO_CX - Math.floor(PHOTO_DIA / 2),
                });
                console.log(`[Cert] Photo composited, diameter=${PHOTO_DIA}px`);
            } catch (e) {
                console.error('[Cert] Photo error:', e);
            }
        }

        // QR code
        if (qrDataUrl) {
            try {
                const b64 = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
                const qrBuf = Buffer.from(b64, 'base64');
                const qr = await sharp(qrBuf)
                    .resize(QR_SIZE, QR_SIZE, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 },
                    })
                    .png()
                    .toBuffer();
                layers.push({ input: qr, top: QR_TOP, left: QR_LEFT });
                console.log(`[Cert] QR composited at (${QR_LEFT}, ${QR_TOP})`);
            } catch (e) {
                console.error('[Cert] QR error:', e);
            }
        }

        const composedImg = layers.length > 0
            ? await sharp(tplBuffer).composite(layers).png().toBuffer()
            : tplBuffer;

        // ══════════════════════════════════════════════
        // STEP 2: pdf-lib — embed image + draw ALL text
        //   Using StandardFonts (built-in, works everywhere)
        // ══════════════════════════════════════════════
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([PAGE_W, PAGE_H]);

        // Draw composed image as full-page background
        const bgImg = await pdf.embedPng(composedImg);
        page.drawImage(bgImg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

        // Load built-in fonts
        const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
        const timesReg = await pdf.embedFont(StandardFonts.TimesRoman);

        // ── A) SERIAL NUMBER ──
        const serialSize = SERIAL_FONT_PX * S;
        page.drawText(serial, {
            x: toX(SERIAL_X),
            y: toY(SERIAL_BASELINE_Y),
            size: serialSize,
            font: helvBold,
            color: rgb(0.75, 0.22, 0.17),
        });

        // ── B) MEMBER NAME (centered) ──
        const nameSize = NAME_FONT_PX * S;
        const nameW = timesBold.widthOfTextAtSize(memberName, nameSize);
        const nameCx = toX(NAME_CENTER_X);
        page.drawText(memberName, {
            x: nameCx - nameW / 2,
            y: toY(NAME_BASELINE_Y),
            size: nameSize,
            font: timesBold,
            color: rgb(0, 0.12, 0.33),
        });

        // ── C) MEMBERSHIP TYPE ──
        // White rect to cover template's "Full Membership"
        page.drawRectangle({
            x: toX(MTYPE_RECT.x),
            y: toY(MTYPE_RECT.y + MTYPE_RECT.h),
            width: MTYPE_RECT.w * S,
            height: MTYPE_RECT.h * S,
            color: rgb(1, 1, 1),
        });

        const mTypeText = `${mType} Membership`;
        const mTypeSize = MTYPE_FONT_PX * S;
        const mTypeW = timesBold.widthOfTextAtSize(mTypeText, mTypeSize);
        const mTypeCx = toX(MTYPE_CENTER_X);
        page.drawText(mTypeText, {
            x: mTypeCx - mTypeW / 2,
            y: toY(MTYPE_BASELINE_Y),
            size: mTypeSize,
            font: timesBold,
            color: rgb(0.13, 0.13, 0.13),
        });

        // ── D) VALIDITY DATES ──
        // White rect to cover template's "This document is valid from"
        page.drawRectangle({
            x: toX(VALID_RECT.x),
            y: toY(VALID_RECT.y + VALID_RECT.h),
            width: VALID_RECT.w * S,
            height: VALID_RECT.h * S,
            color: rgb(1, 1, 1),
        });

        const validText = `This document is valid from ${validFrom} to ${validUntil} for `;
        const validSize = VALID_FONT_PX * S;
        const validW = timesReg.widthOfTextAtSize(validText, validSize);
        const validCx = toX(VALID_CENTER_X);
        page.drawText(validText, {
            x: validCx - validW / 2,
            y: toY(VALID_BASELINE_Y),
            size: validSize,
            font: timesReg,
            color: rgb(0.2, 0.2, 0.2),
        });

        // ── Save & return PDF ──
        const pdfBytes = await pdf.save();
        const filename = `SOOOP-Certificate-${serial}.pdf`;
        console.log(`[Cert] Done: ${filename} (${pdfBytes.length} bytes)`);

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('[Cert] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate Certificate',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: process.env.NODE_ENV === 'development'
                    ? (error instanceof Error ? error.stack : '')
                    : undefined,
            },
            { status: 500 }
        );
    }
}
