'use server';

import { sendEmail, approvalEmailTemplate, rejectionEmailTemplate } from '@/lib/email';

/**
 * Send a professional approval email to a newly approved member.
 */
export async function sendApprovalEmail(
    email: string,
    memberName: string,
    registrationNumber: string,
    subscriptionEndDate: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        to: email,
        subject: '🎉 Your SOOOP Membership Has Been Approved!',
        html: approvalEmailTemplate(memberName, registrationNumber, subscriptionEndDate),
    });
}

/**
 * Send a professional rejection email when an application is returned.
 */
export async function sendRejectionEmail(
    email: string,
    memberName: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        to: email,
        subject: 'SOOOP Membership - Application Update',
        html: rejectionEmailTemplate(memberName),
    });
}
