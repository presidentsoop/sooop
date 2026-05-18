'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createSeminar(data: { title: string, seminar_date: string, location?: string, template_id?: string, description?: string }) {
    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('seminars').insert([data]);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}

export async function updateSeminar(id: string, data: any) {
    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('seminars').update(data).eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}

export async function toggleAttendeeStatus(seminar_id: string, profile_id: string, status: string) {
    try {
        const supabaseAdmin = createAdminClient();
        
        // Upsert the attendance status
        const { error } = await supabaseAdmin.from('seminar_attendees').upsert({
            seminar_id,
            profile_id,
            attendance_status: status
        }, { onConflict: 'seminar_id,profile_id' });
        
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}

export async function bulkAddAttendees(seminar_id: string, profile_ids: string[]) {
    if (!profile_ids.length) return { error: "No users provided" };
    try {
        const supabaseAdmin = createAdminClient();
        
        const payload = profile_ids.map(profile_id => ({
            seminar_id,
            profile_id,
            attendance_status: 'approved'
        }));

        const { error } = await supabaseAdmin.from('seminar_attendees').upsert(payload, { onConflict: 'seminar_id,profile_id' });
        
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true, count: profile_ids.length };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}

export async function createTemplate(data: { name: string, background_image_url: string, layout_config: any }) {
    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('certificate_templates').insert([data]);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}

export async function removeAttendee(seminar_id: string, profile_id: string) {
    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('seminar_attendees').delete().match({ seminar_id, profile_id });
        if (error) return { error: error.message };
        revalidatePath('/dashboard/seminars');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "An error occurred" };
    }
}
