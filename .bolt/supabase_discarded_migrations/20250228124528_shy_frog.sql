/*
  # Admin Roles Schema Update

  1. Changes
    - Modify admin_roles table to use user_address as the primary identifier
    - Add proper RLS policies for security
    - Insert test admin users
  
  2. Security
    - Enable RLS on admin_roles table
    - Add policies for users to read their own roles
    - Add policies for super admins to manage all roles
    - Add policy for service role to access all admin roles
*/

-- Create admin roles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_roles') THEN
    CREATE TABLE admin_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_address text NOT NULL,
      role text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz,
      name text,
      email text,
      CONSTRAINT role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR'))
    );
    
    -- Add unique constraint on user_address
    ALTER TABLE admin_roles ADD CONSTRAINT admin_roles_user_address_key UNIQUE (user_address);
  END IF;
END $$;

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;
DROP POLICY IF EXISTS "Service role can access all" ON admin_roles;

-- Create policies for admin_roles
CREATE POLICY "Users can read own role"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Super admins can manage all roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_address = auth.uid()::text
      AND role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_address = auth.uid()::text
      AND role = 'SUPER_ADMIN'
    )
  );

-- Create policy for service role
CREATE POLICY "Service role can access all"
  ON admin_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_address ON admin_roles(user_address);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

-- Insert your own wallet address as a super admin
-- Replace this with your actual wallet address
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x067f4523f9d623ccbad3ee7d5dfefe138894b4a5', 'SUPER_ADMIN', 'Your Name', 'your.email@example.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles WHERE user_address = '0x067f4523f9d623ccbad3ee7d5dfefe138894b4a5'
);

-- Insert initial super admin (one at a time to avoid conflicts)
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x1234567890123456789012345678901234567890', 'SUPER_ADMIN', 'Super Admin', 'superadmin@dbdk.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles WHERE user_address = '0x1234567890123456789012345678901234567890'
);

-- Insert regular admin
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x2345678901234567890123456789012345678901', 'ADMIN', 'Regular Admin', 'admin@dbdk.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles WHERE user_address = '0x2345678901234567890123456789012345678901'
);

-- Insert moderator
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x3456789012345678901234567890123456789012', 'MODERATOR', 'Content Moderator', 'moderator@dbdk.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles WHERE user_address = '0x3456789012345678901234567890123456789012'
);