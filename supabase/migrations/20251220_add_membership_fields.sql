-- Add membership fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'rejected')),
ADD COLUMN IF NOT EXISTS membership_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Create a sequence for registration numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START 1000;

-- Function to generate next registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
    next_val INTEGER;
    current_year INTEGER;
BEGIN
    SELECT nextval('registration_number_seq') INTO next_val;
    SELECT EXTRACT(YEAR FROM CURRENT_DATE) INTO current_year;
    RETURN next_val || '/Sooop/' || current_year;
END;
$$ LANGUAGE plpgsql;
