-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  index_number VARCHAR(50) NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reference_codes table
CREATE TABLE IF NOT EXISTS reference_codes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code VARCHAR(20) NOT NULL UNIQUE,
  index_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  created_by VARCHAR(255),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reference_codes_code ON reference_codes(code);
CREATE INDEX IF NOT EXISTS idx_reference_codes_index_number ON reference_codes(index_number);
CREATE INDEX IF NOT EXISTS idx_reference_codes_status ON reference_codes(status);
CREATE INDEX IF NOT EXISTS idx_users_index_number ON users(index_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable RLS for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (allow public insert for verification)
CREATE POLICY "Allow public to insert users" 
  ON users 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public to view their own user" 
  ON users 
  FOR SELECT 
  USING (true);

-- Create policies for reference_codes table (admin only for management)
CREATE POLICY "Allow public to insert reference codes"
  ON reference_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to read reference codes"
  ON reference_codes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public to update reference codes during verification"
  ON reference_codes
  FOR UPDATE
  USING (status = 'unused')
  WITH CHECK (status = 'used');

CREATE POLICY "Allow public to delete reference codes"
  ON reference_codes
  FOR DELETE
  USING (true);
