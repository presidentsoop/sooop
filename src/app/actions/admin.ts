'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createMember(data: any) {
    const supabaseAdmin = createAdminClient();

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto-confirm since admin is creating it
        user_metadata: {
            full_name: data.fullName,
            cnic: data.cnic,
            role: 'member'
        }
    });

    if (authError) {
        console.error("Admin Create User Error:", authError);
        return { error: authError.message };
    }

    if (!authData.user) return { error: "Failed to create user" };

    const userId = authData.user.id;

    // 2. Update Profile with extra details
    // We use upsert to ensure we handle the record created by triggers if any, though admin.createUser might not fire triggers dependent on public events same way
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            email: data.email,
            full_name: data.fullName,
            father_name: data.fatherName || null,
            cnic: data.cnic,
            contact_number: data.phone,
            membership_status: data.membership_status || 'active',
            role: data.role || 'member',
            institution: data.institution || null,
            gender: data.gender || null,
            created_at: new Date().toISOString()
        });

    if (profileError) {
        console.error("Profile Upsert Error:", profileError);
        // Try to clean up auth user if profile fails? 
        // For now just return error.
        return { error: "User created but profile failed: " + profileError.message };
    }

    revalidatePath('/dashboard/members');
    return { success: true, userId };
}
