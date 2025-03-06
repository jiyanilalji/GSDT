/*
  # Add Sumsub integration tables

  1. New Tables
    - `sumsub_applicants` - Stores Sumsub applicant data
      - `id` (uuid, primary key)
      - `user_address` (text, not null)
      - `applicant_id` (text, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz, not null)
      - `updated_at` (timestamptz)
      - `webhook_data` (jsonb)
      - `review_result` (text)

  2. Modifications
    - Add columns to `kyc_requests` table:
      - `verification_method` (text)
      - `sumsub_applicant_id` (text)
      - `sumsub_data` (jsonb)

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create sumsub_applicants table
CREATE TABLE IF NOT EXISTS sumsub_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  applicant_id text NOT NULL UNIQUE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  webhook_data jsonb,
  review_result text,
  CONSTRAINT status_check CHECK (status IN ('init', 'pending', 'prechecked', 'queued', 'completed', 'onhold', 'approved', 'rejected'))
);

-- Enable RLS on sumsub_applicants
ALTER TABLE sumsub_applicants ENABLE ROW LEVEL SECURITY;

-- Add columns to kyc_requests table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_requests' AND column_name = 'verification_method'
  ) THEN
    ALTER TABLE kyc_requests ADD COLUMN verification_method text DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_requests' AND column_name = 'sumsub_applicant_id'
  ) THEN
    ALTER TABLE kyc_requests ADD COLUMN sumsub_applicant_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_requests' AND column_name = 'sumsub_data'
  ) THEN
    ALTER TABLE kyc_requests ADD COLUMN sumsub_data jsonb;
  END IF;
END $$;

-- Create policies for sumsub_applicants
CREATE POLICY "Users can read own sumsub applicants"
  ON sumsub_applicants
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Users can create own sumsub applicants"
  ON sumsub_applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Service role can manage all sumsub applicants"
  ON sumsub_applicants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_user_address ON sumsub_applicants(user_address);
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_applicant_id ON sumsub_applicants(applicant_id);
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_status ON sumsub_applicants(status);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_verification_method ON kyc_requests(verification_method);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_sumsub_applicant_id ON kyc_requests(sumsub_applicant_id);