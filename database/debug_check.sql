-- ============================================
-- DEBUG: Check Database Setup
-- Run this to see what's wrong
-- ============================================

-- 1. Check if tables exist
SELECT 'Tables:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if trigger exists
SELECT 'Triggers:' as check_type;
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 3. Check if function exists
SELECT 'Functions:' as check_type;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'is_administrator', 'make_first_admin', 'validate_outbound_stock');

-- 4. Check profiles table structure
SELECT 'Profiles columns:' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Check if any users exist in auth.users
SELECT 'Auth users count:' as check_type;
SELECT COUNT(*) as user_count FROM auth.users;

-- 6. Check if any profiles exist
SELECT 'Profiles count:' as check_type;
SELECT COUNT(*) as profile_count FROM profiles;

-- 7. Test the trigger function manually
SELECT 'Testing handle_new_user function:' as check_type;
-- This will show if the function can be called
SELECT pg_get_functiondef('handle_new_user()'::regprocedure);
