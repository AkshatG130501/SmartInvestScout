# Supabase Migration Instructions for Search History

## Overview

This document provides instructions for setting up the search history functionality in your Supabase database. The search history feature requires a database table and proper indexes for efficient querying.

## Steps to Enable the Search Feature

### 1. Create the Search History Table

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add a constraint to limit duplicate searches by the same user
  CONSTRAINT unique_user_query UNIQUE (user_id, query)
);

-- Create basic indexes for faster searches
CREATE INDEX IF NOT EXISTS search_history_query_btree_idx ON search_history (query);
CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON search_history (user_id);
CREATE INDEX IF NOT EXISTS search_history_timestamp_idx ON search_history (timestamp DESC);

-- Add RLS policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own search history
CREATE POLICY "Users can view their own search history"
  ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own search history
CREATE POLICY "Users can insert their own search history"
  ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for anonymous searches (no user_id)
CREATE POLICY "Anonymous searches are accessible"
  ON search_history
  FOR SELECT
  USING (user_id IS NULL);

-- Grant permissions to authenticated and anon roles
GRANT SELECT ON search_history TO authenticated, anon;
GRANT INSERT ON search_history TO authenticated, anon;
```

### 2. Enable the pg_trgm Extension (Optional but Recommended)

For better text search performance, enable the `pg_trgm` extension through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Database → Extensions
3. Find `pg_trgm` in the list and enable it
4. After enabling the extension, run this SQL to create a trigram index:

```sql
-- Create trigram index for better text search (only after enabling pg_trgm extension)
CREATE INDEX IF NOT EXISTS search_history_query_trgm_idx ON search_history USING gin (query gin_trgm_ops);
```

## Troubleshooting

If you encounter any issues with the migration:

1. **Error with gin_trgm_ops**: This means the pg_trgm extension is not enabled. Follow step 2 above.

2. **Permission issues**: Make sure you're running the SQL as the project owner or with sufficient privileges.

3. **Unique constraint violations**: If you're getting errors about duplicate entries, you may need to clean up existing data first:

```sql
DELETE FROM search_history;
```

## Testing the Setup

After completing the migration, you can test the setup with:

```bash
npm run test:search
```

This will run a test script that verifies the search suggestions functionality is working correctly.
