/*
  # Contact Form and Email System

  1. New Tables
    - `contact_submissions` - Stores all contact form submissions
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `submitted_at` (timestamp)
      - `status` (text) - Can be 'new', 'read', 'replied', or 'archived'
    
    - `emails` - Tracks all sent emails
      - `id` (uuid, primary key)
      - `to_email` (text)
      - `from_email` (text)
      - `subject` (text)
      - `html` (text)
      - `sent_at` (timestamp)
      - `status` (text) - Can be 'sent', 'failed', or 'delivered'
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users and service role
*/

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

-- Enable RLS on contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on emails
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);