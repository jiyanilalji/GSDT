/*
  # Fix KYC Requests Policies

  1. Changes
    - Drop existing policies
    - Recreate KYC requests table policies
    - Add new indexes for performance

  2. Security
    - Maintain RLS on kyc_requests table
    - Update policies for users and service role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Users can create own KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Service role can manage all KYC requests" ON kyc_requests;

-- Create new policies
CREATE POLICY "Users can view own requests"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Users can submit requests"
  ON kyc_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Service role full access"
  ON kyc_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add additional indexes for better query performance
CREATE INDEX IF NOT EXISTS kyc_requests_status_user_idx ON kyc_requests(status, user_address);
CREATE INDEX IF NOT EXISTS kyc_requests_reviewed_at_idx ON kyc_requests(reviewed_at);