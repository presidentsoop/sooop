'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";

type ImportResult = {
    success: number;
    failed: number;
    skipped: number;
    total: number;
    errors: string[];
};

// Robust date parser for various Excel formats
function parseExcelDate(value: any): string | null {
    if (!value) return null;

    // 1. JS Date object
    if (value instanceof Date) return value.toISOString();

    // 2. Excel Serial Number
    if (typeof value === 'number') {
        const utc_days = Math.floor(value - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return date_info.toISOString();
    }

    // 3. String formats
    if (typeof value === 'string') {
        // Try standard Date parse
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toISOString();

        // Try DD/MM/YYYY or similar manual parsing if needed
        // For now standard parser handles "2025/08/04..." well
    }
    return null;
}

// Precise finder that prioritizes exact matches but allows robust fallbacks
function getValue(row: any, keyMap: string[]): any {
    const rowKeys = Object.keys(row);
    // 1. Exact match
    for (const key of keyMap) {
        if (row[key] !== undefined) return row[key];
    }
    // 2. Case-insensitive match
    for (const key of keyMap) {
        const found = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
        if (found) return row[found];
    }
    // 3. Partial match (Careful with short keys)
    for (const key of keyMap) {
        // Avoid matching "Address" with "Email Address"
        if (key === 'Address' || key === 'Name') continue;

        const found = rowKeys.find(k => k.toLowerCase().includes(key.toLowerCase()));
        if (found) return row[found];
    }
    // 4. Special Handling for "Address"
    if (keyMap.includes('Residential Address')) {
        const found = rowKeys.find(k => k.toLowerCase().includes('residential') && k.toLowerCase().includes('address'));
        if (found) return row[found];
    }

    return undefined;
}

export async function importUsersAction(formData: FormData): Promise<ImportResult> {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: 0, failed: 0, skipped: 0, total: 0, errors: ["No file uploaded."] };
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0]; // Assume first sheet
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    if (rows.length === 0) {
        return { success: 0, failed: 0, skipped: 0, total: 0, errors: ["The Excel file is empty."] };
    }

    const supabase = createAdminClient();

    // Check Admin Priveleges
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById('00000000-0000-0000-0000-000000000000'); // Dummy call to check client validity
    // Actually just proceed, execute will fail if keys are wrong.

    let success = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Pre-fetch all emails to minimize API calls (Optimization)
    // For very large datasets, pagination/batches is better, but for <5000 rows this is faster.
    const { data: existingProfiles } = await supabase.from('profiles').select('email').not('email', 'is', null);
    const existingEmails = new Set(existingProfiles?.map(p => p.email?.toLowerCase()) || []);

    for (const [index, row] of rows.entries()) {
        const rowIndex = index + 2; // +2 for Header row and 0-index

        // 1. Extract Critical Fields
        const email = getValue(row, ['Email Address', 'Email', 'e-mail'])?.toString()?.trim()?.toLowerCase();
        const cnic = getValue(row, ['CNIC #', 'CNIC', 'cnic'])?.toString()?.trim();
        const fullName = getValue(row, ['Name', 'Full Name', 'Member Name'])?.toString()?.trim();

        if (!email || !fullName) {
            failed++;
            errors.push(`Row ${rowIndex}: Missing Name or Email.`);
            continue;
        }

        // 2. Check Duplication (Resume Capability)
        if (existingEmails.has(email)) {
            skipped++;
            // We silently skip to allow "Resume" without noise
            continue;
        }

        try {
            // 3. Create Auth User
            // We use a random temp password. In production, we might trigger a reset email.
            const tempPassword = `Sooop@${Math.floor(1000 + Math.random() * 9000)}`;

            const { data: authData, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: fullName, cnic: cnic }
            });

            if (createError) {
                // If auth user exists but profile didn't (rare edge case since we checked profiles),
                // we treat it as skipped or failed.
                if (createError.message.includes("already registered")) {
                    skipped++;
                    existingEmails.add(email); // Add to set to prevent retrying duplicates in same file
                    continue;
                }
                throw createError;
            }

            const userId = authData.user.id;

            // 4. Map Profile Data
            const timestamp = getValue(row, ['Timestamp', 'Date']);
            const createdAt = parseExcelDate(timestamp) || new Date().toISOString();

            // Gender parsing
            const rawGender = getValue(row, ['Gender', 'Sex'])?.toString();
            let gender = rawGender;
            if (rawGender?.toLowerCase().startsWith('m')) gender = 'Male';
            if (rawGender?.toLowerCase().startsWith('f')) gender = 'Female';

            // Membership Type
            const rawType = getValue(row, ['Membership Type', 'Type'])?.toString()?.toLowerCase() || '';
            let role = 'member';
            let membershipType = 'Full Member';
            if (rawType.includes('student')) { role = 'student'; membershipType = 'Student Member'; }
            if (rawType.includes('associate')) membershipType = 'Associate Member';
            if (rawType.includes('life')) membershipType = 'Life Member';

            const profileData = {
                id: userId,
                email: email,
                full_name: fullName,
                cnic: cnic,
                father_name: getValue(row, ['Father Name', 'Father/Husband Name']),
                contact_number: getValue(row, ['WhatsApp Number', 'Mobile', 'Phone']),
                gender: gender,
                date_of_birth: parseExcelDate(getValue(row, ['Date of Birth', 'DOB'])),
                blood_group: getValue(row, ['Blood Group']),

                qualification: getValue(row, ['Qualification']),
                institution: getValue(row, ['Institution']),
                designation: getValue(row, ['If you are employeed, Mention your designation.', 'Designation']),
                employment_status: getValue(row, ['Employement Status', 'Employment Status']),

                city: getValue(row, ['Employement City', 'City']),
                province: getValue(row, ['Province']),
                residential_address: getValue(row, ['Residential Address', 'Residential Address:', 'Address']),

                role: role,
                membership_type: membershipType,
                membership_status: 'approved', // Auto-approve imported users (or 'pending'?)
                // User voice note implies importing existing members, so 'approved' or 'active' is safer.
                // Setting to 'approved' allows Admin to activate them properly or 'active' for immediate access.
                // Defaulting to 'active' for 1 year from now.
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),

                created_at: createdAt
            };

            // 5. Upsert Profile
            const { error: profileError } = await supabase.from('profiles').upsert(profileData);

            if (profileError) {
                // Critical: Auth created, Profile failed.
                // We attempt to delete the auth user to keep state clean (transaction-like rollback)
                await supabase.auth.admin.deleteUser(userId);
                throw new Error(`Profile creation failed: ${profileError.message}`);
            }

            success++;
            existingEmails.add(email); // Prevent duplicates

        } catch (err: any) {
            failed++;
            errors.push(`Row ${rowIndex} (${email}): ${err.message}`);
        }
    }

    revalidatePath('/dashboard/members');
    return { success, failed, skipped, total: rows.length, errors };
}
