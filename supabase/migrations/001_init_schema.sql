-- Create users table
-- id can be null for device-only users (without Supabase auth)
-- device_id is primary key for device-only users, id is for authenticated users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  age_group TEXT NOT NULL CHECK (age_group IN ('G1', 'G2', 'G3', 'G4', 'G5')),
  nickname TEXT NOT NULL,
  age INTEGER,
  parent_email TEXT,
  profile_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add device_id column and migrate primary key (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'device_id'
  ) THEN
    -- Add device_id column (nullable first, we'll populate it)
    ALTER TABLE users ADD COLUMN device_id TEXT;
    
    -- Generate device_id for existing users if they don't have one
    UPDATE users SET device_id = 'device_' || gen_random_uuid()::text WHERE device_id IS NULL;
    
    -- Make device_id NOT NULL and UNIQUE
    ALTER TABLE users ALTER COLUMN device_id SET NOT NULL;
    ALTER TABLE users ADD CONSTRAINT users_device_id_unique UNIQUE (device_id);
    
    -- Drop foreign key constraints that depend on primary key
    ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;
    ALTER TABLE drawings DROP CONSTRAINT IF EXISTS drawings_user_id_fkey;
    
    -- Drop existing primary key
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
    
    -- Set device_id as primary key
    ALTER TABLE users ADD PRIMARY KEY (device_id);
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
    CREATE INDEX IF NOT EXISTS idx_users_id ON users(id) WHERE id IS NOT NULL;
    
    -- Migrate game_sessions: rename user_id to user_device_id if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'game_sessions' AND column_name = 'user_id'
    ) THEN
      -- Drop existing policies that depend on user_id
      DROP POLICY IF EXISTS "Users can view their own sessions" ON game_sessions;
      DROP POLICY IF EXISTS "Users can create their own sessions" ON game_sessions;
      DROP POLICY IF EXISTS "Users can update their own sessions" ON game_sessions;
      
      -- Add new column
      ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS user_device_id TEXT;
      -- Migrate data: find device_id from users table
      UPDATE game_sessions 
      SET user_device_id = (
        SELECT device_id FROM users WHERE users.id = game_sessions.user_id LIMIT 1
      )
      WHERE user_device_id IS NULL;
      -- Drop old column
      ALTER TABLE game_sessions DROP COLUMN IF EXISTS user_id;
      -- Add foreign key constraint
      ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_user_device_id_fkey 
        FOREIGN KEY (user_device_id) REFERENCES users(device_id) ON DELETE CASCADE;
    END IF;
    
    -- Migrate drawings: rename user_id to user_device_id if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'drawings' AND column_name = 'user_id'
    ) THEN
      -- Drop existing policies that depend on user_id
      DROP POLICY IF EXISTS "Users can view their own drawings" ON drawings;
      DROP POLICY IF EXISTS "Users can create their own drawings" ON drawings;
      
      -- Add new column
      ALTER TABLE drawings ADD COLUMN IF NOT EXISTS user_device_id TEXT;
      -- Migrate data: find device_id from users table
      UPDATE drawings 
      SET user_device_id = (
        SELECT device_id FROM users WHERE users.id = drawings.user_id LIMIT 1
      )
      WHERE user_device_id IS NULL;
      -- Drop old column
      ALTER TABLE drawings DROP COLUMN IF EXISTS user_id;
      -- Add foreign key constraint
      ALTER TABLE drawings ADD CONSTRAINT drawings_user_device_id_fkey 
        FOREIGN KEY (user_device_id) REFERENCES users(device_id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create game_sessions table
-- user_device_id references users.device_id (works for both authenticated and device-only users)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id TEXT NOT NULL REFERENCES users(device_id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('questions', 'drawing', 'logic', 'memory')),
  age_group TEXT NOT NULL CHECK (age_group IN ('G1', 'G2', 'G3', 'G4', 'G5')),
  score INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_questions_cache table
CREATE TABLE IF NOT EXISTS ai_questions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT NOT NULL CHECK (age_group IN ('G1', 'G2', 'G3', 'G4', 'G5')),
  question JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_count INTEGER DEFAULT 0
);

-- Create drawings table
-- user_device_id references users.device_id (works for both authenticated and device-only users)
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id TEXT NOT NULL REFERENCES users(device_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_device_id ON game_sessions(user_device_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_questions_cache_age_group ON ai_questions_cache(age_group);
CREATE INDEX IF NOT EXISTS idx_drawings_user_device_id ON drawings(user_device_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
-- Drop user policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Anonymous users can insert their profile" ON users;
DROP POLICY IF EXISTS "Device can view own profile" ON users;
DROP POLICY IF EXISTS "Device can insert profile with device_id" ON users;
DROP POLICY IF EXISTS "Device can update own profile by device_id" ON users;

-- Drop game_sessions policies (they might reference user_id)
DROP POLICY IF EXISTS "Users can view their own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON game_sessions;

-- Drop drawings policies (they might reference user_id)
DROP POLICY IF EXISTS "Users can view their own drawings" ON drawings;
DROP POLICY IF EXISTS "Users can create their own drawings" ON drawings;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR device_id IS NOT NULL);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anonymous users can insert their profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow device_id based access (for users without auth)
CREATE POLICY "Device can view own profile"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Device can insert profile with device_id"
  ON users FOR INSERT
  WITH CHECK (device_id IS NOT NULL);

CREATE POLICY "Device can update own profile by device_id"
  ON users FOR UPDATE
  USING (true);

-- RLS Policies for game_sessions table
-- Allow access by device_id (works for both authenticated and device-only users)
CREATE POLICY "Users can view their own sessions"
  ON game_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.device_id = game_sessions.user_device_id 
      AND (auth.uid() = users.id OR users.id IS NULL)
    )
  );

CREATE POLICY "Users can create their own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.device_id = game_sessions.user_device_id 
      AND (auth.uid() = users.id OR users.id IS NULL)
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON game_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.device_id = game_sessions.user_device_id 
      AND (auth.uid() = users.id OR users.id IS NULL)
    )
  );

-- RLS Policies for drawings table
-- Allow access by device_id (works for both authenticated and device-only users)
CREATE POLICY "Users can view their own drawings"
  ON drawings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.device_id = drawings.user_device_id 
      AND (auth.uid() = users.id OR users.id IS NULL)
    )
  );

CREATE POLICY "Users can create their own drawings"
  ON drawings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.device_id = drawings.user_device_id 
      AND (auth.uid() = users.id OR users.id IS NULL)
    )
  );

-- RLS Policies for ai_questions_cache table (public read)
DROP POLICY IF EXISTS "Everyone can view cached questions" ON ai_questions_cache;
CREATE POLICY "Everyone can view cached questions"
  ON ai_questions_cache FOR SELECT
  USING (true);

-- Create a storage bucket for drawings
INSERT INTO storage.buckets (id, name) VALUES ('drawings', 'drawings') ON CONFLICT DO NOTHING;

-- RLS Policy for storage bucket
DROP POLICY IF EXISTS "Users can upload their own drawings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own drawings in storage" ON storage.objects;

CREATE POLICY "Users can upload their own drawings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own drawings in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);
