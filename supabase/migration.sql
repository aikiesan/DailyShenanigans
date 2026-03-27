-- ============================================
-- DailyShenanigans - Supabase Migration
-- Run this in the Supabase Dashboard SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================

-- Drop existing table if it was already created with user_id
DROP TABLE IF EXISTS entries;

-- Entries table (single-user, no auth needed)
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  todos JSONB DEFAULT '[]'::jsonb,
  pesquisa TEXT DEFAULT '',
  dev TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  conquistas JSONB DEFAULT '[]'::jsonb,
  mood TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_entries_date ON entries(date DESC);

-- Auto-update updated_at on every change
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

-- Single-user app: disable RLS, anon key has full access
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;
