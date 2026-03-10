'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';


export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
}

export async function activateExistingMembership(email: string): Promise<{
    success: boolean;
    message: string;
    memberName?: string;
}> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Setup Admin credentials to bypass Row Level Security (RLS) entirely
    // This is critical because Anonymous users on the login screen cannot query 'imported_members' or 'profiles'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials for admin operations');
        return {
            success: false,
            message: 'Server configuration error. Please contact support.'
        };
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 2. CHECK 'imported_members' TABLE USING ADMIN CLIENT (Bypass RLS)
        const { data: importedMember, error: importCheckError } = await supabaseAdmin
            .from('imported_members')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (importCheckError || !importedMember) {
            // Also check if already has an account in the active system (fallback check)
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name')
                .eq('email', normalizedEmail)
                .single();

            if (existingProfile) {
                // The user is fully registered already. They just need to use 'Forgot Password'.
                // To be user-friendly, we can still trigger a password reset for them.
                const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://soopvision.com'}/auth/callback?type=invite`
                });

                if (resetError) {
                    console.error('Password reset error for existing profile:', resetError);
                    return { success: false, message: 'Your account is fully active, but failed to send activation email.' };
                }

                return {
                    success: true,
                    message: 'Your membership is already active. A password reset email has been sent to your inbox.',
                    memberName: existingProfile.full_name
                };
            }

            return {
                success: false,
                message: 'Email not found in our records. If you believe this is an error, please contact support or register as a new member.'
            };
        }

        // 3. Prevent duplicate claims so that they can't override accounts randomly
        if (importedMember.claimed) {
            return {
                success: false,
                message: 'This membership is already activated. Please use the standard login form or reset your password.'
            };
        }

        // Wait! What if they are imported_members but ALREADY existing in auth.users?
        // Check if user already exists in auth
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = existingAuthUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

        if (existingAuthUser) {
            // Proceed directly to reset password 
            const { error: existingResetError } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://soopvision.com'}/auth/callback?type=invite`
            });

            // Mark invite sent
            await supabaseAdmin
                .from('imported_members')
                .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
                .eq('id', importedMember.id);

            return {
                success: true,
                message: 'Activation email sent! Please check your inbox to set your password.',
                memberName: importedMember.full_name
            };
        }

        // 4. Create the User in Auth with a Temp Password (if they don't exist yet)
        const tempPassword = `Sooop@${Math.floor(100000 + Math.random() * 900000)}`;
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: importedMember.full_name,
                imported_member_id: importedMember.id // Tracks origin
            }
        });

        if (createError && !createError.message.includes('already registered')) {
            console.error('Create user error:', createError);
            return {
                success: false,
                message: 'Failed to initialize account. Please try again or contact support.'
            };
        }

        // 5. Send Reset Password Email (Our 'Activation Link')
        const { error: inviteError } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://soopvision.com'}/auth/callback?type=invite`
        });

        if (inviteError) {
            console.error('Invite/Reset error:', inviteError);
            return {
                success: false,
                message: 'Failed to send activation email. Please try again or contact support.'
            };
        }

        // 6. Update the imported table to reflect that the invite was sent
        await supabaseAdmin
            .from('imported_members')
            .update({
                invite_sent: true,
                invite_sent_at: new Date().toISOString()
            })
            .eq('id', importedMember.id);

        return {
            success: true,
            message: 'Activation email sent! Please check your inbox to set your password.',
            memberName: importedMember.full_name
        };

    } catch (error) {
        console.error('Activation error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again or contact support.'
        };
    }
}

export async function linkImportedDataAction(): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { success: false, message: 'Not authenticated' };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) return { success: false, message: 'Server config error' };

    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // Check if they have an unclaimed imported_member record
    const { data: importedMember } = await supabaseAdmin
        .from('imported_members')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .eq('claimed', false)
        .single();

    if (!importedMember) return { success: true, message: 'No unclaimed data found' }; // Not an imported user, or already claimed

    // Link it! Upsert because profiles row may not exist yet
    const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: importedMember.full_name,
            father_name: importedMember.father_name,
            cnic: importedMember.cnic,
            contact_number: importedMember.contact_number,
            membership_type: importedMember.membership_type,
            gender: importedMember.gender,
            date_of_birth: importedMember.date_of_birth,
            blood_group: importedMember.blood_group,
            qualification: importedMember.qualification,
            has_relevant_pg: importedMember.has_relevant_pg,
            has_non_relevant_pg: importedMember.has_non_relevant_pg,
            college_attended: importedMember.college_attended,
            post_graduate_institution: importedMember.post_graduate_institution,
            employment_status: importedMember.employment_status,
            designation: importedMember.designation,
            city: importedMember.city,
            province: importedMember.province,
            residential_address: importedMember.residential_address,
            subscription_start_date: importedMember.subscription_start_date,
            subscription_end_date: importedMember.subscription_end_date,
            membership_status: 'none' // Still need to review and upload forms
        });

    if (upsertError) {
        console.error('Failed to upsert profile:', upsertError);
        return { success: false, message: 'Failed to sync data' };
    }

    await supabaseAdmin
        .from('imported_members')
        .update({ claimed: true, claimed_by: user.id, claimed_at: new Date().toISOString() })
        .eq('id', importedMember.id);

    return { success: true, message: 'Data linked successfully' };
}
