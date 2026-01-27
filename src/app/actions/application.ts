'use server';

import { createClient } from '@/lib/supabase/server'; // Regular client for auth check
import { revalidatePath } from 'next/cache';

export async function submitApplication(formData: FormData) {
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    const userId = user.id;
    const fileUrls: Record<string, string> = {};

    // Helper to upload
    const uploadFile = async (file: File, docType: string) => {
        if (!file || file.size === 0) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
        const buffer = await file.arrayBuffer();

        let targetBucket = 'documents';
        if (docType === 'profile_photo') targetBucket = 'profile-photos';

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(targetBucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error(`Upload failed for ${docType}:`, uploadError);
            return null;
        }

        // Get URL
        let fileUrl = fileName;
        if (targetBucket === 'profile-photos') {
            const { data: publicData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
            fileUrl = publicData.publicUrl;
        }

        fileUrls[docType] = fileUrl;

        // Insert into documents table (using auth client)
        await supabase.from('documents').insert({
            user_id: userId,
            document_type: docType,
            file_url: fileUrl,
            status: 'pending',
            verified: false
        });
    };

    // Extract text fields
    const fullName = formData.get('fullName') as string;
    const fatherName = formData.get('fatherName') as string;
    const cnic = formData.get('cnic') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const dob = formData.get('dob') as string;
    const gender = formData.get('gender') as string;
    const residentialAddress = formData.get('residentialAddress') as string;

    const membershipType = formData.get('membershipType') as string;
    const isRenewal = formData.get('isRenewal') === 'true';
    const transactionId = formData.get('transactionId') as string;

    // Handle Files
    const filesToUpload = [
        { key: 'photo', type: 'profile_photo' },
        { key: 'cnicFront', type: 'cnic_front' },
        { key: 'cnicBack', type: 'cnic_back' },
        { key: 'transcriptFront', type: 'transcript_front' },
        { key: 'transcriptBack', type: 'transcript_back' },
        { key: 'studentId', type: 'student_id' },
        { key: 'oldCard', type: 'renewal_card' },
        { key: 'receipt', type: 'payment_proof' }
    ];

    for (const item of filesToUpload) {
        const file = formData.get(item.key) as File;
        if (file) {
            await uploadFile(file, item.type);
        }
    }

    try {
        // 2. Update Profile
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: user.email,
            full_name: fullName,
            father_name: fatherName,
            cnic: cnic,
            contact_number: contactNumber,
            gender: gender,
            date_of_birth: dob,
            residential_address: residentialAddress,
            profile_photo_url: fileUrls['profile_photo'],
            membership_status: 'pending' // Reset to pending
        });

        if (profileError) throw profileError;

        // 3. Create Application Record
        const { data: appData, error: appError } = await supabase.from('membership_applications').insert({
            user_id: userId,
            membership_type: membershipType,
            is_renewal: isRenewal,
            status: 'pending',
            renewal_card_url: fileUrls['renewal_card'] || null,
            student_id_url: fileUrls['student_id'] || null,
            transcript_front_url: fileUrls['transcript_front'] || null,
            transcript_back_url: fileUrls['transcript_back'] || null,
            submitted_at: new Date().toISOString()
        }).select().single();

        if (appError) throw appError;

        // 4. Create Payment Record
        const fees: any = {
            'Full': 1500,
            'Overseas': 3000,
            'Associate': 500,
            'Student': 1000
        };
        const amount = fees[membershipType] || 1500;

        // If receipt uploaded, create payment record
        if (fileUrls['payment_proof']) {
            const { error: payError } = await supabase.from('payments').insert({
                user_id: userId,
                application_id: appData.id,
                transaction_id: transactionId,
                amount: amount,
                receipt_url: fileUrls['payment_proof'],
                status: 'pending'
            });
            if (payError) throw payError;
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
