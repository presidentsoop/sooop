'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";

type ImportResult = {
    success: number;
    failed: number;
    errors: string[];
};

export async function importUsersAction(formData: FormData): Promise<ImportResult> {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: 0, failed: 0, errors: ["No file provided"] };
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    const supabase = createAdminClient();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
        const rowNum = index + 2; // Excel row number (1-based, + header)
        const email = row['Username']; // Email field
        const name = row['Name'];

        if (!email || !name) {
            failed++;
            errors.push(`Row ${rowNum}: Missing Name or Email (Username)`);
            continue;
        }

        try {
            // 1. Create Auth User
            // Check if exists first? createUser throws if exists.
            let userId = '';

            // Try to fetch by email first to avoid error if re-running
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            // Note: listUsers is paginated, but for 200 users it's fine. For scaling, use search?
            // Better: just try create and catch error.

            const tempPassword = `Sooop@${Math.floor(Math.random() * 9000) + 1000}`; // Random temp password

            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: name }
            });

            if (createError) {
                // If user exists, we might want to update profile? 
                // For now, treat as existing.
                if (createError.message.includes("already registered")) {
                    // Fetch existing ID?
                    // Skipping for safety to not overwrite auth.
                    failed++;
                    errors.push(`Row ${rowNum}: User ${email} already exists.`);
                    continue;
                } else {
                    throw createError;
                }
            }

            userId = newUser.user.id;

            // 2. Map Profile Data
            // Membership Type Mapping
            let type: any = 'Full';
            const rawType = row['Membership\r\n\r\n☐ Full (Fee Rs.1500)     ☐ Overseas (Fee: Rs.3000)        ☐ Associate (Fee Rs.500) ☐ Student (Fee Rs.1000) '] || '';
            if (rawType.includes('Student')) type = 'Student';
            else if (rawType.includes('overseas') || rawType.includes('Overseas')) type = 'Overseas';
            else if (rawType.includes('Associate')) type = 'Associate';

            // Dates
            // Excel dates are weird. If integer, convert. 
            // Assuming string for simplicity or parse.

            const profileData = {
                id: userId,
                email: email,
                full_name: name,
                father_name: row["Father's Name"],
                cnic: row["CNIC Number"],
                contact_number: row["Contact Number"],
                gender: row["Gender"],
                // date_of_birth: row["Date of Birth"], // Needs verify format
                qualification: row["Qualification"],
                city: row["Employement City"],
                province: row["Province"],
                designation: row["If you are employeed, Mention your designation. "],
                institution: row["Postgraduate Institution"] || row["College Attended for Graduation"],
                membership_type: type,
                membership_status: 'approved', // Auto-approve imported users
                role: 'member'
            };

            // 3. Insert Profile
            const { error: profileError } = await supabase.from('profiles').upsert(profileData);

            if (profileError) {
                // If profile fails, do we delete auth? Ideally yes.
                await supabase.auth.admin.deleteUser(userId);
                throw profileError;
            }

            // 4. Record Payment (Optional - if needed)
            // Access "Fee Receipt/ Transaction Screenshot" column?

            success++;

        } catch (err: any) {
            failed++;
            errors.push(`Row ${rowNum} (${email}): ${err.message}`);
        }
    }

    revalidatePath('/dashboard/members');
    return { success, failed, errors };
}
