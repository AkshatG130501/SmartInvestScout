import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkSupabaseSetup() {
  console.log('Checking Supabase setup...');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL environment variable is missing');
    return;
  } else {
    console.log('✅ SUPABASE_URL is set');
  }
  
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_KEY environment variable is missing');
    return;
  } else {
    console.log('✅ SUPABASE_SERVICE_KEY is set');
  }
  
  // Try to connect to Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Attempting to connect to Supabase...');
    
    // Check if the user_profiles table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing user_profiles table:', error.message);
      console.log('\nPossible solutions:');
      console.log('1. Create the user_profiles table in your Supabase project');
      console.log('2. Check if the service key has the necessary permissions');
      return;
    }
    
    console.log('✅ Successfully connected to Supabase and accessed user_profiles table');
    console.log(`Found ${data.length} existing profiles`);
    
    // Check table structure
    console.log('\nChecking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError.message);
      return;
    }
    
    // Check for required columns
    const requiredColumns = [
      'id', 
      'user_id', 
      'risk_appetite', 
      'investment_goals', 
      'watchlist', 
      'holdings', 
      'created_at', 
      'updated_at'
    ];
    
    const missingColumns = requiredColumns.filter(
      col => !columns.some((c: any) => c.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing required columns:', missingColumns.join(', '));
      console.log('\nPlease create the user_profiles table with the following SQL:');
      console.log(`
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_appetite TEXT NOT NULL,
  investment_goals JSONB NOT NULL,
  watchlist JSONB NOT NULL,
  holdings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profiles"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to get table columns (used for diagnostics)
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.column_name::text, c.data_type::text
  FROM information_schema.columns c
  WHERE c.table_name = table_name
  ORDER BY c.ordinal_position;
END;
$$;
      `);
      return;
    }
    
    console.log('✅ All required columns exist in the user_profiles table');
    console.log('\nSupabase setup looks good! 🎉');
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
    return;
  }
}

checkSupabaseSetup().catch(console.error);
