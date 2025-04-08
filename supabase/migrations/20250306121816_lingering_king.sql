/*
  # Create Reserves Tables

  1. New Tables
    - `reserve_assets`
      - `id` (uuid, primary key)
      - `symbol` (text, not null)
      - `name` (text, not null) 
      - `amount` (text, not null)
      - `value_usd` (text, not null)
      - `custodian` (text, not null)
      - `last_updated` (timestamptz, default now())
      - `audit_url` (text, nullable)
      - `created_at` (timestamptz, default now())

    - `reserve_summary`
      - `id` (uuid, primary key)
      - `total_value_usd` (text, not null)
      - `total_supply_gsdt` (text, not null)
      - `backing_ratio` (text, not null)
      - `last_updated` (timestamptz, default now())

    - `custodians`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `total_value_usd` (text, not null)
      - `last_audit` (timestamptz, nullable)
      - `audit_url` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Indexes
    - Index on reserve_assets(symbol)
    - Index on reserve_assets(custodian)
    - Index on reserve_assets(last_updated DESC)

  3. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin management
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to reserve_assets" ON reserve_assets;
  DROP POLICY IF EXISTS "Allow admins to manage reserve_assets" ON reserve_assets;
  DROP POLICY IF EXISTS "Allow public read access to reserve_summary" ON reserve_summary;
  DROP POLICY IF EXISTS "Allow admins to manage reserve_summary" ON reserve_summary;
  DROP POLICY IF EXISTS "Allow public read access to custodians" ON custodians;
  DROP POLICY IF EXISTS "Allow admins to manage custodians" ON custodians;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create reserve_assets table
CREATE TABLE IF NOT EXISTS reserve_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  amount text NOT NULL,
  value_usd text NOT NULL,
  custodian text NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL,
  audit_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create reserve_summary table
CREATE TABLE IF NOT EXISTS reserve_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_value_usd text NOT NULL,
  total_supply_gsdt text NOT NULL,
  backing_ratio text NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL
);

-- Create custodians table
CREATE TABLE IF NOT EXISTS custodians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_value_usd text NOT NULL,
  last_audit timestamptz,
  audit_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reserve_assets_symbol ON reserve_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_custodian ON reserve_assets(custodian);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_last_updated ON reserve_assets(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_custodians_name ON custodians(name);

-- Enable RLS
ALTER TABLE reserve_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE custodians ENABLE ROW LEVEL SECURITY;

-- Create policies for reserve_assets
CREATE POLICY "Allow public read access to reserve_assets"
  ON reserve_assets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage reserve_assets"
  ON reserve_assets
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_address = (auth.uid())::text
    AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
  ));

-- Create policies for reserve_summary
CREATE POLICY "Allow public read access to reserve_summary"
  ON reserve_summary
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage reserve_summary"
  ON reserve_summary
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_address = (auth.uid())::text
    AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
  ));

-- Create policies for custodians
CREATE POLICY "Allow public read access to custodians"
  ON custodians
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage custodians"
  ON custodians
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_address = (auth.uid())::text
    AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
  ));