-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
-- We add a 'role' column to handle permission levels (member vs admin)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  father_name TEXT,
  cnic TEXT NOT NULL UNIQUE,
  contact_number TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  blood_group TEXT,
  residential_address TEXT,
  profile_photo_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- 2. MEMBERSHIP APPLICATIONS
CREATE TABLE public.membership_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('Full', 'Overseas', 'Associate', 'Student')),
  is_renewal BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  renewal_card_url TEXT,
  student_id_url TEXT,
  transcript_front_url TEXT,
  transcript_back_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

-- Application Policies
CREATE POLICY "Users view own applications" ON public.membership_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all applications" ON public.membership_applications FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users create applications" ON public.membership_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update application status" ON public.membership_applications FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- 3. ACADEMIC INFO
CREATE TABLE public.academic_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  qualification TEXT NOT NULL,
  college_attended TEXT,
  other_qualification TEXT,
  post_graduate_institution TEXT,
  has_relevant_pg BOOLEAN DEFAULT FALSE,
  has_non_relevant_pg BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.academic_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own academic" ON public.academic_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all academic" ON public.academic_info FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users manage own academic" ON public.academic_info FOR ALL USING (auth.uid() = user_id);

-- 4. EMPLOYMENT INFO
CREATE TABLE public.employment_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  employment_status TEXT NOT NULL,
  designation TEXT,
  city TEXT,
  province TEXT
);

ALTER TABLE public.employment_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own employment" ON public.employment_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all employment" ON public.employment_info FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users manage own employment" ON public.employment_info FOR ALL USING (auth.uid() = user_id);

-- 5. DOCUMENTS (Centralized Storage Links)
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('cnic_front', 'cnic_back', 'transcript_front', 'transcript_back', 'student_id', 'renewal_card', 'other')),
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all documents" ON public.documents FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users upload documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins verify documents" ON public.documents FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- 6. PAYMENTS (Robust Flow)
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.membership_applications(id),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON public.payments FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users submit payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins verify payments" ON public.payments FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- 7. CMS / SITE CONTENT (Dynamic Website Sections)
-- This table allows admins to update text/images on the homepage without code changes
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY, -- e.g., 'home_hero', 'about_mission', 'testimonials'
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible JSON structure for different sections
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage content" ON public.site_content FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- 8. AUDIT LOGS (For robustness and security)
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- e.g., 'approve_member', 'reject_payment'
  performed_by UUID REFERENCES public.profiles(id),
  target_id UUID, -- ID of the record being affected
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role IN ('admin', 'super_admin'))
);

-- TRIGGER: Create Profile on Signup
-- automatically inserts a row into public.profiles when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, cnic, contact_number)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'cnic',
    new.raw_user_meta_data->>'contact_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You must create the trigger in the dashboard or via API as it requires permissions on auth.users
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
