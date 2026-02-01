'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Create a safe admin client that won't crash if service key is missing
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY - operations will fail");
        return null;
    }

    return createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function registerMember(formData: FormData) {
    const supabase = await createClient();
    const supabaseAdmin = getAdminClient();

    // Check if admin client is available
    if (!supabaseAdmin) {
        return { error: "Server configuration error. Please contact administrator. (Missing service key)" };
    }

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
    // Force role to member for public registration security
    const role = 'member';
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

    // 1. Create Auth User using regular client (this works without service key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                cnic: cnic,
                father_name: s(fatherName),
                role: 'member',
                membership_type: s(membershipType)
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
    const fileUrls: Record<string, string> = {};

    // 2. Handle File Uploads (using admin client to bypass RLS on storage)
    const uploadFile = async (file: File, docType: string) => {
        if (!file || file.size === 0) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
        const buffer = await file.arrayBuffer();

        let targetBucket = 'documents';
        if (docType === 'profile_photo') targetBucket = 'profile-photos';

        const { error: uploadError } = await supabaseAdmin.storage
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
            const { data: publicData } = supabaseAdmin.storage.from(targetBucket).getPublicUrl(fileName);
            fileUrl = publicData.publicUrl;
        }

        fileUrls[docType] = fileUrl;

        // Insert into documents table
        await supabaseAdmin.from('documents').insert({
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

    // 3. Upsert Profile using ADMIN client (bypasses RLS)
    const profileData = {
        id: userId,
        email: email,
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
        role: role,
        membership_status: 'pending',

        profile_photo_url: fileUrls['profile_photo'] || null,
        updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
        console.error("Profile Creation Failed:", profileError);
        return { error: "Failed to initialize user profile: " + profileError.message };
    }

    // 4. Create Application Record
    const { error: appError } = await supabaseAdmin.from('membership_applications').insert({
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

    // 5. Create Pending Payment
    if (fileUrls['payment_proof']) {
        await supabaseAdmin.from('payments').insert({
            user_id: userId,
            amount: 0,
            payment_mode: 'Bank Transfer (Upload)',
            status: 'pending',
            receipt_url: fileUrls['payment_proof']
        });
    }

    return { success: true };
}
