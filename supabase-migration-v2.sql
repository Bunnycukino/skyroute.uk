-- SkyRoute.uk - Migration V2
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT)

-- ============================================================
-- Users table — replaces hardcoded auth
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'ramp' CHECK (role IN ('admin', 'ramp', 'cargo')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default users (update if already exist)
INSERT INTO users (username, password, role, active) VALUES
  ('admin', 'skyroute2024', 'admin', true),
  ('ramp', 'ramp2025', 'ramp', true),
  ('cargo', 'cargo2024', 'cargo', true)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- ============================================================
-- Settings table — key-value store for system config
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('notification_email', 'raf.rajkowski@dnata.com'),
  ('smtp_host', ''),
  ('smtp_port', '587'),
  ('smtp_user', ''),
  ('smtp_password', ''),
  ('from_email', 'noreply@skyroute.uk'),
  ('from_name', 'SkyRoute C209/C208 System')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Add check fields to entries table
-- ============================================================
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS seals_intact BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS all_parts_returned BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS items_returned BOOLEAN DEFAULT true;

-- ============================================================
-- Remove unique constraint on c209_number (allows multiple NEW BUILD)
-- ============================================================
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_c209_number_key;
