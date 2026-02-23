import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ============================================================
// CERTIFICATE TEMPLATE CONFIGURATION
// Template image: 1250 x 884 px
// All (x, y) coordinates are in PIXELS from top-left corner.
//
// MEASURED carefully from the actual template image:
//
// ┌──────────────────────────────────────────────────────┐
// │ ⚪ Gold Circle    "Certificate"   SOOOP   IOA        │
// │  (photo here)     of Membership   logo    logo      │
// │                                          SERIAL: ___ │
// │                                                      │
// │          THIS IS TO HEREBY THAT                      │
// │                                                      │
// │             ___MEMBER NAME___                        │
// │                                                      │
// │   is a member of good standing and abides by the ... │
// │     Society of Optometrists Pakistan (SOOOP) under   │
// │                 __Full Membership__                  │
// │                                                      │
// │       This document is valid from ___ to ___         │
// │                                                      │
// │     [Signature]              [Signature]             │
// │  GENERAL SECRETARY        PRESIDENT SOOOP            │
// │                                                      │
// │ ⬜ QR    Visit sooopvision.com/verify ...            │
// └──────────────────────────────────────────────────────┘
// ============================================================

const TEMPLATE = {
    width: 1250,
    height: 884,
};

// ============================================================
// PROFILE PHOTO — Gold Circle (top-left corner)
//
// Measured from the template image:
// - The gold OUTER ring: starts at approximately (22, 18)
// - Outer diameter of the full gold circle: ~168px
// - The gold border thickness: ~7px on each side
// - Photo should be placed INSIDE the gold ring
// - Inner circle center = (22 + 84, 18 + 84) = (106, 102)
// - Inner circle diameter (photo area) = 168 - 14 = 154px
// - So top-left of the inner photo = (106 - 77, 102 - 77) = (29, 25)
// ============================================================

const PHOTO = {
    // Center of the gold circle
    centerX: 106,
    centerY: 102,
    // Diameter of the INNER area where the photo should go
    // (inside the gold ring, slightly inset to not overlap the ring)
    innerDiameter: 148,  // slightly less than 154 to stay safely inside gold ring
};

// ============================================================
// DYNAMIC TEXT FIELDS — Exact positions
// ============================================================

const FIELDS = {
    // ── SERIAL NUMBER ──
    // "SERIAL:" label on template ends at about x≈1008
    // The dynamic serial number text starts right after
    serial: {
        x: 1015,
        y: 18,
        fontSize: 20,
        color: '#c0392b',
    },

    // ── MEMBER NAME ──
    // "THIS IS TO HEREBY THAT" baseline ≈ y=270
    // Member name centered below with ~50px gap
    memberName: {
        x: 625,        // horizontal center of entire template
        y: 320,
        fontSize: 34,
        color: '#001F54',
    },

    // ── MEMBERSHIP TYPE ──
    // The paragraph reads: "...under Full Membership"
    // "Full Membership" is bold — we overlay it
    // Paragraph line 2 baseline ≈ y=472
    // "under " ends, then bold membership type starts
    // The template already has "Full Membership" baked in, so we
    // draw a white rect to cover it and then write the correct type
    membershipType: {
        x: 625,
        y: 462,
        fontSize: 17,
        color: '#222222',
    },

    // ── VALIDITY DATE LINE ──
    // "This document is valid from" baseline ≈ y=518
    // We overlay the complete sentence with dates
    validityLine: {
        x: 575,        // Center of the main content area (not full template)
        y: 508,
        fontSize: 16,
        color: '#333333',
    },

    // ── QR CODE ──
    // Bottom-left white/grey rectangle area
    // The empty area: top-left corner at approximately (13, 715)
    // Dimensions approximately 125×125px
    qrCode: {
        x: 15,
        y: 718,
        size: 120,
    },
};

// ============================================================
// CIRCULAR PHOTO CROP using sharp
// Creates a perfectly circular user photo image using SVG mask
// ============================================================

async function createCircularPhoto(
    photoBuffer: Buffer,
    diameter: number,
): Promise<Buffer> {
    // Resize the photo to fill the circle area (cover mode)
    const resized = await sharp(photoBuffer)
        .resize(diameter, diameter, {
            fit: 'cover',
            position: 'centre',
        })
        .png()
        .toBuffer();

    // Create a circular mask using SVG
    const r = diameter / 2;
    const circleMask = Buffer.from(
        `<svg width="${diameter}" height="${diameter}">
            <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
        </svg>`
    );

    // Apply the circular mask to the resized photo
    const circularPhoto = await sharp(resized)
        .composite([
            {
                input: circleMask,
                blend: 'dest-in',
            },
        ])
        .png()
        .toBuffer();

    return circularPhoto;
}

// ============================================================
// SVG TEXT OVERLAY BUILDER
// ============================================================

function buildTextOverlaySvg(params: {
    serialNumber: string;
    memberName: string;
    membershipType: string;
    validFrom: string;
    validUntil: string;
}): Buffer {
    const { serialNumber, memberName, membershipType, validFrom, validUntil } = params;

    const esc = (s: string) =>
        s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TEMPLATE.width}" height="${TEMPLATE.height}">

    <!-- ═══ SERIAL NUMBER (after "SERIAL:" on template) ═══ -->
    <text
        x="${FIELDS.serial.x}" 
        y="${FIELDS.serial.y + FIELDS.serial.fontSize}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${FIELDS.serial.fontSize}px"
        font-weight="bold"
        fill="${FIELDS.serial.color}"
        text-anchor="start"
    >${esc(serialNumber)}</text>

    <!-- ═══ MEMBER NAME (centered below "THIS IS TO HEREBY THAT") ═══ -->
    <text
        x="${FIELDS.memberName.x}" 
        y="${FIELDS.memberName.y + FIELDS.memberName.fontSize}"
        font-family="Georgia, 'Times New Roman', Times, serif"
        font-size="${FIELDS.memberName.fontSize}px"
        font-weight="bold"
        fill="${FIELDS.memberName.color}"
        text-anchor="middle"
        letter-spacing="1.5"
    >${esc(memberName)}</text>

    <!-- ═══ MEMBERSHIP TYPE (cover "Full Membership" with correct type) ═══ -->
    <!-- White rectangle to cover the template's baked-in "Full Membership" text -->
    <rect
        x="${FIELDS.membershipType.x - 120}"
        y="${FIELDS.membershipType.y - 4}"
        width="240"
        height="${FIELDS.membershipType.fontSize + 10}"
        fill="white"
    />
    <text
        x="${FIELDS.membershipType.x}" 
        y="${FIELDS.membershipType.y + FIELDS.membershipType.fontSize}"
        font-family="Georgia, 'Times New Roman', Times, serif"
        font-size="${FIELDS.membershipType.fontSize}px"
        font-weight="bold"
        fill="${FIELDS.membershipType.color}"
        text-anchor="middle"
    >${esc(membershipType)} Membership</text>

    <!-- ═══ VALIDITY DATE LINE ═══ -->
    <!-- White rectangle to cover the template's "This document is valid from" line -->
    <rect
        x="${FIELDS.validityLine.x - 260}"
        y="${FIELDS.validityLine.y - 4}"
        width="520"
        height="${FIELDS.validityLine.fontSize + 10}"
        fill="white"
    />
    <text
        x="${FIELDS.validityLine.x}" 
        y="${FIELDS.validityLine.y + FIELDS.validityLine.fontSize}"
        font-family="Georgia, 'Times New Roman', Times, serif"
        font-size="${FIELDS.validityLine.fontSize}px"
        fill="${FIELDS.validityLine.color}"
        text-anchor="middle"
        letter-spacing="0.5"
    >This document is valid from ${esc(validFrom)} to ${esc(validUntil)}</text>

</svg>`;

    return Buffer.from(svg);
}

// ============================================================
// MAIN API HANDLER
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profile, qrDataUrl, photoDataUrl } = body;

        // Validate required fields
        if (!profile || !profile.full_name) {
            return NextResponse.json(
                { error: 'Missing required profile information', details: 'full_name is required' },
                { status: 400 }
            );
        }

        console.log(`[Certificate Gen] Starting for: ${profile.full_name}`);

        // ── STEP 1: Load the certificate template image ──
        const templatePath = path.join(process.cwd(), 'public', 'certificate-template.png');

        if (!fs.existsSync(templatePath)) {
            return NextResponse.json(
                { error: 'Certificate template not found', details: 'Place certificate-template.png in /public/' },
                { status: 500 }
            );
        }

        const templateBuffer = fs.readFileSync(templatePath);
        console.log(`[Certificate Gen] Template loaded: ${templateBuffer.length} bytes`);

        // ── STEP 2: Prepare dynamic data ──
        const serialNumber = profile.registration_number
            || profile.id?.slice(0, 8)?.toUpperCase()
            || 'PENDING';

        const memberName = profile.full_name;

        const membershipType = profile.membership_type
            ? profile.membership_type.replace(/_/g, ' ')
            : 'Full';

        const formatDate = (dateStr?: string): string => {
            if (!dateStr) {
                return new Date().toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
            }
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        };

        const validFrom = formatDate(profile.subscription_start_date);
        const validUntil = formatDate(
            profile.subscription_end_date ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        );

        // ── STEP 3: Build the SVG text overlay ──
        const textOverlaySvg = buildTextOverlaySvg({
            serialNumber,
            memberName,
            membershipType,
            validFrom,
            validUntil,
        });

        // ── STEP 4: Build composite layers ──
        const compositeInputs: sharp.OverlayOptions[] = [
            {
                input: textOverlaySvg,
                top: 0,
                left: 0,
            },
        ];

        // ── STEP 5: Add PROFILE PHOTO (circular, inside gold ring) ──
        if (photoDataUrl) {
            try {
                const photoBase64 = photoDataUrl.replace(/^data:image\/\w+;base64,/, '');
                const photoBuffer = Buffer.from(photoBase64, 'base64');

                // Create a perfectly circular photo that fits inside the gold ring
                const circularPhoto = await createCircularPhoto(
                    photoBuffer,
                    PHOTO.innerDiameter,
                );

                // Position: center the circular photo within the gold ring
                // top-left of the photo = (centerX - radius, centerY - radius)
                const photoTop = PHOTO.centerY - Math.floor(PHOTO.innerDiameter / 2);
                const photoLeft = PHOTO.centerX - Math.floor(PHOTO.innerDiameter / 2);

                compositeInputs.push({
                    input: circularPhoto,
                    top: photoTop,
                    left: photoLeft,
                });

                console.log(`[Certificate Gen] Profile photo composited at (${photoLeft}, ${photoTop}), diameter=${PHOTO.innerDiameter}px`);
            } catch (photoErr) {
                console.error('[Certificate Gen] Profile photo processing failed:', photoErr);
                // Continue without photo — not fatal
            }
        }

        // ── STEP 6: Add QR code ──
        if (qrDataUrl) {
            try {
                const qrBase64 = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
                const qrBuffer = Buffer.from(qrBase64, 'base64');

                const qrResized = await sharp(qrBuffer)
                    .resize(FIELDS.qrCode.size, FIELDS.qrCode.size, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 },
                    })
                    .png()
                    .toBuffer();

                compositeInputs.push({
                    input: qrResized,
                    top: FIELDS.qrCode.y,
                    left: FIELDS.qrCode.x,
                });

                console.log(`[Certificate Gen] QR code composited at (${FIELDS.qrCode.x}, ${FIELDS.qrCode.y})`);
            } catch (qrErr) {
                console.error('[Certificate Gen] QR code processing failed:', qrErr);
            }
        }

        // ── STEP 7: Composite everything onto the template ──
        const composedImage = await sharp(templateBuffer)
            .composite(compositeInputs)
            .png()
            .toBuffer();

        console.log(`[Certificate Gen] Image composed: ${composedImage.length} bytes`);

        // ── STEP 8: Embed composed image into a PDF ──
        const pdfDoc = await PDFDocument.create();

        // PDF page dimensions: convert pixel dimensions to points
        // Using 0.72 scale factor to create a letter-like page
        const pdfPageWidth = TEMPLATE.width * 0.72;    // 900 pt
        const pdfPageHeight = TEMPLATE.height * 0.72;   // 636.48 pt

        const page = pdfDoc.addPage([pdfPageWidth, pdfPageHeight]);
        const pngImage = await pdfDoc.embedPng(composedImage);

        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pdfPageWidth,
            height: pdfPageHeight,
        });

        const pdfBytes = await pdfDoc.save();

        // ── STEP 9: Return PDF ──
        const filename = `SOOOP-Certificate-${serialNumber}.pdf`;
        console.log(`[Certificate Gen] PDF generated: ${filename} (${pdfBytes.length} bytes)`);

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
        });
    } catch (error) {
        console.error('[Certificate Gen] Error:', error);

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
