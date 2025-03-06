-- Create contact_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new',
  CONSTRAINT status_check CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- Create emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  from_email text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent',
  CONSTRAINT status_check CHECK (status IN ('sent', 'failed', 'delivered'))
);

-- Enable RLS on contact_submissions if not already enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on emails if not already enabled
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable read for service role" ON contact_submissions;
DROP POLICY IF EXISTS "Enable update for service role" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON emails;
DROP POLICY IF EXISTS "Enable read for service role" ON emails;

-- Create policies for contact_submissions
CREATE POLICY "Enable insert for authenticated users"
ON contact_submissions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for service role"
ON contact_submissions FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Enable update for service role"
ON contact_submissions FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for emails
CREATE POLICY "Enable insert for authenticated users"
ON emails FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for service role"
ON emails FOR SELECT
TO service_role
USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);