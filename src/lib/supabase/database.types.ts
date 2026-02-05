export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string
                    created_at: string | null
                    details: Json | null
                    id: string
                    ip_address: string | null
                    performed_by: string | null
                    target_user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    ip_address?: string | null
                    performed_by?: string | null
                    target_user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    ip_address?: string | null
                    performed_by?: string | null
                    target_user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "audit_logs_performed_by_fkey"
                        columns: ["performed_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "audit_logs_target_user_id_fkey"
                        columns: ["target_user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            documents: {
                Row: {
                    document_type: string | null
                    file_url: string | null
                    id: string
                    uploaded_at: string | null
                    user_id: string
                }
                Insert: {
                    document_type?: string | null
                    file_url?: string | null
                    id?: string
                    uploaded_at?: string | null
                    user_id: string
                }
                Update: {
                    document_type?: string | null
                    file_url?: string | null
                    id?: string
                    uploaded_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "documents_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            email_campaigns: {
                Row: {
                    body: string
                    created_at: string | null
                    id: string
                    recipient_filter: string | null
                    sent_at: string | null
                    sent_by: string | null
                    sent_count: number | null
                    status: string | null
                    subject: string
                }
                Insert: {
                    body: string
                    created_at?: string | null
                    id?: string
                    recipient_filter?: string | null
                    sent_at?: string | null
                    sent_by?: string | null
                    sent_count?: number | null
                    status?: string | null
                    subject: string
                }
                Update: {
                    body?: string
                    created_at?: string | null
                    id?: string
                    recipient_filter?: string | null
                    sent_at?: string | null
                    sent_by?: string | null
                    sent_count?: number | null
                    status?: string | null
                    subject?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "email_campaigns_sent_by_fkey"
                        columns: ["sent_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            events: {
                Row: {
                    created_at: string | null
                    description: string | null
                    end_date: string | null
                    id: string
                    image_url: string | null
                    is_featured: boolean | null
                    location: string | null
                    start_date: string
                    status: string | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    location?: string | null
                    start_date: string
                    status?: string | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    location?: string | null
                    start_date?: string
                    status?: string | null
                    title?: string
                }
                Relationships: []
            }
            leadership_history: {
                Row: {
                    bio: string | null
                    category: string
                    created_at: string | null
                    end_year: number | null
                    id: string
                    image_url: string | null
                    name: string
                    role: string
                    start_year: number | null
                    wing_id: string | null
                }
                Insert: {
                    bio?: string | null
                    category: string
                    created_at?: string | null
                    end_year?: number | null
                    id?: string
                    image_url?: string | null
                    name: string
                    role: string
                    start_year?: number | null
                    wing_id?: string | null
                }
                Update: {
                    bio?: string | null
                    category?: string
                    created_at?: string | null
                    end_year?: number | null
                    id?: string
                    image_url?: string | null
                    name?: string
                    role?: string
                    start_year?: number | null
                    wing_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "leadership_history_wing_id_fkey"
                        columns: ["wing_id"]
                        isOneToOne: false
                        referencedRelation: "wings"
                        referencedColumns: ["id"]
                    },
                ]
            }
            imported_members: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    father_name: string | null
                    cnic: string | null
                    contact_number: string | null
                    membership_type: string | null
                    gender: string | null
                    date_of_birth: string | null
                    blood_group: string | null
                    qualification: string | null
                    has_relevant_pg: boolean | null
                    has_non_relevant_pg: boolean | null
                    college_attended: string | null
                    post_graduate_institution: string | null
                    employment_status: string | null
                    designation: string | null
                    city: string | null
                    province: string | null
                    residential_address: string | null
                    subscription_start_date: string | null
                    subscription_end_date: string | null
                    transaction_id: string | null
                    imported_at: string | null
                    claimed: boolean | null
                    claimed_by: string | null
                    claimed_at: string | null
                    invite_sent: boolean | null
                    invite_sent_at: string | null
                    raw_data: Json | null
                }
                Insert: {
                    id?: string
                    email: string
                    full_name: string
                    father_name?: string | null
                    cnic?: string | null
                    contact_number?: string | null
                    membership_type?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    blood_group?: string | null
                    qualification?: string | null
                    has_relevant_pg?: boolean | null
                    has_non_relevant_pg?: boolean | null
                    college_attended?: string | null
                    post_graduate_institution?: string | null
                    employment_status?: string | null
                    designation?: string | null
                    city?: string | null
                    province?: string | null
                    residential_address?: string | null
                    subscription_start_date?: string | null
                    subscription_end_date?: string | null
                    transaction_id?: string | null
                    imported_at?: string | null
                    claimed?: boolean | null
                    claimed_by?: string | null
                    claimed_at?: string | null
                    invite_sent?: boolean | null
                    invite_sent_at?: string | null
                    raw_data?: Json | null
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    father_name?: string | null
                    cnic?: string | null
                    contact_number?: string | null
                    membership_type?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    blood_group?: string | null
                    qualification?: string | null
                    has_relevant_pg?: boolean | null
                    has_non_relevant_pg?: boolean | null
                    college_attended?: string | null
                    post_graduate_institution?: string | null
                    employment_status?: string | null
                    designation?: string | null
                    city?: string | null
                    province?: string | null
                    residential_address?: string | null
                    subscription_start_date?: string | null
                    subscription_end_date?: string | null
                    transaction_id?: string | null
                    imported_at?: string | null
                    claimed?: boolean | null
                    claimed_by?: string | null
                    claimed_at?: string | null
                    invite_sent?: boolean | null
                    invite_sent_at?: string | null
                    raw_data?: Json | null
                }
                Relationships: []
            }
            membership_applications: {
                Row: {
                    id: string
                    is_renewal: boolean | null
                    membership_type: string
                    rejection_reason: string | null
                    renewal_card_url: string | null
                    reviewed_at: string | null
                    reviewed_by: string | null
                    status: string | null
                    student_id_url: string | null
                    submitted_at: string | null
                    transcript_back_url: string | null
                    transcript_front_url: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    is_renewal?: boolean | null
                    membership_type: string
                    rejection_reason?: string | null
                    renewal_card_url?: string | null
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    status?: string | null
                    student_id_url?: string | null
                    submitted_at?: string | null
                    transcript_back_url?: string | null
                    transcript_front_url?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    is_renewal?: boolean | null
                    membership_type?: string
                    rejection_reason?: string | null
                    renewal_card_url?: string | null
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    status?: string | null
                    student_id_url?: string | null
                    submitted_at?: string | null
                    transcript_back_url?: string | null
                    transcript_front_url?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "membership_applications_reviewed_by_fkey"
                        columns: ["reviewed_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "membership_applications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            nomination_fees: {
                Row: {
                    fee: string
                    id: string
                    position: string
                    sort_order: number | null
                }
                Insert: {
                    fee: string
                    id?: string
                    position: string
                    sort_order?: number | null
                }
                Update: {
                    fee?: string
                    id?: string
                    position?: string
                    sort_order?: number | null
                }
                Relationships: []
            }
            pages: {
                Row: {
                    content: Json | null
                    id: string
                    slug: string
                    title: string
                    updated_at: string | null
                    updated_by: string | null
                }
                Insert: {
                    content?: Json | null
                    id?: string
                    slug: string
                    title: string
                    updated_at?: string | null
                    updated_by?: string | null
                }
                Update: {
                    content?: Json | null
                    id?: string
                    slug?: string
                    title?: string
                    updated_at?: string | null
                    updated_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pages_updated_by_fkey"
                        columns: ["updated_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            payments: {
                Row: {
                    amount: number
                    application_id: string | null
                    created_at: string | null
                    id: string
                    payment_mode: string | null
                    receipt_url: string | null
                    rejection_reason: string | null
                    status: string | null
                    transaction_id: string | null
                    user_id: string
                    verified_at: string | null
                    verified_by: string | null
                }
                Insert: {
                    amount: number
                    application_id?: string | null
                    created_at?: string | null
                    id?: string
                    payment_mode?: string | null
                    receipt_url?: string | null
                    rejection_reason?: string | null
                    status?: string | null
                    transaction_id?: string | null
                    user_id: string
                    verified_at?: string | null
                    verified_by?: string | null
                }
                Update: {
                    amount?: number
                    application_id?: string | null
                    created_at?: string | null
                    id?: string
                    payment_mode?: string | null
                    receipt_url?: string | null
                    rejection_reason?: string | null
                    status?: string | null
                    transaction_id?: string | null
                    user_id?: string
                    verified_at?: string | null
                    verified_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_application_id_fkey"
                        columns: ["application_id"]
                        isOneToOne: false
                        referencedRelation: "membership_applications"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_verified_by_fkey"
                        columns: ["verified_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    blood_group: string | null
                    city: string | null
                    cnic: string
                    college_attended: string | null
                    contact_number: string
                    created_at: string | null
                    current_status: string | null
                    date_of_birth: string | null
                    designation: string | null
                    email: string
                    employment_status: string | null
                    father_name: string | null
                    full_name: string
                    gender: string | null
                    has_non_relevant_pg: boolean | null
                    has_relevant_pg: boolean | null
                    id: string
                    institution: string | null
                    is_active: boolean | null
                    membership_status: string | null
                    membership_type: string | null
                    other_qualification: string | null
                    post_graduate_institution: string | null
                    profile_photo_url: string | null
                    province: string | null
                    qualification: string | null
                    residential_address: string | null
                    role: string | null
                    subscription_end_date: string | null
                    subscription_start_date: string | null
                    updated_at: string | null
                }
                Insert: {
                    blood_group?: string | null
                    city?: string | null
                    cnic: string
                    college_attended?: string | null
                    contact_number: string
                    created_at?: string | null
                    current_status?: string | null
                    date_of_birth?: string | null
                    designation?: string | null
                    email: string
                    employment_status?: string | null
                    father_name?: string | null
                    full_name: string
                    gender?: string | null
                    has_non_relevant_pg?: boolean | null
                    has_relevant_pg?: boolean | null
                    id: string
                    institution?: string | null
                    is_active?: boolean | null
                    membership_status?: string | null
                    membership_type?: string | null
                    other_qualification?: string | null
                    post_graduate_institution?: string | null
                    profile_photo_url?: string | null
                    province?: string | null
                    qualification?: string | null
                    residential_address?: string | null
                    role?: string | null
                    subscription_end_date?: string | null
                    subscription_start_date?: string | null
                    updated_at?: string | null
                }
                Update: {
                    blood_group?: string | null
                    city?: string | null
                    cnic?: string
                    college_attended?: string | null
                    contact_number?: string
                    created_at?: string | null
                    current_status?: string | null
                    date_of_birth?: string | null
                    designation?: string | null
                    email?: string
                    employment_status?: string | null
                    father_name?: string | null
                    full_name?: string
                    gender?: string | null
                    has_non_relevant_pg?: boolean | null
                    has_relevant_pg?: boolean | null
                    id?: string
                    institution?: string | null
                    is_active?: boolean | null
                    membership_status?: string | null
                    membership_type?: string | null
                    other_qualification?: string | null
                    post_graduate_institution?: string | null
                    profile_photo_url?: string | null
                    province?: string | null
                    qualification?: string | null
                    residential_address?: string | null
                    role?: string | null
                    subscription_end_date?: string | null
                    subscription_start_date?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            wing_members: {
                Row: {
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    manual_image: string | null
                    manual_name: string | null
                    profile_id: string | null
                    role: string
                    wing_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    manual_image?: string | null
                    manual_name?: string | null
                    profile_id?: string | null
                    role: string
                    wing_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    manual_image?: string | null
                    manual_name?: string | null
                    profile_id?: string | null
                    role?: string
                    wing_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "wing_members_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "wing_members_wing_id_fkey"
                        columns: ["wing_id"]
                        isOneToOne: false
                        referencedRelation: "wings"
                        referencedColumns: ["id"]
                    },
                ]
            }
            wings: {
                Row: {
                    acronym: string | null
                    created_at: string | null
                    description: string | null
                    icon: string | null
                    id: string
                    name: string
                    slug: string | null
                }
                Insert: {
                    acronym?: string | null
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name: string
                    slug?: string | null
                }
                Update: {
                    acronym?: string | null
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name?: string
                    slug?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Enums"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["CompositeTypes"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Omit<Database, "__InternalSupabase">
    }
    ? keyof Omit<Database, "__InternalSupabase">[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
