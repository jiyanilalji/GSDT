/*
  # Add Initial Reserve Data

  1. Initial Data
    - Add sample reserve assets
    - Add initial reserve summary
    - Add sample custodian data

  2. Data Structure
    - Reserve assets with real-world examples
    - Realistic values and ratios
    - Proper timestamps and relationships
*/

-- Insert initial custodians
INSERT INTO custodians (id, name, total_value_usd, last_audit, audit_url, created_at, updated_at)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Fireblocks',
    '500000000',
    NOW() - INTERVAL '7 days',
    'https://fireblocks.com/audit/2025/q1',
    NOW(),
    NOW()
  ),
  (
    'a12bc45d-67ef-8901-2345-6789abcdef01',
    'BitGo',
    '300000000',
    NOW() - INTERVAL '14 days',
    'https://bitgo.com/audit/2025/q1',
    NOW(),
    NOW()
  ),
  (
    'b23cd56e-78fg-9012-3456-789abcdef012',
    'Copper',
    '200000000',
    NOW() - INTERVAL '21 days',
    'https://copper.co/audit/2025/q1',
    NOW(),
    NOW()
  );

-- Insert initial reserve assets
INSERT INTO reserve_assets (
  symbol,
  name,
  amount,
  value_usd,
  custodian,
  last_updated,
  audit_url,
  custodian_id
)
VALUES
  (
    'USDC',
    'USD Coin',
    '400000000',
    '400000000',
    'Fireblocks',
    NOW(),
    'https://www.circle.com/en/transparency',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  ),
  (
    'USDT',
    'Tether USD',
    '300000000',
    '300000000',
    'BitGo',
    NOW(),
    'https://tether.to/en/transparency',
    'a12bc45d-67ef-8901-2345-6789abcdef01'
  ),
  (
    'BUSD',
    'Binance USD',
    '200000000',
    '200000000',
    'Copper',
    NOW(),
    'https://www.binance.com/en/busd',
    'b23cd56e-78fg-9012-3456-789abcdef012'
  ),
  (
    'DAI',
    'Dai Stablecoin',
    '100000000',
    '100000000',
    'Fireblocks',
    NOW(),
    'https://daistats.com',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  );

-- Insert initial reserve summary
INSERT INTO reserve_summary (
  total_value_usd,
  total_supply_gsdt,
  backing_ratio,
  last_updated
)
VALUES
  (
    '1000000000',
    '950000000',
    '1.0526',
    NOW()
  );