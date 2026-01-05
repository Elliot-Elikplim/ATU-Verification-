-- Add missing INSERT policy for reference_codes table
-- This allows the admin API routes to insert new reference codes

DROP POLICY IF EXISTS "Allow service role to insert reference codes" ON reference_codes;

CREATE POLICY "Allow service role to insert reference codes"
  ON reference_codes
  FOR INSERT
  WITH CHECK (true);

-- Alternative: If you want to restrict to authenticated users only
-- CREATE POLICY "Allow authenticated to insert reference codes"
--   ON reference_codes
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- Grant necessary permissions to anon role (used by your API)
GRANT INSERT ON reference_codes TO anon;
GRANT INSERT ON users TO anon;

-- Grant SELECT permissions for admin operations
GRANT SELECT ON reference_codes TO anon;
GRANT SELECT ON users TO anon;

-- Grant UPDATE permissions for code usage
GRANT UPDATE ON reference_codes TO anon;
GRANT UPDATE ON users TO anon;

-- Grant DELETE permissions for admin operations
GRANT DELETE ON reference_codes TO anon;
