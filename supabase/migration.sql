-- ============================================
-- DailyShenanigans - Supabase Migration
-- Run this in the Supabase Dashboard SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================

-- Entries table (mirrors the app's entry data model)
CREATE TABLE entries (
  id TEXT PRIMARY KEY,                          -- YYYY-MM-DD date string
  date TEXT NOT NULL UNIQUE,                    -- same as id
  todos JSONB DEFAULT '[]'::jsonb,              -- [{text: string, done: boolean}]
  pesquisa TEXT DEFAULT '',                     -- research notes
  dev TEXT DEFAULT '',                          -- development logs
  notas TEXT DEFAULT '',                        -- free-form notes
  conquistas JSONB DEFAULT '[]'::jsonb,         -- [string] achievements
  mood TEXT DEFAULT '',                         -- emoji mood
  tags JSONB DEFAULT '[]'::jsonb,               -- [string] tags
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entries_date ON entries(date DESC);
CREATE INDEX idx_entries_user ON entries(user_id);

-- Auto-update updated_at timestamp on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security: each user can only access their own entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);
