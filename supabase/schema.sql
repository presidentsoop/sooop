-- ========================================
-- SOOOP MEMBERSHIP SYSTEM - COMPLETE SCHEMA
-- ========================================
-- This schema handles the full lifecycle of members:
-- 1. Registration (with 30+ fields from CSV)
-- 2. Document Verification
-- 3. Membership Approval & ID Generation
-- 4. Subscription & Payments
-- 5. Admin Management & Audit Logs

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PROFILES (Extended with all CSV fields)
-- ========================================
-- This table extends the basic auth.users with detailed profile info.
-- Name is separated from mutable profile data if needed, but here we keep it central.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  father_name TEXT,
  cnic TEXT NOT NULL UNIQUE,
  contact_number TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  blood_group TEXT,
  residential_address TEXT,
  profile_photo_url TEXT,
  
  -- Academic Information
  qualification TEXT, -- e.g., BSc Optometry
  college_attended TEXT,
  post_graduate_institution TEXT,
  has_relevant_pg BOOLEAN DEFAULT FALSE,
  has_non_relevant_pg BOOLEAN DEFAULT FALSE,
  other_qualification TEXT,
  
  -- Employment Information
  employment_status TEXT, -- e.g., Govt, Private, Student
  designation TEXT,
  city TEXT,
  province TEXT,
  institution TEXT, -- Current workplace or University
  current_status TEXT, -- e.g., "3rd Year" or "Senior Consultant"
  
  -- Membership Information
  membership_type TEXT CHECK (membership_type IN ('Full', 'Overseas', 'Associate', 'Student')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  membership_number TEXT UNIQUE, -- SOOOP-XXXX format - generated on approval
  subscription_start_date DATE,
  subscription_end_date DATE,
  
  -- Role & Access
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
-- Users can update most fields, but some (like CNIC/Name) might be restricted in UI
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
-- Allow new users to insert their profile during signup
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ========================================
-- 1a. MEMBERSHIP APPLICATIONS (New)
-- ========================================
CREATE TABLE public.membership_applications (
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

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own applications" ON public.membership_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all applications" ON public.membership_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users insert own applications" ON public.membership_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update applications" ON public.membership_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ========================================
-- 2. DOCUMENTS
-- ========================================
-- Centralized storage references for all user uploads
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  document_type TEXT NOT NULL CHECK (document_type IN (
    'cnic_front', 'cnic_back', 
    'transcript_front', 'transcript_back', 
    'student_id', 'renewal_card', 
    'profile_photo', 'payment_proof', 'other'
  )),
  
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users upload documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);


-- ========================================
-- 3. PAYMENTS & SUBSCRIPTIONS
-- ========================================
-- Robust tracking of every transaction and subscription period
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.membership_applications(id), -- Linked to application
  
  -- Payment Details
  transaction_id TEXT, -- Can be manual ID or system generated
  payment_mode TEXT, -- JazzCash, EasyPaisa, Bank Transfer
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  receipt_url TEXT, -- Screenshot proof
  
  -- Subscription Period this payment covers
  period_start DATE,
  period_end DATE,
  
  -- Verification
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users submit payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);


-- ========================================
-- 4. AUDIT LOGS (Security & Compliance)
-- ========================================
-- Tracks all critical admin actions (approvals, bans, edits)
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- e.g., 'approve_member', 'revoke_access'
  performed_by UUID REFERENCES public.profiles(id),
  target_user_id UUID REFERENCES public.profiles(id),
  details JSONB, -- Flexible payload for what changed
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);


-- ========================================
-- 5. CONTENT MANAGEMENT (CMS)
-- ========================================
-- Stores dynamic content for the website pages
CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE, -- e.g. 'home', 'about'
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Admins manage pages" ON public.pages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);


-- ========================================
-- 6. EMAIL CAMPAIGNS (Marketing)
-- ========================================
CREATE TABLE public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_filter TEXT DEFAULT 'all',
  sent_by UUID REFERENCES public.profiles(id),
  sent_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns" ON public.email_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ========================================
-- 7. WINGS (New)
-- ========================================
CREATE TABLE public.wings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    acronym TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view wings" ON public.wings FOR SELECT USING (true);
CREATE POLICY "Admins manage wings" ON public.wings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ========================================
-- 8. WING MEMBERS (New)
-- ========================================
CREATE TABLE public.wing_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wing_id UUID REFERENCES public.wings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional if manual entry
    role TEXT NOT NULL, -- President, General Secretary, etc.
    manual_name TEXT, -- For members not in system yet
    manual_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wing_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view wing members" ON public.wing_members FOR SELECT USING (true);
CREATE POLICY "Admins manage wing members" ON public.wing_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ========================================
-- 9. LEADERSHIP HISTORY (New)
-- ========================================
CREATE TABLE public.leadership_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    start_year TEXT,
    end_year TEXT, -- Null means current
    category TEXT CHECK (category IN ('cabinet', 'council', 'past_president')),
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leadership_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view leadership" ON public.leadership_history FOR SELECT USING (true);
CREATE POLICY "Admins manage leadership" ON public.leadership_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);


-- ========================================
-- 10. HELPERS & TRIGGERS
-- ========================================

-- Sequence for Membership IDs (Starts at 1001)
CREATE SEQUENCE IF NOT EXISTS membership_number_seq START 1001;

-- Function: Generate Membership Number
CREATE OR REPLACE FUNCTION generate_membership_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SOOOP-' || LPAD(nextval('membership_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger: Handle Membership Approval
-- Automatically assigns ID and Sets 1-Year Subscription when status becomes 'approved'
CREATE OR REPLACE FUNCTION handle_membership_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_status = 'approved' AND OLD.membership_status != 'approved' THEN
    -- Only generate if not already exists
    IF NEW.membership_number IS NULL THEN
        NEW.membership_number := generate_membership_number();
    END IF;
    
    -- Set Subscription Dates (1 Year from now)
    NEW.subscription_start_date := CURRENT_DATE;
    NEW.subscription_end_date := CURRENT_DATE + INTERVAL '1 year';
    
    -- Log the approval in audit logs (Optional but good practice)
    -- We'll handle audit logs via application code mostly for simplicity
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_membership_approval
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_membership_approval();

-- Trigger: Update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: New User Handler (Supabase Auth Integration)
-- Creates a basic profile when a user signs up via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, cnic, contact_number, role, is_active)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'),
    COALESCE(new.raw_user_meta_data->>'cnic', 'N/A'),
    COALESCE(new.raw_user_meta_data->>'contact_number', 'N/A'),
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    TRUE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook into auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
