-- Complete RLS policy fix for reference_codes table
-- Run this entire script in Supabase SQL Editor

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow public to insert reference codes" ON reference_codes;
DROP POLICY IF EXISTS "Allow public to read reference codes" ON reference_codes;
DROP POLICY IF EXISTS "Allow public to read unused reference codes" ON reference_codes;
DROP POLICY IF EXISTS "Allow public to update reference codes during verification" ON reference_codes;
DROP POLICY IF EXISTS "Allow public to delete reference codes" ON reference_codes;
DROP POLICY IF EXISTS "Allow service role to insert reference codes" ON reference_codes;

-- Create new permissive policies

-- INSERT: Allow anyone to insert codes (for admin bulk generation)
CREATE POLICY "Allow insert reference codes"
  ON reference_codes
  FOR INSERT
  WITH CHECK (true);

-- SELECT: Allow anyone to read all codes
CREATE POLICY "Allow select reference codes"
  ON reference_codes
  FOR SELECT
  USING (true);

-- UPDATE: Allow anyone to update codes (for marking as used)
CREATE POLICY "Allow update reference codes"
  ON reference_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow anyone to delete codes (for admin flush)
CREATE POLICY "Allow delete reference codes"
  ON reference_codes
  FOR DELETE
  USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'reference_codes';
