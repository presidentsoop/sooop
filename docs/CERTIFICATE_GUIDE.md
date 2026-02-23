
# Enterprise Grade Certificate Generation — Image Overlay Approach

## Overview
This document explains the architecture used to generate pixel-perfect PDF certificates in a Next.js environment. This approach mirrors the systems used by major tech companies (like Coursera, LinkedIn Learning, Google) to generate millions of verified documents.

## Why Image Overlay? (The "Big Tech" Approach)

Big tech companies generally use the **template image overlay** approach for official documents because:

1. **Pixel-Perfect Fidelity:** The certificate looks EXACTLY like the design — every font, every line, every logo is in the template image.
2. **Designer Freedom:** Designers create the template in Photoshop/Figma/Illustrator with complete creative control. Developers only overlay dynamic text at exact coordinates.
3. **Zero Layout Drift:** Unlike HTML/CSS → PDF conversion, image overlay guarantees identical output across all environments.
4. **Security:** Server-side generation prevents tampering.
5. **Scalability:** `sharp` is one of the fastest image processing libraries in Node.js — 10x faster than headless browser approaches.

## Architecture

```
┌──────────────────────────────────────┐
│          CLIENT (Browser)            │
│                                      │
│  1. Shows certificate PREVIEW        │
│     (template image + CSS overlays)  │
│                                      │
│  2. Generates QR code as data URL    │
│                                      │
│  3. POST /api/generate-certificate   │
│     Body: { profile, qrDataUrl }     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│       SERVER (API Route)             │
│                                      │
│  1. Load certificate-template.png    │
│     from /public/ (1250 x 884 px)   │
│                                      │
│  2. Build SVG text overlay with      │
│     dynamic data at exact (x, y)    │
│                                      │
│  3. Decode QR code data URL          │
│     → resize to fit template area   │
│                                      │
│  4. sharp.composite([                │
│       textOverlay,                   │
│       qrCodeImage                    │
│     ]) onto template                 │
│                                      │
│  5. Embed composed image into PDF    │
│     using pdf-lib                    │
│                                      │
│  6. Return PDF as download           │
└──────────────────────────────────────┘
```

## Template Specifications

- **File:** `/public/certificate-template.png`
- **Dimensions:** 1250 × 884 pixels
- **Format:** PNG (lossless quality)

### Dynamic Field Coordinates (px)

| Field                 | X       | Y       | Font Size | Anchor  | Notes                                    |
|-----------------------|---------|---------|-----------|---------|------------------------------------------|
| Serial Number         | 1010    | 30      | 22px      | start   | Red, bold, after "SERIAL:" text          |
| Member Name           | 625     | 340     | 32px      | middle  | Navy, bold, centered below "HEREBY THAT" |
| Paragraph Line 1      | 625     | 430     | 16px      | middle  | Serif, centered                          |
| Paragraph Line 2      | 625     | 455     | 16px      | middle  | With bold membership type                |
| Validity Line         | 625     | 505     | 16px      | middle  | Italic, "valid from X to Y"              |
| QR Code               | 18      | 735     | 120×120   | —       | Bottom-left white area                   |

### How to Adjust Coordinates

If the template image changes or positions need fine-tuning:

1. Open the template in any image editor (Photoshop, Figma, etc.)
2. Note the exact (x, y) pixel position where text should start
3. Update the `FIELDS` object in `/src/app/api/generate-certificate/route.tsx`
4. For centered text, use `anchor: 'middle'` and set X to the horizontal center

## Tech Stack

| Library    | Purpose                                      |
|------------|----------------------------------------------|
| `sharp`    | Server-side image compositing (fastest Node.js option) |
| `pdf-lib`  | Create PDF and embed the composed image      |
| `qrcode`   | Generate verification QR code (client-side)  |

## Files

| File                                           | Purpose                                |
|------------------------------------------------|----------------------------------------|
| `/public/certificate-template.png`             | The template image (1250×884px)        |
| `/src/app/api/generate-certificate/route.tsx`  | Server API: overlay + PDF generation   |
| `/src/components/dashboard/MembershipCertificate.tsx` | Client: preview + download trigger |

## How It Works Step by Step

### 1. Client Side (`MembershipCertificate.tsx`)
- Displays a **live preview** using the template image with CSS-positioned overlays
- Generates a QR code linking to `sooopvision.com/verify/{id}`
- Sends `{ profile, qrDataUrl }` to the API

### 2. Server Side (`/api/generate-certificate`)
1. **Load template** — reads `certificate-template.png` from disk
2. **Build SVG overlay** — creates an SVG (same 1250×884 dimensions) with all dynamic text positioned at exact pixel coordinates
3. **Process QR code** — decodes the base64 QR data URL, resizes to 120×120px
4. **Composite** — uses `sharp.composite()` to layer the SVG text and QR code ON TOP of the template
5. **Create PDF** — uses `pdf-lib` to create a single-page PDF with the composed image filling the entire page
6. **Return** — streams the PDF back with download headers

## Customization

### Changing the Template
1. Replace `/public/certificate-template.png` with the new design
2. Update `TEMPLATE.width` and `TEMPLATE.height` in the route file
3. Update `FIELDS` coordinates to match new positions
4. The PDF page dimensions auto-scale from the template

### Adding New Dynamic Fields
1. Add a new entry to the `FIELDS` object
2. Add a corresponding `<text>` element in `buildTextOverlaySvg()`
3. Add a CSS overlay in the preview component

### Changing Fonts
- The SVG overlay supports Google Fonts via `@import`
- Update the `fontFamily` in both the SVG builder and the preview CSS
- For custom fonts, consider embedding them in the SVG as base64

## Verification
The QR code on each certificate links to `https://sooopvision.com/verify/{registration_number}`. Ensure the `/verify/[id]` page exists to handle verification traffic.
