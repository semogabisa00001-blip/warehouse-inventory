-- ============================================
-- COMPLETE DATABASE SCHEMA
-- Mini Warehouse Inventory Management System
-- ============================================

-- 1. CREATE TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('administrator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inbound Headers table
CREATE TABLE IF NOT EXISTS inbound_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_number TEXT UNIQUE NOT NULL,
  inbound_date DATE NOT NULL,
  supplier TEXT NOT NULL,
  inbound_user TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inbound Details table
CREATE TABLE IF NOT EXISTS inbound_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_header_id UUID REFERENCES inbound_headers(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outbound Headers table
CREATE TABLE IF NOT EXISTS outbound_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_number TEXT UNIQUE NOT NULL,
  outbound_date DATE NOT NULL,
  destination TEXT NOT NULL,
  outbound_user TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outbound Details table
CREATE TABLE IF NOT EXISTS outbound_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_header_id UUID REFERENCES outbound_headers(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_inbound_details_header ON inbound_details(inbound_header_id);
CREATE INDEX IF NOT EXISTS idx_inbound_details_part ON inbound_details(part_id);
CREATE INDEX IF NOT EXISTS idx_outbound_details_header ON outbound_details(outbound_header_id);
CREATE INDEX IF NOT EXISTS idx_outbound_details_part ON outbound_details(part_id);

-- ============================================
-- 3. CREATE FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is administrator
CREATE OR REPLACE FUNCTION is_administrator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'administrator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to make first user administrator
CREATE OR REPLACE FUNCTION make_first_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET role = 'administrator' 
  WHERE email = user_email;
  
  RAISE NOTICE 'User % is now an administrator', user_email;
END;
$$ LANGUAGE plpgsql;

-- Function to validate stock before outbound
CREATE OR REPLACE FUNCTION validate_outbound_stock()
RETURNS TRIGGER AS $$
DECLARE
  current_stock INTEGER;
  inbound_total INTEGER;
  outbound_total INTEGER;
BEGIN
  -- Calculate current stock
  SELECT COALESCE(SUM(qty), 0) INTO inbound_total
  FROM inbound_details
  WHERE part_id = NEW.part_id;
  
  SELECT COALESCE(SUM(qty), 0) INTO outbound_total
  FROM outbound_details
  WHERE part_id = NEW.part_id
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  current_stock := inbound_total - outbound_total;
  
  -- Check if sufficient stock
  IF current_stock < NEW.qty THEN
    RAISE EXCEPTION 'Insufficient stock for part. Available: %, Requested: %', current_stock, NEW.qty;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGERS
-- ============================================

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger for stock validation on outbound
DROP TRIGGER IF EXISTS validate_outbound_stock_trigger ON outbound_details;
CREATE TRIGGER validate_outbound_stock_trigger
  BEFORE INSERT OR UPDATE ON outbound_details
  FOR EACH ROW
  EXECUTE FUNCTION validate_outbound_stock();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_details ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Administrators can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- PARTS POLICIES
CREATE POLICY "Anyone can view parts"
  ON parts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert parts"
  ON parts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update parts"
  ON parts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete parts"
  ON parts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- INBOUND HEADERS POLICIES
CREATE POLICY "Anyone can view inbound headers"
  ON inbound_headers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert inbound headers"
  ON inbound_headers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update inbound headers"
  ON inbound_headers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete inbound headers"
  ON inbound_headers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- INBOUND DETAILS POLICIES
CREATE POLICY "Anyone can view inbound details"
  ON inbound_details FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert inbound details"
  ON inbound_details FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update inbound details"
  ON inbound_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete inbound details"
  ON inbound_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- OUTBOUND HEADERS POLICIES
CREATE POLICY "Anyone can view outbound headers"
  ON outbound_headers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert outbound headers"
  ON outbound_headers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update outbound headers"
  ON outbound_headers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete outbound headers"
  ON outbound_headers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- OUTBOUND DETAILS POLICIES
CREATE POLICY "Anyone can view outbound details"
  ON outbound_details FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert outbound details"
  ON outbound_details FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Administrators can update outbound details"
  ON outbound_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete outbound details"
  ON outbound_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- NEXT STEPS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Login to your app with Google
-- 3. Run: SELECT make_first_admin('your-email@gmail.com');
-- 4. Refresh and you'll be administrator!
