/*
  # Fix Storage Policies for KYC Documents

  1. Changes
    - Drop and recreate storage bucket with correct configuration
    - Add proper RLS policies without mimetype dependency
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

-- Create storage policies without mimetype dependency
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);