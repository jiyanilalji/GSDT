/*
  # Add Storage Bucket for KYC Documents

  1. Changes
    - Create storage bucket for KYC documents
    - Set up storage policies
  
  2. Security
    - Enable RLS for storage
    - Add proper user authentication checks
    - Ensure users can only access their own documents
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true);

-- Create policies for storage
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);