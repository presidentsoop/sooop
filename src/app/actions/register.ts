'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function registerMember(formData: FormData) {
    const supabaseAdmin = createAdminClient();
    const supabase = await createClient(); // For auth.signUp (using anon key usually behaves better for sending confirmation emails?)
    // Actually, creating user with admin client auto-confirms by default unless configured.
    // We WANT email confirmation flow properly.
    // If we use admin.auth.admin.createUser, it auto-confirms usually.
    // If we use supabase.auth.signUp (server side), it respects project settings.

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Personal
    const fullName = formData.get('full_name') as string;
    const fatherName = formData.get('father_name') as string;
    const cnic = formData.get('cnic') as string;
    const dob = formData.get('dob') as string;
    const gender = formData.get('gender') as string;
    const bloodGroup = formData.get('blood_group') as string;

    // Contact
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;

    // Professional
    const role = formData.get('role') as string || 'member';
    const membershipType = formData.get('membership_type') as string;
    const isRenewal = formData.get('is_renewal') === 'true';

    const institution = formData.get('institution') as string;
    const collegeAttended = formData.get('college_attended') as string;
    const qualification = formData.get('qualification') as string;
    const otherQualification = formData.get('other_qualification') as string;
    const postGraduateInstitution = formData.get('post_graduate_institution') as string;
    const hasRelevantPg = formData.get('has_relevant_pg') === 'true';
    const hasNonRelevantPg = formData.get('has_non_relevant_pg') === 'true';

    const currentStatus = formData.get('current_status') as string;
    const designation = formData.get('designation') as string;
    const employmentStatus = formData.get('employment_status') as string;

    // Helper to sanitize input (empty string -> null)
    const s = (val: string | null) => (!val || val.trim() === '') ? null : val.trim();

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                cnic: cnic,
                father_name: s(fatherName),
                date_of_birth: s(dob),
                gender: s(gender),
                blood_group: s(bloodGroup),

                contact_number: s(phone),
                residential_address: s(address),
                city: s(city),
                province: s(province),

                institution: s(institution),
                college_attended: s(collegeAttended),
                qualification: s(qualification),
                other_qualification: s(otherQualification),
                post_graduate_institution: s(postGraduateInstitution),
                has_relevant_pg: hasRelevantPg,
                has_non_relevant_pg: hasNonRelevantPg,

                current_status: s(currentStatus),
                designation: s(designation),
                employment_status: s(employmentStatus),

                membership_type: s(membershipType),
                role: 'member'
            }
        }
    });

    if (authError) {
        return { error: authError.message };
    }

    if (!authData.user) {
        return { error: "Failed to create user. Please check your email inbox if confirmation is required." };
    }

    const userId = authData.user.id;
    const session = authData.session;

    // DECISION: Use Admin Client (if key exists) OR User Client (if session exists)
    // This solves the issue where Admin Key is missing but we have a valid User Session (Auto-confirm)
    let workingClient: any = supabaseAdmin;

    if (session) {
        // Create a client acting as the user
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        workingClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${session.access_token}` } }
            }
        );
    }

    const fileUrls: Record<string, string> = {};

    // 4. Handle File Uploads
    // Helper to upload
    const uploadFile = async (file: File, docType: string) => {
        if (!file || file.size === 0) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
        const buffer = await file.arrayBuffer();

        let targetBucket = 'documents';
        if (docType === 'profile_photo') targetBucket = 'profile-photos';

        const { data: uploadData, error: uploadError } = await workingClient.storage
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
        let fileUrl = fileName; // Default to path for private bucket
        if (targetBucket === 'profile-photos') {
            const { data: publicData } = workingClient.storage.from(targetBucket).getPublicUrl(fileName);
            fileUrl = publicData.publicUrl;
        }

        fileUrls[docType] = fileUrl;

        // 5. Insert into documents table
        await workingClient.from('documents').insert({
            user_id: userId,
            document_type: docType,
            file_url: fileUrl,
            status: 'pending',
            verified: false
        });
    };

    const filesToUpload = [
        { key: 'profile_photo', type: 'profile_photo' },
        { key: 'cnic_front', type: 'cnic_front' },
        { key: 'cnic_back', type: 'cnic_back' },
        { key: 'transcript', type: 'transcript_front' },
        { key: 'transcript_back', type: 'transcript_back' },
        { key: 'student_id', type: 'student_id' },
        { key: 'renewal_card', type: 'renewal_card' },
        { key: 'payment_proof', type: 'payment_proof' }
    ];

    for (const item of filesToUpload) {
        const file = formData.get(item.key) as File;
        if (file) {
            await uploadFile(file, item.type);
        }
    }

    // 2. Update Profile Photo (Trigger handled the rest)
    if (fileUrls['profile_photo']) {
        const { error: profileError } = await workingClient
            .from('profiles')
            .update({
                profile_photo_url: fileUrls['profile_photo']
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Profile Photo Update Error", profileError);
            // Don't fail the whole request for this
        }
    }

    // 3. Create Application Record
    const { error: appError } = await workingClient.from('membership_applications').insert({
        user_id: userId,
        status: 'pending',
        membership_type: membershipType,
        is_renewal: isRenewal,

        renewal_card_url: fileUrls['renewal_card'] || null,
        student_id_url: fileUrls['student_id'] || null,
        transcript_front_url: fileUrls['transcript_front'] || null,
        transcript_back_url: fileUrls['transcript_back'] || null
    });

    if (appError) {
        console.error("Application Insert Error", appError);
        return { error: "Failed to submit application record: " + appError.message };
    }

    // 6. Create Pending Payment
    if (fileUrls['payment_proof']) {
        await workingClient.from('payments').insert({
            user_id: userId,
            amount: 0, // Should be set based on membership type technically
            payment_mode: 'Bank Transfer (Upload)',
            status: 'pending',
            receipt_url: fileUrls['payment_proof']
        });
    }

    return { success: true };
}
