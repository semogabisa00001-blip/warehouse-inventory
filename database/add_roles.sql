-- Add Role-Based Access Control to Mini Warehouse System

-- 1. Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('administrator', 'user'));

-- 2. Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. Update RLS policies to include role-based access

-- Categories: Only administrators can edit/delete
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

CREATE POLICY "Administrators can update categories" ON categories 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete categories" ON categories 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- Parts: Only administrators can edit/delete
DROP POLICY IF EXISTS "Authenticated users can update parts" ON parts;
DROP POLICY IF EXISTS "Authenticated users can delete parts" ON parts;

CREATE POLICY "Administrators can update parts" ON parts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete parts" ON parts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- Inbound: Only administrators can edit/delete
DROP POLICY IF EXISTS "Authenticated users can update inbound headers" ON inbound_headers;
DROP POLICY IF EXISTS "Authenticated users can delete inbound headers" ON inbound_headers;
DROP POLICY IF EXISTS "Authenticated users can update inbound details" ON inbound_details;
DROP POLICY IF EXISTS "Authenticated users can delete inbound details" ON inbound_details;

CREATE POLICY "Administrators can update inbound headers" ON inbound_headers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete inbound headers" ON inbound_headers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can update inbound details" ON inbound_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete inbound details" ON inbound_details 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- Outbound: Only administrators can edit/delete
DROP POLICY IF EXISTS "Authenticated users can update outbound headers" ON outbound_headers;
DROP POLICY IF EXISTS "Authenticated users can delete outbound headers" ON outbound_headers;
DROP POLICY IF EXISTS "Authenticated users can update outbound details" ON outbound_details;
DROP POLICY IF EXISTS "Authenticated users can delete outbound details" ON outbound_details;

CREATE POLICY "Administrators can update outbound headers" ON outbound_headers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete outbound headers" ON outbound_headers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can update outbound details" ON outbound_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Administrators can delete outbound details" ON outbound_details 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

-- Profiles: Only administrators can update other users' roles
CREATE POLICY "Administrators can update user roles" ON profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR -- Users can update their own profile
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrator'
    )
  );

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

-- Function to make first user administrator (run once manually)
CREATE OR REPLACE FUNCTION make_first_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET role = 'administrator' 
  WHERE email = user_email;
  
  RAISE NOTICE 'User % is now an administrator', user_email;
END;
$$ LANGUAGE plpgsql;

-- INSTRUCTIONS TO CREATE FIRST ADMINISTRATOR:
-- After first user logs in and creates profile, run this in SQL Editor:
-- SELECT make_first_admin('your-email@gmail.com');
-- Replace 'your-email@gmail.com' with the actual email of first admin

-- Example:
-- SELECT make_first_admin('admin@company.com');
