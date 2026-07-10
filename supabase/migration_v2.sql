-- ============================================
-- DailyShenanigans - Migration v2 (idempotent)
-- Run this in the Supabase Dashboard SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
--
-- Safe to run on a FRESH project (creates everything)
-- or on an existing one (only adds what's missing).
-- ============================================

-- ─── Shared updated_at trigger function ─────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Entries (daily diary) ──────────────────────────
CREATE TABLE IF NOT EXISTS entries (
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

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC);

-- NEW: single long-form diary text (the "log book" field)
ALTER TABLE entries ADD COLUMN IF NOT EXISTS diario TEXT DEFAULT '';

-- One-time merge: fold old sectioned content into diario
UPDATE entries
SET diario = trim(both e'\n' FROM concat_ws(
  e'\n\n',
  CASE WHEN nullif(trim(pesquisa), '') IS NOT NULL THEN '📚 Pesquisa:' || e'\n' || trim(pesquisa) END,
  CASE WHEN nullif(trim(dev), '') IS NOT NULL THEN '💻 Dev:' || e'\n' || trim(dev) END,
  CASE WHEN nullif(trim(notas), '') IS NOT NULL THEN '📝 Notas:' || e'\n' || trim(notas) END
))
WHERE coalesce(trim(diario), '') = ''
  AND (nullif(trim(pesquisa), '') IS NOT NULL
    OR nullif(trim(dev), '') IS NOT NULL
    OR nullif(trim(notas), '') IS NOT NULL);

DROP TRIGGER IF EXISTS entries_updated_at ON entries;
CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Monthly reports ────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_reports (
  id TEXT PRIMARY KEY,                 -- 'YYYY-MM'
  month TEXT NOT NULL UNIQUE,
  narrative TEXT DEFAULT '',
  highlights JSONB DEFAULT '[]'::jsonb,
  todos_created INTEGER DEFAULT 0,
  todos_done INTEGER DEFAULT 0,
  completion_rate INTEGER DEFAULT 0,
  days_logged INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  conquistas_total INTEGER DEFAULT 0,
  conquistas_list JSONB DEFAULT '[]'::jsonb,
  mood_distribution JSONB DEFAULT '{}'::jsonb,
  top_mood TEXT DEFAULT '',
  word_cloud JSONB DEFAULT '[]'::jsonb,
  pesquisa_chars INTEGER DEFAULT 0,
  dev_chars INTEGER DEFAULT 0,
  notas_chars INTEGER DEFAULT 0,
  is_auto_generated BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE monthly_reports ADD COLUMN IF NOT EXISTS diario_chars INTEGER DEFAULT 0;

DROP TRIGGER IF EXISTS monthly_reports_updated_at ON monthly_reports;
CREATE TRIGGER monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Workouts (daily calisthenics log) ──────────────
-- One row per day. exercises = { "<exercise_id>": { "sets": 2, "done": true } }
-- stretches = { "<stretch_id>": true }
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,                 -- same as date
  date TEXT NOT NULL UNIQUE,
  weight NUMERIC(5,2),
  wellness INTEGER CHECK (wellness BETWEEN 1 AND 5),
  notes TEXT DEFAULT '',
  exercises JSONB DEFAULT '{}'::jsonb,
  stretches JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);

DROP TRIGGER IF EXISTS workouts_updated_at ON workouts;
CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Single-user app: anon key has full access ──────
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
