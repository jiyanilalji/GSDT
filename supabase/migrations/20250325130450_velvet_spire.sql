/*
  # Create CMS Pages Table

  1. New Table
    - `cms_pages`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, not null, unique)
      - `content` (text, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz, not null)
      - `updated_at` (timestamptz, not null)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin management
*/

-- Create cms_pages table
CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'inactive',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('active', 'inactive'))
);

-- Enable RLS
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);
CREATE INDEX idx_cms_pages_created_at ON cms_pages(created_at DESC);

-- Create policies
CREATE POLICY "Allow public read access to active pages"
  ON cms_pages
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Allow admins to manage all pages"
  ON cms_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_address = (auth.uid())::text
      AND ar.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();