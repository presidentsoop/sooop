'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteMember(userId: string) {
    const supabaseAdmin = createAdminClient();

    try {
        // 1. Delete from Auth Users (this cascades if set up, but let's be safe)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError && !authError.message?.includes('User not found')) {
            console.error("Auth Delete Error:", authError);
            return { error: "Failed to delete user account" };
        }

        // 2. Delete Profile (if not cascaded)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error("Profile Delete Error:", profileError);
            // Don't error out here if auth deletion worked, but log it
        }

        revalidatePath('/dashboard/members');
        return { success: true };
    } catch (error) {
        console.error("Delete Member Exception:", error);
        return { error: "An unexpected error occurred" };
    }
}
