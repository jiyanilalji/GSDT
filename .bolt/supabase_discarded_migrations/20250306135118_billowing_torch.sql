/*
  # Add Reserves Tables

  1. New Tables
    - `reserve_assets`
      - `id` (uuid, primary key)
      - `symbol` (text)
      - `name` (text)
      - `amount` (text)
      - `value_usd` (text)
      - `custodian` (text)
      - `last_updated` (timestamptz)
      - `audit_url` (text, nullable)
      - `created_at` (timestamptz)

    - `reserve_summary`
      - `id` (uuid, primary key)
      - `total_value_usd` (text)
      - `total_supply_gsdt` (text)
      - `backing_ratio` (text)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access to all tables
      - Admin write access to all tables

  3. Indexes
    - Add indexes for frequently queried columns
*/

-- Create reserve_assets table
CREATE TABLE IF NOT EXISTS reserve_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  amount text NOT NULL,
  value_usd text NOT NULL,
  custodian text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now(),
  audit_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create reserve_summary table
CREATE TABLE IF NOT EXISTS reserve_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_value_usd text NOT NULL,
  total_supply_gsdt text NOT NULL,
  backing_ratio text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE reserve_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_summary ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reserve_assets_custodian ON reserve_assets USING btree (custodian);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_symbol ON reserve_assets USING btree (symbol);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_last_updated ON reserve_assets USING btree (last_updated DESC);

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
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

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
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Insert initial reserve summary
INSERT INTO reserve_summary (total_value_usd, total_supply_gsdt, backing_ratio, last_updated)
VALUES ('0', '0', '1.00', now())
ON CONFLICT DO NOTHING;