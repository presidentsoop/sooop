'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";

type ImportResult = {
    success: number;
    failed: number;
    errors: string[];
};

function parseExcelDate(serial: any): string | null {
    if (!serial) return null;
    // Excel serial date to JS Date
    if (typeof serial === 'number') {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return date_info.toISOString().split('T')[0];
    }
    // String date
    if (typeof serial === 'string') {
        const d = new Date(serial);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return null;
}

// Helper to fuzzy find a key in the row object
function findValue(row: any, candidates: string[]): any {
    const keys = Object.keys(row);
    for (const candidate of candidates) {
        const foundKey = keys.find(k => k.toLowerCase().includes(candidate.toLowerCase()));
        if (foundKey) return row[foundKey];
    }
    return undefined;
}

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

    // Safety Check: Verify Admin Access before processing
    try {
        const { error: adminCheck } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (adminCheck) {
            console.error("Admin Check Failed:", adminCheck);
            return {
                success: 0,
                failed: 0,
                errors: ["Admin Access Denied: Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to enable user import."]
            };
        }
    } catch (e) {
        return {
            success: 0,
            failed: 0,
            errors: ["Admin Access Check Failed: Please verify your Supabase keys."]
        };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
        const rowNum = index + 2; // Excel row number (1-based, + header)

        // Dynamic Field Mapping using Fuzzy Match
        const email = findValue(row, ['email', 'username', 'e-mail']);
        const name = findValue(row, ['name', 'full name']);

        if (!email || !name) {
            failed++;
            errors.push(`Row ${rowNum}: Missing Name or Email`);
            continue;
        }

        try {
            // 1. Create Auth User
            const tempPassword = `Sooop@${Math.floor(Math.random() * 9000) + 1000}`; // Random temp password
            let userId = '';

            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: name }
            });

            if (createError) {
                if (createError.message.includes("already registered") || createError.message.includes("unique constraint")) {
                    // Skip if user exists
                    failed++;
                    errors.push(`Row ${rowNum}: User ${email} already exists. Skipped.`);
                    continue;
                } else {
                    throw createError;
                }
            } else {
                userId = newUser.user.id;
            }

            // 2. Map Profile Data
            const rawType = findValue(row, ['membership', 'category']) || '';
            const normalizedType = String(rawType).toLowerCase();
            let type: any = 'member'; // Default to full member

            if (normalizedType.includes('student')) type = 'student';
            else if (normalizedType.includes('overseas')) type = 'overseas';
            else if (normalizedType.includes('associate')) type = 'associate';

            const profileData = {
                id: userId,
                email: email,
                full_name: name,
                father_name: findValue(row, ['father', 'husband']),
                cnic: findValue(row, ['cnic']),
                contact_number: findValue(row, ['contact', 'mobile', 'phone', 'whatsapp']),
                gender: findValue(row, ['gender', 'sex']),
                date_of_birth: parseExcelDate(findValue(row, ['birth', 'dob'])),
                blood_group: findValue(row, ['blood']),

                qualification: findValue(row, ['qualification', 'degree']),
                college_attended: findValue(row, ['college', 'university']),
                post_graduate_institution: findValue(row, ['post graduate', 'postgraduate', 'pg institution']),

                // Employment
                employment_status: findValue(row, ['employment', 'status']),
                designation: findValue(row, ['designation', 'job title']),
                institution: findValue(row, ['institution', 'clinic', 'hospital', 'work']),

                // Address
                city: findValue(row, ['city', 'district', 'town']),
                province: findValue(row, ['province', 'state']),
                residential_address: findValue(row, ['residential', 'address', 'location']),

                membership_type: type,
                membership_status: 'active', // Auto-approve imported users
                role: type === 'student' ? 'student' : 'member',

                created_at: new Date().toISOString()
            };

            // 3. Upsert Profile
            const { error: profileError } = await supabase.from('profiles').upsert(profileData);

            if (profileError) {
                // Ideally we would rollback auth user creation here, but for bulk import simple error logging is safer
                throw new Error("Profile creation failed: " + profileError.message);
            }

            success++;

        } catch (err: any) {
            failed++;
            errors.push(`Row ${rowNum} (${email}): ${err.message}`);
        }
    }

    revalidatePath('/dashboard/members');
    return { success, failed, errors };
}
