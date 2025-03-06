/*
  # Create KYC Requests Table and Admin Roles

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null)
      - `role` (text, not null)
      - `created_at` (timestamptz, not null)
    
    - `kyc_requests`
      - `id` (uuid, primary key)
      - `user_address` (text, not null)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `date_of_birth` (date, not null)
      - `document_type` (text, not null)
      - `document_url` (text, not null)
      - `status` (text, not null)
      - `submitted_at` (timestamptz, not null)
      - `reviewed_at` (timestamptz)
      - `rejection_reason` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to read their own KYC requests
    - Add policies for admins to manage KYC requests
*/

-- Create admin roles table first
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_check CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR'))
);

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create KYC requests table
CREATE TABLE IF NOT EXISTS kyc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  document_type text NOT NULL,
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  rejection_reason text,
  CONSTRAINT status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Enable RLS on kyc_requests
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can read own KYC requests"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Users can create own KYC requests"
  ON kyc_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

-- Policies for admins
CREATE POLICY "Admins can read all KYC requests"
  ON kyc_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins can update KYC requests"
  ON kyc_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Create indexes
CREATE INDEX kyc_requests_user_address_idx ON kyc_requests(user_address);
CREATE INDEX kyc_requests_status_idx ON kyc_requests(status);
CREATE INDEX kyc_requests_submitted_at_idx ON kyc_requests(submitted_at DESC);
CREATE INDEX admin_roles_user_id_idx ON admin_roles(user_id);
CREATE INDEX admin_roles_role_idx ON admin_roles(role);