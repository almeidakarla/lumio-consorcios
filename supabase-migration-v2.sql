-- ============================================
-- LUMIO CRM SCHEMA UPDATE - V2
-- Run this in Supabase Dashboard > SQL Editor
-- This updates the leads table to match the new column structure
-- ============================================

-- 1. Add new columns: broker, origin
ALTER TABLE leads ADD COLUMN IF NOT EXISTS broker TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origin TEXT;

-- 2. Rename rent_value to value (if rent_value exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'rent_value') THEN
    ALTER TABLE leads RENAME COLUMN rent_value TO value;
  END IF;
END $$;

-- 3. Add value column if it doesn't exist (in case rent_value wasn't there)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS value NUMERIC;

-- 4. Drop notes column if it exists
ALTER TABLE leads DROP COLUMN IF EXISTS notes;

-- ============================================
-- MIGRATION V2 COMPLETE
-- New columns: broker, origin, value
-- Removed columns: notes, rent_value (renamed to value)
-- ============================================
