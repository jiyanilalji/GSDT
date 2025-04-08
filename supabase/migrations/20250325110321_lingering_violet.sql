/*
  # Create Exchange Rates System

  1. New Tables
    - `exchange_rates`
      - `id` (uuid, primary key)
      - `currency_from` (text, not null)
      - `currency_to` (text, not null)
      - `rate` (numeric, not null)
      - `last_updated` (timestamptz, not null)
      - `created_at` (timestamptz, not null)

  2. Security
    - Enable RLS
    - Public read access
    - Admin write access
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

-- Create indexes
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);
CREATE INDEX idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);

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

-- Add trigger for last_updated
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exchange_rates_last_updated
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();