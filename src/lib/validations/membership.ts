import { z } from "zod";

export const membershipSchema = z.object({
    // Personal Information
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    fatherName: z.string().min(2, "Father's Name is required"),
    cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "Invalid CNIC format (e.g., 35202-1234567-8)"),
    contactNumber: z.string().min(10, "Invalid contact number"),
    gender: z.enum(["Male", "Female", "Other"]),
    dob: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid date required" }),
    bloodGroup: z.string().optional(),
    residentialAddress: z.string().min(10, "Full address is required"),

    // Membership Details
    membershipType: z.enum(["Full", "Overseas", "Associate", "Student"]),
    isRenewal: z.boolean().default(false),

    // Academic Information
    qualification: z.string().min(1, "Qualification is required"), // Dropdown in UI
    otherQualification: z.string().optional(),
    postGraduateDegrees: z.array(z.string()).optional(), // Handled as array of strings
    hasRelevantPg: z.boolean().optional(), // Checkbox logic
    hasNonRelevantPg: z.boolean().optional(),

    collegeAttended: z.string().min(2, "College name is required"),
    postGraduateInstitution: z.string().optional(),

    // Employment Information
    employmentStatus: z.enum([
        "Full Time Practitioner (Optical)",
        "Part Time Practitioner (Optical)",
        "Academia",
        "Govt Employee",
        "Private Hospital (Part Time)",
        "Private Hospital + Part Time Optical",
        "Private Hospital (Full Time)",
        "Unemployed",
        "Student"
    ]),
    designation: z.string().optional(),
    employmentCity: z.string().min(2, "City is required"),
    province: z.enum([
        "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir", "International"
    ]),

    // Payment Information
    transactionId: z.string().optional(), // Made optional for initial submit if just uploading receipt

    // File Uploads
    photoUrl: z.string().optional(),
    cnicFrontUrl: z.string().optional(),
    cnicBackUrl: z.string().optional(),
    transcriptFrontUrl: z.string().optional(),
    transcriptBackUrl: z.string().optional(),
    studentIdUrl: z.string().optional(),
    receiptUrl: z.string().optional(),
    renewalCardUrl: z.string().optional(),
});

export type MembershipFormData = z.infer<typeof membershipSchema>;
