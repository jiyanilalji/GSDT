-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable read access for users own folder" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for users own folder" ON storage.objects;

-- Recreate storage bucket with minimal configuration
DELETE FROM storage.buckets WHERE id = 'kyc-documents';
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'kyc-documents',
  'kyc-documents',
  true  -- Make bucket public but control access via RLS
);

-- Create simple storage policies
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