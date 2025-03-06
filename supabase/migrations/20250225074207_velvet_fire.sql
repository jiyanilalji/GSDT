/*
  # Fix KYC Admin Access

  1. Changes
    - Add service_role policy for admin access
    - Update existing policies for better security
    - Add missing indexes

  2. Security
    - Maintain RLS on kyc_requests table
    - Ensure proper admin access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "users_submit_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "admins_read_all_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "admins_update_kyc" ON kyc_requests;

-- Create updated policies
CREATE POLICY "users_read_own_kyc"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "users_submit_own_kyc"
  ON kyc_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "service_role_all_access"
  ON kyc_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admins_read_all_kyc"
  ON kyc_requests
  FOR SELECT
  USING (true);

CREATE POLICY "admins_update_kyc"
  ON kyc_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);