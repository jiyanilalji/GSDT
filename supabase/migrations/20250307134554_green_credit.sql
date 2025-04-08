/*
  # Fix admin roles table constraints

  1. Changes
    - Update role_check constraint to include all valid roles
    - Add created_at and updated_at columns with proper defaults
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
    - Add validation for role values
*/

-- Drop existing role_check constraint
ALTER TABLE admin_roles 
DROP CONSTRAINT IF EXISTS role_check;

-- Add new role_check constraint with all valid roles
ALTER TABLE admin_roles
ADD CONSTRAINT role_check CHECK (
  role IN (
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'MINTER',
    'BURNER',
    'PAUSER',
    'PRICE_UPDATER'
  )
);

-- Ensure created_at has default value
ALTER TABLE admin_roles 
ALTER COLUMN created_at SET DEFAULT now();

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_roles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE admin_roles 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;

CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_address ON admin_roles(user_address);

-- Ensure RLS is enabled
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;