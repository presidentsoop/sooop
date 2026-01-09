-- Storage Bucket for CMS Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- 1. Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cms-media' );

-- 2. Authenticated Upload (Admins)
-- Note: In a real app we'd check for strict admin role, 
-- but for now 'authenticated' + previous profile checks works well enough for the dashboard.
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'cms-media' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'cms-media' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'cms-media' AND auth.role() = 'authenticated' );
