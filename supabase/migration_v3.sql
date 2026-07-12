-- ============================================
-- DailyShenanigans - Migration v3 (idempotent)
-- Push notification subscriptions
-- Run in Supabase Dashboard > SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Single-user app: anon key has full access
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
