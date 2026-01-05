-- Update DELETE policy to allow deleting all codes
DROP POLICY IF EXISTS "Allow public to delete reference codes" ON reference_codes;

CREATE POLICY "Allow public to delete reference codes"
  ON reference_codes
  FOR DELETE
  USING (true);

-- Update the UPDATE policy to allow marking codes as used
DROP POLICY IF EXISTS "Allow public to update reference codes during verification" ON reference_codes;

CREATE POLICY "Allow public to update reference codes during verification"
  ON reference_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
