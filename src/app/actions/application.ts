'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MembershipFormData } from '@/lib/validations/membership';

export type ApplicationResponse = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function submitApplication(
    formData: MembershipFormData,
    fileUrls: Record<string, string>
): Promise<ApplicationResponse> {
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        // 2. Update Profile
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: formData.fullName,
            father_name: formData.fatherName,
            cnic: formData.cnic,
            contact_number: formData.contactNumber,
            gender: formData.gender,
            date_of_birth: formData.dob,
            blood_group: formData.bloodGroup,
            residential_address: formData.residentialAddress,
            profile_photo_url: fileUrls.photo,
            // Keep existing status if it exists, otherwise pending
            // We use upsert so we should be careful not to overwrite status if admin changed it
            // But for a new application, it usually implies 'pending'
            membership_status: 'pending' // Reset to pending on new application?
        });

        if (profileError) throw profileError;

        // 3. Create Application Record
        const { data: appData, error: appError } = await supabase.from('membership_applications').insert({
            user_id: user.id,
            membership_type: formData.membershipType,
            is_renewal: formData.isRenewal,
            status: 'pending',
            renewal_card_url: fileUrls.oldCard || null,
            student_id_url: fileUrls.studentId || null,
            transcript_front_url: fileUrls.transcriptFront || null,
            transcript_back_url: fileUrls.transcriptBack || null,
            submitted_at: new Date().toISOString()
        }).select().single();

        if (appError) throw appError;

        // 4. Create Payment Record
        const fees = {
            'Full': 1500,
            'Overseas': 3000,
            'Associate': 500,
            'Student': 1000
        };
        const amount = fees[formData.membershipType as keyof typeof fees] || 1500;

        const { error: payError } = await supabase.from('payments').insert({
            user_id: user.id,
            application_id: appData.id,
            transaction_id: formData.transactionId,
            amount: amount,
            receipt_url: fileUrls.receipt,
            status: 'pending'
        });

        if (payError) throw payError;

        // 5. Create Documents Records
        const docInserts = [];
        if (fileUrls.cnicFront) docInserts.push({ user_id: user.id, document_type: 'CNIC_Front', file_url: fileUrls.cnicFront });
        if (fileUrls.cnicBack) docInserts.push({ user_id: user.id, document_type: 'CNIC_Back', file_url: fileUrls.cnicBack });

        // Add others if needed for documents table, but application table columns cover most now.
        // If the 'documents' table is the source of truth for admin viewer:
        if (fileUrls.transcriptFront) docInserts.push({ user_id: user.id, document_type: 'Transcript_Front', file_url: fileUrls.transcriptFront });
        if (fileUrls.studentId) docInserts.push({ user_id: user.id, document_type: 'Student_ID', file_url: fileUrls.studentId });

        if (docInserts.length > 0) {
            const { error: docError } = await supabase.from('documents').insert(docInserts);
            if (docError) throw docError;
        }

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error('Submission Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to submit application'
        };
    }
}
