-- Add preferred_categories column to users table
-- This will store an array of category names that the user is interested in
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN users.preferred_categories IS 'Array of category names the user is interested in (e.g., ["matematik", "fen", "tarih"])';
