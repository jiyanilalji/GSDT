-- Create crypto_payments table first
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
  CONSTRAINT status_check CHECK (status IN ('waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'))
);

-- Enable RLS
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_crypto_payments_updated_at
  BEFORE UPDATE
  ON crypto_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crypto_payments' AND policyname = 'crypto_payments_select_policy'
  ) THEN
    DROP POLICY crypto_payments_select_policy ON crypto_payments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crypto_payments' AND policyname = 'crypto_payments_insert_policy'
  ) THEN
    DROP POLICY crypto_payments_insert_policy ON crypto_payments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crypto_payments' AND policyname = 'crypto_payments_service_role_policy'
  ) THEN
    DROP POLICY crypto_payments_service_role_policy ON crypto_payments;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "crypto_payments_select_policy"
  ON crypto_payments
  FOR SELECT
  USING (user_address = auth.uid()::text);

CREATE POLICY "crypto_payments_insert_policy"
  ON crypto_payments
  FOR INSERT
  WITH CHECK (user_address = auth.uid()::text);

CREATE POLICY "crypto_payments_service_role_policy"
  ON crypto_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user_address ON crypto_payments(user_address);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_payment_id ON crypto_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created_at ON crypto_payments(created_at DESC);

-- Add comment
COMMENT ON TABLE crypto_payments IS 'Stores cryptocurrency payment transactions processed through NowPayments';