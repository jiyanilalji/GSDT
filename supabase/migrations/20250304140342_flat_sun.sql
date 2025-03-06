-- Drop existing role check constraint
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS role_check;

-- Update role check constraint to include contract roles
ALTER TABLE admin_roles ADD CONSTRAINT role_check 
CHECK (role IN (
  'SUPER_ADMIN', 
  'ADMIN', 
  'MODERATOR',
  'MINTER_ROLE',
  'BURNER_ROLE',
  'PAUSER_ROLE',
  'PRICE_UPDATER_ROLE'
));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_address_role ON admin_roles(user_address, role);

-- Update existing super admin role
UPDATE admin_roles 
SET role = 'SUPER_ADMIN' 
WHERE user_address = '0x1234567890123456789012345678901234567890';

-- Add minter role for testing
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x2345678901234567890123456789012345678901', 'MINTER_ROLE', 'Token Minter', 'minter@gsdt.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE user_address = '0x2345678901234567890123456789012345678901'
);

-- Add burner role for testing
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x3456789012345678901234567890123456789012', 'BURNER_ROLE', 'Token Burner', 'burner@gsdt.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE user_address = '0x3456789012345678901234567890123456789012'
);