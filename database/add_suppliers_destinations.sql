-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Allow all authenticated users to read suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow administrators to insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Allow administrators to update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Allow administrators to delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

-- Create policies for destinations
CREATE POLICY "Allow all authenticated users to read destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow administrators to insert destinations"
  ON destinations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Allow administrators to update destinations"
  ON destinations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Allow administrators to delete destinations"
  ON destinations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );

-- Insert some default suppliers
INSERT INTO suppliers (supplier_name) VALUES
  ('PT. Maju Mundur'),
  ('CV. Jaya Abadi'),
  ('PT. Sukses Makmur')
ON CONFLICT (supplier_name) DO NOTHING;

-- Insert some default destinations
INSERT INTO destinations (destination_name) VALUES
  ('THIESS'),
  ('REMAN'),
  ('Workshop A'),
  ('Workshop B')
ON CONFLICT (destination_name) DO NOTHING;
