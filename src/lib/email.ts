'use server';

import nodemailer from 'nodemailer';

// Zoho SMTP transport - uses env variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('[Email] SMTP credentials not configured');
            return { success: false, error: 'SMTP not configured' };
        }

        await transporter.sendMail({
            from: `"SOOOP - Society of Optometrists" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments,
        });

        console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
        return { success: true };
    } catch (error: any) {
        console.error(`[Email] Failed to send to ${options.to}:`, error.message);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════

const BRAND_COLOR = '#001F54';
const ACCENT_COLOR = '#0D9488';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://soopvision.com';

function emailWrapper(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOOOP</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,#003380 100%);padding:32px 40px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0;letter-spacing:2px;">SOOOP</h1>
                            <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Society of Optometrists of Pakistan</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
                            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                                © ${new Date().getFullYear()} Society of Optometrists of Pakistan. All rights reserved.
                            </p>
                            <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;text-align:center;">
                                <a href="${SITE_URL}" style="color:${ACCENT_COLOR};text-decoration:none;">Visit Website</a>
                                &nbsp;•&nbsp;
                                <a href="mailto:contact@soopvision.com" style="color:${ACCENT_COLOR};text-decoration:none;">Contact Support</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ─── APPROVAL EMAIL ────────────────────────────────────────
export function approvalEmailTemplate(memberName: string, registrationNumber: string, subscriptionEndDate: string): string {
    return emailWrapper(`
        <div style="text-align:center;margin-bottom:32px;">
            <div style="width:80px;height:80px;background-color:#ecfdf5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 style="color:#111827;font-size:24px;margin:0 0 8px;font-weight:700;">Membership Approved! 🎉</h2>
            <p style="color:#6b7280;font-size:15px;margin:0;">Congratulations on becoming an official member.</p>
        </div>

        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Dear <strong>${memberName}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            We are pleased to inform you that your membership application has been <strong style="color:#059669;">approved</strong>. 
            Welcome to the Society of Optometrists of Pakistan (SOOOP)!
        </p>

        <!-- Membership Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
            <tr>
                <td style="background:linear-gradient(135deg,${BRAND_COLOR},#003380);border-radius:12px;padding:24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="padding-bottom:12px;">
                                <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:2px;">Registration Number</p>
                                <p style="color:#ffffff;font-size:22px;font-weight:700;margin:4px 0 0;font-family:monospace;">${registrationNumber}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="border-top:1px solid rgba(255,255,255,0.15);padding-top:12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:1px;">Member</p>
                                            <p style="color:#ffffff;font-size:14px;font-weight:600;margin:2px 0 0;">${memberName}</p>
                                        </td>
                                        <td style="text-align:right;">
                                            <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:1px;">Valid Until</p>
                                            <p style="color:#34d399;font-size:14px;font-weight:600;margin:2px 0 0;">${subscriptionEndDate}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h3 style="color:#111827;font-size:16px;margin:28px 0 16px;font-weight:600;">What you can do now:</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:8px 0;color:#374151;font-size:14px;">✅ Access your Digital Membership Certificate</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:14px;">✅ Get listed in the official SOOOP Members Directory</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:14px;">✅ Participate in SOOOP events and meetings</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:14px;">✅ Access member-only resources and benefits</td></tr>
        </table>

        <div style="text-align:center;margin:32px 0 0;">
            <a href="${SITE_URL}/login" style="display:inline-block;background:linear-gradient(135deg,${ACCENT_COLOR},#0f766e);color:#ffffff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(13,148,136,0.3);">
                Go to Your Dashboard →
            </a>
        </div>
    `);
}

// ─── REJECTION EMAIL ────────────────────────────────────────
export function rejectionEmailTemplate(memberName: string): string {
    return emailWrapper(`
        <div style="text-align:center;margin-bottom:32px;">
            <div style="width:80px;height:80px;background-color:#fef2f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h2 style="color:#111827;font-size:24px;margin:0 0 8px;font-weight:700;">Application Returned</h2>
            <p style="color:#6b7280;font-size:15px;margin:0;">Your application requires some updates.</p>
        </div>

        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Dear <strong>${memberName}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            After reviewing your membership application, our team has determined that some information needs to be updated or additional documents are required.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Please log in to your dashboard and resubmit your application with the correct information.
        </p>

        <div style="text-align:center;margin:32px 0 0;">
            <a href="${SITE_URL}/login" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLOR},#003380);color:#ffffff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                Update Your Application →
            </a>
        </div>
    `);
}

// ─── MEETING CERTIFICATE EMAIL ───────────────────────────────
export function meetingCertificateEmailTemplate(memberName: string, meetingTitle: string, meetingDate: string): string {
    return emailWrapper(`
        <div style="text-align:center;margin-bottom:32px;">
            <div style="width:80px;height:80px;background-color:#ecfdf5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <h2 style="color:#111827;font-size:24px;margin:0 0 8px;font-weight:700;">Participation Certificate 🏆</h2>
            <p style="color:#6b7280;font-size:15px;margin:0;">Thank you for your participation!</p>
        </div>

        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Dear <strong>${memberName}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            We are delighted to share your <strong>Participation Certificate</strong> for the following event:
        </p>

        <!-- Event Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
            <tr>
                <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:12px;padding:24px;">
                    <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:2px;">Event</p>
                    <p style="color:#ffffff;font-size:20px;font-weight:700;margin:8px 0;">${meetingTitle}</p>
                    <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">📅 ${meetingDate}</p>
                </td>
            </tr>
        </table>

        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Your certificate is attached as a PDF with this email. You can download and print it for your records.
        </p>

        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:24px 0;">
            <p style="color:#166534;font-size:14px;margin:0;font-weight:600;">📎 Certificate attached as PDF</p>
            <p style="color:#15803d;font-size:13px;margin:4px 0 0;">Check your email attachments to download your certificate.</p>
        </div>

        <div style="text-align:center;margin:32px 0 0;">
            <a href="${SITE_URL}/login" style="display:inline-block;background:linear-gradient(135deg,${ACCENT_COLOR},#0f766e);color:#ffffff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                Visit Your Dashboard →
            </a>
        </div>
    `);
}
