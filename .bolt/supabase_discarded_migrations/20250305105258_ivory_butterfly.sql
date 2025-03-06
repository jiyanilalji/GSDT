/*
  # Create SumSub applicants table

  1. New Tables
    - `sumsub_applicants`
      - `id` (uuid, primary key)
      - `user_address` (text)
      - `applicant_id` (text, unique)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `webhook_data` (jsonb)
      - `review_result` (text)

  2. Security
    - Enable RLS on `sumsub_applicants` table
    - Add policies for service role and authenticated users
*/

CREATE TABLE IF NOT EXISTS sumsub_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  applicant_id text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('init', 'pending', 'prechecked', 'queued', 'completed', 'onhold', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  webhook_data jsonb,
  review_result text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_user_address ON sumsub_applicants(user_address);
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_applicant_id ON sumsub_applicants(applicant_id);
CREATE INDEX IF NOT EXISTS idx_sumsub_applicants_status ON sumsub_applicants(status);

-- Enable RLS
ALTER TABLE sumsub_applicants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage all sumsub applicants"
  ON sumsub_applicants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can create own sumsub applicants"
  ON sumsub_applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Users can read own sumsub applicants"
  ON sumsub_applicants
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);