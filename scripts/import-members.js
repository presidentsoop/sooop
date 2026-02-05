/**
 * SOOOP Legacy Member Import Script
 * =================================
 * This script imports members from the Excel file (SOOOP.xlsx) into the 
 * imported_members table. These members can then claim their accounts
 * via the "Activate Existing Membership" flow.
 * 
 * Usage: node scripts/import-members.js
 * 
 * What this script does:
 * 1. Reads the Excel file (SOOOP.xlsx)
 * 2. Parses and validates each row
 * 3. Fixes CNIC scientific notation issues
 * 4. Normalizes date formats
 * 5. Calculates subscription end dates (start + 1 year)
 * 6. Inserts into imported_members table
 * 7. Generates a detailed report
 */

const XLSX = require('xlsx');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials. Check .env.local file.');
    process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Excel column mapping (based on SOOOP.xlsx headers)
const COLUMN_MAP = {
    0: 'timestamp',           // Subscription start date
    1: 'email',               // Username (email)
    2: 'full_name',           // Name
    3: 'father_name',         // Father's Name
    4: 'cnic',                // CNIC Number
    5: 'contact_number',      // Contact Number
    6: 'membership_type',     // Membership type (Full, Student, etc.)
    7: 'renewal_card_url',    // Skip - Google Drive link
    8: 'gender',              // Gender
    9: 'date_of_birth',       // Date of Birth
    10: 'qualification',      // Qualification
    11: 'has_relevant_pg',    // Relevant PG degree
    12: 'has_non_relevant_pg', // Non-relevant PG degree
    13: 'college_attended',   // College Attended
    14: 'post_graduate_institution', // Postgraduate Institution
    15: 'employment_status',  // Employment Status
    16: 'designation',        // Designation
    17: 'city',               // Employment City
    18: 'province',           // Province
    19: 'photo_url',          // Skip - Google Drive link
    20: 'residential_address', // Residential Address
    21: 'cnic_front_url',     // Skip - Google Drive link
    22: 'cnic_back_url',      // Skip - Google Drive link
    23: 'transcript_front_url', // Skip - Google Drive link
    24: 'transcript_back_url', // Skip - Google Drive link
    25: 'student_id_url',     // Skip - Google Drive link
    26: 'blood_group',        // Blood Group
    27: 'transaction_id',     // Transaction ID
    28: 'receipt_url',        // Skip - Google Drive link
};

// Fields to skip (Google Drive links that can't be imported)
const SKIP_FIELDS = [
    'renewal_card_url', 'photo_url', 'cnic_front_url', 'cnic_back_url',
    'transcript_front_url', 'transcript_back_url', 'student_id_url', 'receipt_url'
];

/**
 * Fix CNIC that was converted to scientific notation in Excel
 * Example: 3.52014E+12 -> 35201400000000 -> 35201-4000000-0
 */
function fixCNIC(cnic) {
    if (!cnic) return null;

    let cnicStr = String(cnic).trim();

    // If it's a scientific notation number
    if (cnicStr.includes('E') || cnicStr.includes('e')) {
        const num = parseFloat(cnicStr);
        cnicStr = num.toFixed(0);
    }

    // Remove all non-digit characters
    const digitsOnly = cnicStr.replace(/\D/g, '');

    // If we have 13 digits, format as XXXXX-XXXXXXX-X
    if (digitsOnly.length === 13) {
        return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
    }

    // Return as-is if already formatted or can't be fixed
    return cnicStr;
}

/**
 * Normalize contact number
 * Handles: 3259129090, 0305 4337799, 0308-6214848
 */
function normalizePhone(phone) {
    if (!phone) return null;

    let phoneStr = String(phone).trim();

    // Handle scientific notation
    if (phoneStr.includes('E') || phoneStr.includes('e')) {
        const num = parseFloat(phoneStr);
        phoneStr = num.toFixed(0);
    }

    // Remove all non-digit characters
    const digitsOnly = phoneStr.replace(/\D/g, '');

    // If starts with 92, remove it
    if (digitsOnly.startsWith('92') && digitsOnly.length > 10) {
        return digitsOnly.slice(2);
    }

    // Add leading 0 if missing
    if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
        return '0' + digitsOnly;
    }

    return digitsOnly || phoneStr;
}

/**
 * Parse various date formats from Excel
 * Handles: 4/4/2003, 20-Apr-05, June 28,2002, 10 01 2004, Excel serial numbers
 */
function parseDate(dateValue) {
    if (!dateValue) return null;

    // Handle Excel serial date numbers
    if (typeof dateValue === 'number') {
        // Excel dates are days since 1900-01-01
        const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
        const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
        return date.toISOString().split('T')[0];
    }

    const dateStr = String(dateValue).trim();

    // Try various formats
    const formats = [
        // 4/4/2003 or 12/13/2025
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // 20-Apr-05 or 17-Aug-02
        /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/,
        // June 28,2002
        /^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/,
        // 10 01 2004
        /^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/,
        // 31.08.2003
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    ];

    const months = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    // Try MM/DD/YYYY format
    let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Try DD-Mon-YY format
    match = dateStr.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
    if (match) {
        const day = parseInt(match[1]);
        const monthStr = match[2].toLowerCase();
        let year = parseInt(match[3]);
        year = year > 50 ? 1900 + year : 2000 + year;
        const month = months[monthStr] || 1;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Try "June 28,2002" format
    match = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
    if (match) {
        const monthStr = match[1].toLowerCase();
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        const month = months[monthStr] || 1;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Try DD.MM.YYYY format
    match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Try to parse directly
    try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
    } catch (e) {
        // Failed to parse
    }

    console.warn(`⚠️ Could not parse date: "${dateStr}"`);
    return null;
}

/**
 * Parse timestamp to get subscription start date
 * Format: 2025/08/22 11:06:30 PM GMT+5
 */
function parseTimestamp(timestamp) {
    if (!timestamp) return null;

    const tsStr = String(timestamp).trim();

    // Try to parse the format: YYYY/MM/DD HH:MM:SS AM/PM GMT+X
    const match = tsStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        return new Date(year, month - 1, day);
    }

    try {
        return new Date(tsStr);
    } catch (e) {
        return new Date();
    }
}

/**
 * Normalize blood group values
 * Handles: O+, O positive, O+ve, B-Negative, etc.
 */
function normalizeBloodGroup(bg) {
    if (!bg) return null;

    const bgStr = String(bg).toLowerCase().trim();

    // Map of variations
    const mappings = {
        'o+': 'O+', 'o positive': 'O+', 'o+ve': 'O+', 'o +': 'O+', 'o pos': 'O+',
        'o-': 'O-', 'o negative': 'O-', 'o-ve': 'O-', 'o -': 'O-', 'o neg': 'O-',
        'a+': 'A+', 'a positive': 'A+', 'a+ve': 'A+', 'a +': 'A+', 'a pos': 'A+',
        'a-': 'A-', 'a negative': 'A-', 'a-ve': 'A-', 'a -': 'A-', 'a neg': 'A-',
        'b+': 'B+', 'b positive': 'B+', 'b+ve': 'B+', 'b +': 'B+', 'b pos': 'B+',
        'b-': 'B-', 'b negative': 'B-', 'b-ve': 'B-', 'b -': 'B-', 'b neg': 'B-',
        'ab+': 'AB+', 'ab positive': 'AB+', 'ab+ve': 'AB+', 'ab +': 'AB+', 'ab pos': 'AB+',
        'ab-': 'AB-', 'ab negative': 'AB-', 'ab-ve': 'AB-', 'ab -': 'AB-', 'ab neg': 'AB-',
    };

    // Look for matches
    for (const [key, value] of Object.entries(mappings)) {
        if (bgStr.includes(key) || bgStr === key) {
            return value;
        }
    }

    // Return cleaned up version if no match
    return bg.toUpperCase().trim();
}

/**
 * Extract membership type from the complex Excel value
 */
function extractMembershipType(value) {
    if (!value) return 'Student';

    const valStr = String(value).toLowerCase();

    if (valStr.includes('full member')) return 'Full';
    if (valStr.includes('overseas')) return 'Overseas';
    if (valStr.includes('associate')) return 'Associate';
    if (valStr.includes('student')) return 'Student';
    if (valStr.includes('renewal')) return 'Renewal';

    return 'Student'; // Default
}

/**
 * Transform a raw Excel row into an importable member record
 */
function transformRow(row, rowIndex) {
    // Skip empty rows
    if (!row || row.length < 3) return null;

    const email = row[1] ? String(row[1]).trim().toLowerCase() : null;
    const fullName = row[2] ? String(row[2]).trim() : null;

    // Email is required
    if (!email || !email.includes('@')) {
        console.warn(`⚠️ Row ${rowIndex + 2}: Invalid or missing email, skipping`);
        return null;
    }

    // Name is required
    if (!fullName) {
        console.warn(`⚠️ Row ${rowIndex + 2}: Missing name for ${email}, skipping`);
        return null;
    }

    // Parse subscription dates from timestamp
    const startDate = parseTimestamp(row[0]);
    const endDate = startDate ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;

    // Check for relevant PG degrees
    const hasRelevantPG = row[11] ? String(row[11]).toLowerCase().includes('mphil') ||
        String(row[11]).toLowerCase().includes('phd') ||
        String(row[11]).toLowerCase().includes('pgd') : false;
    const hasNonRelevantPG = row[12] ? String(row[12]).trim().length > 0 &&
        String(row[12]).toLowerCase() !== 'nil' &&
        String(row[12]).toLowerCase() !== 'no' : false;

    return {
        email: email,
        full_name: fullName,
        father_name: row[3] ? String(row[3]).trim() : null,
        cnic: fixCNIC(row[4]),
        contact_number: normalizePhone(row[5]),
        membership_type: extractMembershipType(row[6]),
        gender: row[8] ? String(row[8]).trim() : null,
        date_of_birth: parseDate(row[9]),
        blood_group: normalizeBloodGroup(row[26]),
        qualification: row[10] ? String(row[10]).trim() : null,
        has_relevant_pg: hasRelevantPG,
        has_non_relevant_pg: hasNonRelevantPG,
        college_attended: row[13] ? String(row[13]).trim() : null,
        post_graduate_institution: row[14] ? String(row[14]).trim() : null,
        employment_status: row[15] ? String(row[15]).trim() : null,
        designation: row[16] ? String(row[16]).trim() : null,
        city: row[17] ? String(row[17]).trim() : null,
        province: row[18] ? String(row[18]).trim() : null,
        residential_address: row[20] ? String(row[20]).trim() : null,
        subscription_start_date: startDate ? startDate.toISOString() : null,
        subscription_end_date: endDate ? endDate.toISOString() : null,
        transaction_id: row[27] ? String(row[27]).trim() : null,
        raw_data: { row_index: rowIndex + 2, original: row }
    };
}

/**
 * Main import function
 */
async function importMembers() {
    console.log('='.repeat(60));
    console.log('SOOOP LEGACY MEMBER IMPORT');
    console.log('='.repeat(60));
    console.log('');

    // Read Excel file
    const filePath = path.resolve(__dirname, '../SOOOP.xlsx');
    console.log(`📁 Reading: ${filePath}`);

    let workbook;
    try {
        workbook = XLSX.readFile(filePath);
    } catch (e) {
        console.error(`❌ Failed to read Excel file: ${e.message}`);
        process.exit(1);
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`📊 Found ${data.length - 1} rows (excluding header)`);
    console.log('');

    // Transform rows (skip header)
    const members = [];
    const errors = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const member = transformRow(row, i);

        if (member) {
            members.push(member);
        } else {
            errors.push({ row: i + 1, reason: 'Invalid or incomplete data' });
        }
    }

    console.log(`✅ Valid records: ${members.length}`);
    console.log(`⚠️ Skipped records: ${errors.length}`);
    console.log('');

    // Check for existing emails in imported_members
    console.log('🔍 Checking for duplicates...');
    const { data: existing, error: checkError } = await supabase
        .from('imported_members')
        .select('email');

    if (checkError) {
        console.error(`❌ Failed to check existing records: ${checkError.message}`);
        process.exit(1);
    }

    const existingEmails = new Set((existing || []).map(e => e.email.toLowerCase()));

    // Also check profiles table for already registered users
    const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('email');

    if (profileError) {
        console.error(`❌ Failed to check profiles: ${profileError.message}`);
        process.exit(1);
    }

    const profileEmails = new Set((existingProfiles || []).map(p => p.email?.toLowerCase()).filter(Boolean));

    // Filter out duplicates
    const newMembers = members.filter(m => {
        if (existingEmails.has(m.email.toLowerCase())) {
            errors.push({ row: 'N/A', reason: `Already imported: ${m.email}` });
            return false;
        }
        if (profileEmails.has(m.email.toLowerCase())) {
            errors.push({ row: 'N/A', reason: `Already has account: ${m.email}` });
            return false;
        }
        return true;
    });

    console.log(`📝 New records to import: ${newMembers.length}`);
    console.log('');

    if (newMembers.length === 0) {
        console.log('ℹ️ No new records to import.');
        return;
    }

    // Insert in batches
    console.log('📥 Importing records...');
    const BATCH_SIZE = 50;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < newMembers.length; i += BATCH_SIZE) {
        const batch = newMembers.slice(i, i + BATCH_SIZE);

        const { data: inserted, error: insertError } = await supabase
            .from('imported_members')
            .insert(batch)
            .select();

        if (insertError) {
            console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${insertError.message}`);
            failed += batch.length;
        } else {
            imported += batch.length;
            console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records`);
        }
    }

    // Final report
    console.log('');
    console.log('='.repeat(60));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Skipped: ${errors.length}`);
    console.log('');

    if (errors.length > 0) {
        console.log('Skipped reasons:');
        const reasons = {};
        errors.forEach(e => {
            reasons[e.reason] = (reasons[e.reason] || 0) + 1;
        });
        Object.entries(reasons).forEach(([reason, count]) => {
            console.log(`   - ${reason}: ${count}`);
        });
    }

    console.log('');
    console.log('✅ Import complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Members can visit /login and click "Activate Existing Membership"');
    console.log('2. Enter their registered email');
    console.log('3. Receive activation email and set password');
    console.log('4. Upload documents and wait for admin verification');
}

// Run the import
importMembers().catch(console.error);
