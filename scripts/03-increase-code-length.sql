-- Update reference_codes table to support longer, more secure codes
-- Change code column from VARCHAR(20) to VARCHAR(50) to accommodate format: CPS-XXXX-XXXX-XXXX-XXXX

ALTER TABLE reference_codes 
ALTER COLUMN code TYPE VARCHAR(50);

-- This change is backward compatible - existing shorter codes will still work
