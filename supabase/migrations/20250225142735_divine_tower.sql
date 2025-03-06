/*
  # Fix KYC Storage and Policies

  1. Changes
    - Drop and recreate storage bucket with correct configuration
    - Add proper RLS policies for storage and KYC requests
    - Fix file upload permissions
  
  2. Security
    - Enable RLS for storage
    - Add proper user authentication checks
    - Ensure users can only access their own documents
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable read access for users own folder" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for users own folder" ON storage.objects;

-- Recreate storage bucket
DELETE FROM storage.buckets WHERE id = 'kyc-documents';
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  true, -- Make bucket public but control access via RLS
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']::text[]
);

-- Create storage policies
CREATE POLICY "Enable read access for users own folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Enable insert access for users own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = split_part(name, '/', 1)
);

-- Drop and recreate KYC request policies
DROP POLICY IF EXISTS "enable_read_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "enable_insert_own_kyc" ON kyc_requests;
DROP POLICY IF EXISTS "enable_update_kyc_admin" ON kyc_requests;

-- Create updated KYC request policies
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
WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "enable_update_kyc_admin"
ON kyc_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_kyc_user_status ON kyc_requests(user_address, status);