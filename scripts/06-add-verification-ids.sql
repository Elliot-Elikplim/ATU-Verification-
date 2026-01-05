-- Add unique verification ID to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_id VARCHAR(20) UNIQUE;

-- Create function to generate unique verification ID
CREATE OR REPLACE FUNCTION generate_verification_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate format: VER-YEAR-XXXXX (e.g., VER-2026-A1B2C)
  NEW.verification_id := 'VER-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || 
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 5));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate verification ID
DROP TRIGGER IF EXISTS set_verification_id ON users;
CREATE TRIGGER set_verification_id
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_verification_id();

-- Update existing users with verification IDs
UPDATE users 
SET verification_id = 'VER-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || 
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 5))
WHERE verification_id IS NULL;
