'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteMember(userId: string) {
    if (!userId) {
        return { error: "User ID is required" };
    }

    try {
        const supabaseAdmin = createAdminClient();

        // 1. Delete related documents
        await supabaseAdmin.from('documents').delete().eq('user_id', userId);

        // 2. Delete membership applications
        await supabaseAdmin.from('membership_applications').delete().eq('user_id', userId);

        // 3. Delete payments
        await supabaseAdmin.from('payments').delete().eq('user_id', userId);

        // 4. Delete wing memberships if exists
        await supabaseAdmin.from('wing_members').delete().eq('user_id', userId);

        // 5. Delete profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error("Profile Delete Error:", profileError);
            // Continue anyway - we still want to delete auth user
        }

        // 6. Delete from Auth Users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Auth Delete Error:", authError);
            // If user not found, that's okay - they might have been deleted already
            if (!authError.message?.includes('User not found') && !authError.message?.includes('not found')) {
                return { error: "Failed to delete user account: " + authError.message };
            }
        }

        // Revalidate all relevant paths
        revalidatePath('/dashboard/members');
        revalidatePath('/dashboard/verify');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error("Delete Member Exception:", error);
        return { error: error.message || "An unexpected error occurred while deleting the member" };
    }
}
