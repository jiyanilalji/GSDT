/*
  # Create admin roles table

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text, with constraint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `name` (text)
      - `email` (text)
  2. Security
    - Enable RLS on `admin_roles` table
    - Add policies for role-based access
*/

-- Create admin roles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_roles') THEN
    CREATE TABLE admin_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      role text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz,
      user_address text,
      name text,
      email text,
      CONSTRAINT role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR'))
    );
  END IF;
END $$;

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;

-- Create policies for admin_roles
CREATE POLICY "Users can read own role"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

-- Insert initial super admin
INSERT INTO admin_roles (user_id, role, name, email, user_address)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'SUPER_ADMIN', 'Super Admin', 'superadmin@dbdk.com', '0x1234567890123456789012345678901234567890')
ON CONFLICT DO NOTHING;

-- Insert other admin roles
INSERT INTO admin_roles (user_id, role, name, email, user_address)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Regular Admin', 'admin@dbdk.com', '0x2345678901234567890123456789012345678901')
ON CONFLICT DO NOTHING;

INSERT INTO admin_roles (user_id, role, name, email, user_address)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'MODERATOR', 'Content Moderator', 'moderator@dbdk.com', '0x3456789012345678901234567890123456789012')
ON CONFLICT DO NOTHING;