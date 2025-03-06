/*
  # Add mimetype column to KYC requests

  1. Changes
    - Add mimetype column to kyc_requests table
    - Add check constraint for allowed mimetypes
    - Add index for mimetype column

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add mimetype column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_requests' AND column_name = 'mimetype'
  ) THEN
    ALTER TABLE kyc_requests ADD COLUMN mimetype text;
    
    -- Add check constraint for allowed mimetypes
    ALTER TABLE kyc_requests 
    ADD CONSTRAINT valid_mimetype 
    CHECK (
      mimetype IN ('image/jpeg', 'image/png', 'application/pdf')
    );

    -- Add index for mimetype column
    CREATE INDEX IF NOT EXISTS idx_kyc_mimetype ON kyc_requests(mimetype);
  END IF;
END $$;