/*
  # Create Exchange Rates System

  1. Changes
    - Create exchange_rates table
    - Add RLS policies
    - Add conditional index creation
    - Add trigger for last_updated
  
  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin management
*/

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_from text NOT NULL,
  currency_to text NOT NULL,
  rate numeric NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_rate CHECK (rate > 0)
);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_exchange_rates_currencies'
  ) THEN
    CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_exchange_rates_last_updated'
  ) THEN
    CREATE INDEX idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to exchange_rates" ON exchange_rates;
DROP POLICY IF EXISTS "Allow admins to manage exchange_rates" ON exchange_rates;

-- Create policies
CREATE POLICY "Allow public read access to exchange_rates"
  ON exchange_rates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage exchange_rates"
  ON exchange_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN', 'PRICE_UPDATER')
    )
  );

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_exchange_rates_last_updated ON exchange_rates;

CREATE TRIGGER update_exchange_rates_last_updated
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();