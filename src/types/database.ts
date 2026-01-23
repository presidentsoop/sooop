export type Profile = {
    id: string;
    email: string;
    full_name: string;
    father_name?: string;
    cnic: string;
    contact_number: string;
    gender?: 'Male' | 'Female' | 'Other';
    date_of_birth?: string;
    blood_group?: string;
    residential_address?: string;
    profile_photo_url?: string;

    // Education & Work
    qualification?: string;
    college_attended?: string;
    post_graduate_institution?: string;
    has_relevant_pg?: boolean;
    has_non_relevant_pg?: boolean;
    other_qualification?: string;
    employment_status?: string;
    designation?: string;
    city?: string;
    province?: string;
    institution?: string;
    current_status?: string;

    // Membership
    membership_type?: 'Full' | 'Overseas' | 'Associate' | 'Student';
    membership_status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
    membership_number?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;

    // Access
    role: 'member' | 'admin' | 'super_admin';
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Document = {
    id: string;
    user_id: string;
    document_type: 'cnic_front' | 'cnic_back' | 'transcript_front' | 'transcript_back' | 'student_id' | 'renewal_card' | 'profile_photo' | 'payment_proof' | 'other';
    file_url: string;
    verified: boolean;
    verified_by?: string;
    verified_at?: string;
    uploaded_at: string;
};

export type Payment = {
    id: string;
    user_id: string;
    transaction_id?: string;
    payment_mode?: string;
    amount: number;
    currency: string;
    receipt_url?: string;
    status: 'pending' | 'verified' | 'rejected';
    period_start?: string;
    period_end?: string;
    verified_by?: string;
    verified_at?: string;
    rejection_reason?: string;
    created_at: string;
};

export type AuditLog = {
    id: string;
    action: string;
    performed_by?: string;
    target_user_id?: string;
    details?: any;
    ip_address?: string;
    created_at: string;
};

export type EmailCampaign = {
    id: string;
    subject: string;
    body: string;
    recipient_filter: string;
    sent_by?: string;
    sent_count: number;
    status: 'draft' | 'sending' | 'sent' | 'failed';
    created_at: string;
    sent_at?: string;
};
