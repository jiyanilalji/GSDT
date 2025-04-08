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
      - `custodian_id` (uuid, foreign key to custodians)

    - `reserve_summary`
      - `id` (uuid, primary key)
      - `total_value_usd` (text, not null)
      - `total_supply_gsdt` (text, not null)
      - `backing_ratio` (text, not null)
      - `last_updated` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access and public read access

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
  last_updated timestamptz DEFAULT now() NOT NULL,
  audit_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  custodian_id uuid REFERENCES custodians(id)
);

-- Create reserve_summary table
CREATE TABLE IF NOT EXISTS reserve_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_value_usd text NOT NULL,
  total_supply_gsdt text NOT NULL,
  backing_ratio text NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reserve_assets_symbol ON reserve_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_custodian ON reserve_assets(custodian);
CREATE INDEX IF NOT EXISTS idx_reserve_assets_last_updated ON reserve_assets(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_reserve_summary_last_updated ON reserve_summary(last_updated DESC);

-- Enable Row Level Security
ALTER TABLE reserve_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for reserve_assets
CREATE POLICY "Allow public read access to reserve_assets"
  ON reserve_assets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage reserve_assets"
  ON reserve_assets
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
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Insert initial reserve summary
INSERT INTO reserve_summary (total_value_usd, total_supply_gsdt, backing_ratio)
VALUES ('1000000', '1000000', '1.0')
ON CONFLICT DO NOTHING;

-- Insert sample reserve assets
INSERT INTO reserve_assets (symbol, name, amount, value_usd, custodian)
VALUES 
  ('USDC', 'USD Coin', '500000', '500000', 'Fireblocks'),
  ('USDT', 'Tether USD', '300000', '300000', 'BitGo'),
  ('DAI', 'Dai Stablecoin', '200000', '200000', 'Copper')
ON CONFLICT DO NOTHING;