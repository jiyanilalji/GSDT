/*
  # Add Custodians Table and Triggers

  1. New Table
    - `custodians`
      - `id` (uuid, primary key)
      - `name` (text)
      - `total_value_usd` (text)
      - `last_audit` (timestamptz)
      - `audit_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Triggers
    - Update reserve_summary when reserve_assets change
    - Update custodian totals when reserve_assets change

  3. Security
    - Enable RLS
    - Add policies for public read and admin write access
*/

-- Create custodians table
CREATE TABLE IF NOT EXISTS custodians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_value_usd text NOT NULL,
  last_audit timestamptz,
  audit_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE custodians ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custodians_name ON custodians USING btree (name);

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
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Create function to update reserve summary
CREATE OR REPLACE FUNCTION update_reserve_summary()
RETURNS TRIGGER AS $$
DECLARE
  total_value numeric;
  total_supply numeric;
  backing numeric;
BEGIN
  -- Calculate total value in USD
  SELECT COALESCE(SUM(CAST(value_usd AS numeric)), 0)
  INTO total_value
  FROM reserve_assets;
  
  -- Get total supply from latest entry (or use 0 if none exists)
  SELECT COALESCE(CAST(total_supply_gsdt AS numeric), 0)
  INTO total_supply
  FROM reserve_summary
  ORDER BY last_updated DESC
  LIMIT 1;
  
  -- Calculate backing ratio (default to 1 if total_supply is 0)
  IF total_supply = 0 THEN
    backing := 1;
  ELSE
    backing := total_value / total_supply;
  END IF;
  
  -- Update reserve summary
  INSERT INTO reserve_summary (
    total_value_usd,
    total_supply_gsdt,
    backing_ratio,
    last_updated
  )
  VALUES (
    total_value::text,
    total_supply::text,
    backing::text,
    now()
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update custodian totals
CREATE OR REPLACE FUNCTION update_custodian_totals()
RETURNS TRIGGER AS $$
DECLARE
  custodian_total numeric;
BEGIN
  -- Calculate total value for the custodian
  SELECT COALESCE(SUM(CAST(value_usd AS numeric)), 0)
  INTO custodian_total
  FROM reserve_assets
  WHERE custodian = NEW.custodian;
  
  -- Update or insert custodian record
  INSERT INTO custodians (
    name,
    total_value_usd,
    updated_at
  )
  VALUES (
    NEW.custodian,
    custodian_total::text,
    now()
  )
  ON CONFLICT (name) DO UPDATE
  SET
    total_value_usd = EXCLUDED.total_value_usd,
    updated_at = EXCLUDED.updated_at;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_reserve_summary_trigger ON reserve_assets;
CREATE TRIGGER update_reserve_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON reserve_assets
FOR EACH STATEMENT
EXECUTE FUNCTION update_reserve_summary();

DROP TRIGGER IF EXISTS update_custodian_totals_trigger ON reserve_assets;
CREATE TRIGGER update_custodian_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON reserve_assets
FOR EACH ROW
EXECUTE FUNCTION update_custodian_totals();

-- Add unique constraint on custodian name
ALTER TABLE custodians ADD CONSTRAINT custodians_name_key UNIQUE (name);

-- Insert some initial custodians if they don't exist
INSERT INTO custodians (name, total_value_usd, last_audit, audit_url)
VALUES
  ('Fireblocks', '0', now(), 'https://example.com/fireblocks-audit'),
  ('BitGo', '0', now(), 'https://example.com/bitgo-audit'),
  ('Copper', '0', now(), 'https://example.com/copper-audit')
ON CONFLICT (name) DO NOTHING;