import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type') // recovery, signup, magiclink, invite, etc.
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && sessionData?.user) {
            const user = sessionData.user

            // Check if this is an invite flow (existing member activation)
            if (type === 'invite') {
                // Link imported member data to the new profile
                await linkImportedMemberData(user.id, user.email || '')

                // Redirect to password update page for invited users
                return NextResponse.redirect(`${origin}/update-password?activated=true`)
            }

            // For password reset flow, redirect to update-password page
            if (type === 'recovery' || next === '/update-password') {
                return NextResponse.redirect(`${origin}/update-password`)
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

/**
 * Links imported member data to a newly authenticated user
 */
async function linkImportedMemberData(userId: string, email: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials for linking imported member')
        return
    }

    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    try {
        // Find the imported member record
        const { data: importedMember, error: findError } = await supabase
            .from('imported_members')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('claimed', false)
            .single()

        if (findError || !importedMember) {
            console.log('No unclaimed imported member found for:', email)
            return
        }

        // Update the profile with imported member data
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
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
                membership_status: 'pending', // They still need to upload documents
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Failed to update profile with imported data:', updateError)
            return
        }

        // Mark the imported member as claimed
        const { error: claimError } = await supabase
            .from('imported_members')
            .update({
                claimed: true,
                claimed_by: userId,
                claimed_at: new Date().toISOString()
            })
            .eq('id', importedMember.id)

        if (claimError) {
            console.error('Failed to mark imported member as claimed:', claimError)
        } else {
            console.log('Successfully linked imported member:', email, 'to user:', userId)
        }

    } catch (error) {
        console.error('Error linking imported member data:', error)
    }
}
