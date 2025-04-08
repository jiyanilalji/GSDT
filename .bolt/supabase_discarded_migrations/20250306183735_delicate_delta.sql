/*
  # Create Reserves Tables

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
      - `custodian_id` (uuid, foreign key to custodians)

    - `reserve_summary`
      - `id` (uuid, primary key)
      - `total_value_usd` (text)
      - `total_supply_gsdt` (text)
      - `backing_ratio` (text)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin management

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
  created_at timestamptz NOT NULL DEFAULT now(),
  custodian_id uuid REFERENCES custodians(id)
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
CREATE INDEX IF NOT EXISTS idx_reserve_assets_symbol ON reserve_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_custodian ON reserve_assets(custodian);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_last_updated ON reserve_assets(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_summary_last_updated ON reserve_summary(last_updated DESC);

-- Public read access policies
CREATE POLICY "Allow public read access to reserve_assets"
  ON reserve_assets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to reserve_summary"
  ON reserve_summary
  FOR SELECT
  TO public
  USING (true);

-- Admin management policies
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