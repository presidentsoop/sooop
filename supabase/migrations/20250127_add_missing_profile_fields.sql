-- Add missing fields to profiles table to support robust signup form

DO $$
BEGIN
    -- Personal
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;

    -- Professional / Academic
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_attended TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_qualification TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS post_graduate_institution TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_relevant_pg BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_non_relevant_pg BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;

    -- Ensure existing columns just in case
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists';
END $$;
