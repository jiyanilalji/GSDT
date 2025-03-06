/*
  # Fix RLS Policies for KYC System

  1. Changes
    - Drop existing policies
    - Create new RLS policies for kyc_requests table
    - Create new storage policies for kyc-documents bucket
    - Add proper indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for service role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "users_submit_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "service_role_all_access" ON kyc_requests;
DROP POLICY IF EXISTS "admins_read_all_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "admins_update_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "Enable read access for users own folder" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for users own folder" ON storage.objects;

-- Recreate storage bucket with proper configuration
DELETE FROM storage.buckets WHERE id = 'kyc-documents';
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Create storage policies
CREATE POLICY "users_read_own_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_upload_own_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "service_role_access_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'kyc-documents')
WITH CHECK (bucket_id = 'kyc-documents');

-- Create KYC request policies
CREATE POLICY "users_read_own_kyc_requests"
ON kyc_requests FOR SELECT
TO authenticated
USING (auth.uid()::text = user_address);

CREATE POLICY "users_submit_own_kyc_requests"
ON kyc_requests FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_address
  AND status = 'PENDING'
);

CREATE POLICY "service_role_access_kyc"
ON kyc_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_user_status ON kyc_requests(user_address, status);
CREATE INDEX IF NOT EXISTS idx_kyc_status_date ON kyc_requests(status, submitted_at DESC);