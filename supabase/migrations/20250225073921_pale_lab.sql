/*
  # Fix KYC Requests Table and Policies

  1. Changes
    - Add missing columns to kyc_requests table
    - Update policies for better security
    - Add indexes for performance

  2. Security
    - Maintain RLS on kyc_requests table
    - Update policies for users and admins
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Users can create own KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Service role can manage all KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Admins can read all KYC requests" ON kyc_requests;
DROP POLICY IF EXISTS "Admins can update KYC requests" ON kyc_requests;

-- Add nationality column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_requests' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE kyc_requests ADD COLUMN nationality text;
  END IF;
END $$;

-- Create new policies with better names and permissions
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

CREATE POLICY "admins_read_all_kyc"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "admins_update_kyc"
  ON kyc_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kyc_status_date ON kyc_requests(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_user_status ON kyc_requests(user_address, status);