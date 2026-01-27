ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_membership_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_membership_status_check 
CHECK (membership_status IN ('pending', 'active', 'approved', 'rejected', 'expired', 'blocked', 'revoked', 'suspended'));
