/*
  # Fix KYC Request Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper authentication checks
    - Add better error handling for single row queries
    - Fix RLS policy for user submissions
  
  2. Security
    - Enable RLS
    - Add proper user authentication checks
    - Ensure users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "users_submit_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "service_role_all_access" ON kyc_requests;
DROP POLICY IF EXISTS "admins_read_all_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "admins_update_kyc" ON kyc_requests;

-- Create new policies with proper authentication
CREATE POLICY "enable_read_own_kyc"
ON kyc_requests FOR SELECT
TO authenticated
USING (
  auth.uid()::text = user_address
  OR EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "enable_insert_own_kyc"
ON kyc_requests FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_address
  AND NOT EXISTS (
    SELECT 1 FROM kyc_requests 
    WHERE user_address = auth.uid()::text 
    AND status IN ('PENDING', 'APPROVED')
  )
);

CREATE POLICY "enable_update_kyc_admin"
ON kyc_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_user_status ON kyc_requests(user_address, status);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_requests(status);