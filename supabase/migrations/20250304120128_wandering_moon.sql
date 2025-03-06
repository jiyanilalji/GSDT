/*
  # Add Crypto Payments Support

  1. New Tables
    - `crypto_payments`
      - `id` (uuid, primary key)
      - `payment_id` (text, unique) - NowPayments payment ID
      - `user_address` (text) - User's wallet address
      - `amount` (numeric) - Payment amount
      - `currency` (text) - Payment currency
      - `status` (text) - Payment status
      - `order_id` (text) - Order reference
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `payment_data` (jsonb) - Full payment data from NowPayments

  2. Security
    - Enable RLS on `crypto_payments` table
    - Add policies for users to read their own payments
    - Add policies for service role to manage all payments
*/

-- Create crypto_payments table
CREATE TABLE IF NOT EXISTS crypto_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text UNIQUE NOT NULL,
  user_address text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  order_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  payment_data jsonb,
  CONSTRAINT status_check CHECK (status IN ('pending', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'))
);

-- Enable RLS
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own payments"
  ON crypto_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Service role can manage all payments"
  ON crypto_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_crypto_payments_user_address ON crypto_payments(user_address);
CREATE INDEX idx_crypto_payments_payment_id ON crypto_payments(payment_id);
CREATE INDEX idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX idx_crypto_payments_created_at ON crypto_payments(created_at DESC);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crypto_payments_updated_at
  BEFORE UPDATE
  ON crypto_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE crypto_payments IS 'Stores cryptocurrency payment transactions processed through NowPayments';