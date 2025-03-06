-- Create fiat_mint_requests table
CREATE TABLE IF NOT EXISTS fiat_mint_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  payment_reference text NOT NULL,
  payment_proof_url text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  processed_at timestamptz,
  processed_by text,
  CONSTRAINT status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Enable RLS
ALTER TABLE fiat_mint_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own requests"
  ON fiat_mint_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Users can create own requests"
  ON fiat_mint_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Service role can manage all requests"
  ON fiat_mint_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_fiat_mint_requests_user_address ON fiat_mint_requests(user_address);
CREATE INDEX idx_fiat_mint_requests_status ON fiat_mint_requests(status);
CREATE INDEX idx_fiat_mint_requests_created_at ON fiat_mint_requests(created_at DESC);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fiat_mint_requests_updated_at
  BEFORE UPDATE
  ON fiat_mint_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE fiat_mint_requests IS 'Stores fiat payment requests for token minting';