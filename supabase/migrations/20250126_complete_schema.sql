-- Migration to complete the schema based on application requirements

-- 1. Ensure Profiles has all necessary columns
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residential_address TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qualification TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_type TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'pending';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists';
END $$;

-- 2. Membership Applications Table (Using IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    membership_type TEXT NOT NULL,
    is_renewal BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    renewal_card_url TEXT,
    student_id_url TEXT,
    transcript_front_url TEXT,
    transcript_back_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ
);

-- 3. Wings Table - Ensure columns
DO $$
BEGIN
    ALTER TABLE public.wings ADD COLUMN IF NOT EXISTS acronym TEXT;
END $$;

-- The tables wings, wing_members, leadership_history seem to exist already.
-- This migration ensures they and their columns exist.
