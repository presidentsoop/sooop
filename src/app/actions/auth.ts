'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';


export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
}

/**
 * Activate an existing membership for imported members.
 * This function:
 * 1. Checks if the email exists in the imported_members table
 * 2. Creates an auth user and sends an invite email
 * 3. The user can then set their password via the email link
 */
export async function activateExistingMembership(email: string): Promise<{
    success: boolean;
    message: string;
    memberName?: string;
}> {
    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists in imported_members
    const { data: importedMember, error: checkError } = await supabase
        .from('imported_members')
        .select('id, email, full_name, claimed, invite_sent')
        .eq('email', normalizedEmail)
        .single();

    if (checkError || !importedMember) {
        // Also check if already has an account
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', normalizedEmail)
            .single();

        if (existingProfile) {
            return {
                success: false,
                message: 'This email already has an account. Please use the login form or reset your password.'
            };
        }

        return {
            success: false,
            message: 'Email not found in our records. If you believe this is an error, please contact support.'
        };
    }

    // Check if already claimed
    if (importedMember.claimed) {
        return {
            success: false,
            message: 'This membership has already been activated. Please use the login form or reset your password.'
        };
    }

    // Create admin client for inviting users
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
        // Check if user already exists in auth (might have a profile without being in imported)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

        if (existingUser) {
            // User exists in auth, send password reset instead
            const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sooop.org.pk'}/auth/callback?type=recovery`
            });

            if (resetError) {
                console.error('Password reset error:', resetError);
                return {
                    success: false,
                    message: 'Failed to send activation email. Please try again or contact support.'
                };
            }

            // Update imported_members
            await supabase
                .from('imported_members')
                .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
                .eq('id', importedMember.id);

            return {
                success: true,
                message: 'Activation email sent! Please check your inbox to set your password.',
                memberName: importedMember.full_name
            };
        }

        // Invite new user (creates auth user and sends email)
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sooop.org.pk'}/auth/callback?type=invite`,
            data: {
                full_name: importedMember.full_name,
                imported_member_id: importedMember.id
            }
        });

        if (inviteError) {
            console.error('Invite error:', inviteError);
            return {
                success: false,
                message: 'Failed to send activation email. Please try again or contact support.'
            };
        }

        // Update imported_members to mark invite sent
        await supabase
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
