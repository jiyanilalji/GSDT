/*
  # Reserve Management Schema Setup

  1. New Tables
    - `reserve_summary`
      - `id` (uuid, primary key)
      - `total_value_usd` (text, not null) - Total value of all reserves in USD
      - `total_supply_gsdt` (text, not null) - Total supply of GSDT tokens
      - `backing_ratio` (text, not null) - Ratio of reserves to token supply
      - `last_updated` (timestamptz, not null) - Last update timestamp
    
    - `custodians`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of the custodian
      - `total_value_usd` (text, not null) - Total value of assets under custody
      - `last_audit` (timestamptz) - Date of last audit
      - `audit_url` (text) - URL to audit report
      - `created_at` (timestamptz, not null)
      - `updated_at` (timestamptz, not null)

  2. Security
    - Enable RLS on both tables
    - Public read access for both tables
    - Admin write access for both tables
    - Indexes for efficient querying

  3. Changes
    - Add foreign key from reserve_assets to custodians
    - Add indexes for common query patterns
*/

-- Create reserve_summary table
CREATE TABLE IF NOT EXISTS reserve_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_value_usd text NOT NULL,
  total_supply_gsdt text NOT NULL,
  backing_ratio text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now()
);

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

-- Add foreign key to reserve_assets table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'reserve_assets'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'reserve_assets' 
      AND column_name = 'custodian_id'
    ) THEN
      ALTER TABLE reserve_assets 
      ADD COLUMN custodian_id uuid REFERENCES custodians(id);
      
      -- Update existing records to use the custodian name to link to new custodian records
      -- This ensures data consistency during migration
      CREATE TEMPORARY TABLE temp_custodians AS
      SELECT DISTINCT custodian as name FROM reserve_assets;
      
      INSERT INTO custodians (name, total_value_usd)
      SELECT name, '0'
      FROM temp_custodians;
      
      UPDATE reserve_assets ra
      SET custodian_id = c.id
      FROM custodians c
      WHERE ra.custodian = c.name;
      
      DROP TABLE temp_custodians;
    END IF;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reserve_summary_last_updated 
ON reserve_summary(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_custodians_name 
ON custodians(name);

CREATE INDEX IF NOT EXISTS idx_custodians_last_audit 
ON custodians(last_audit DESC);

-- Enable RLS
ALTER TABLE reserve_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE custodians ENABLE ROW LEVEL SECURITY;

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

-- Insert initial reserve summary record
INSERT INTO reserve_summary (total_value_usd, total_supply_gsdt, backing_ratio)
SELECT 
  COALESCE(SUM(value_usd::numeric)::text, '0'),
  '0',
  '1.0'
FROM reserve_assets
ON CONFLICT DO NOTHING;