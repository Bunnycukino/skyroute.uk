-- SkyRoute.uk - Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================================
-- Add missing columns to 'entries' table
-- ============================================================

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS origin TEXT,
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS flags TEXT,
  ADD COLUMN IF NOT EXISTS is_rw_flight BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Backfill month_year for existing rows that don't have it
UPDATE entries
SET month_year = TO_CHAR(created_at, 'MON-YY')
WHERE month_year IS NULL;

-- ============================================================
-- Indexes for fast lookup (case-insensitive search)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_entries_c209_number ON entries (c209_number);
CREATE INDEX IF NOT EXISTS idx_entries_c208_number ON entries (c208_number);
CREATE INDEX IF NOT EXISTS idx_entries_month_year ON entries (month_year);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries (type);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries (created_at DESC);

-- ============================================================
-- Full table reference (expected schema after migration)
-- ============================================================
-- id              SERIAL PRIMARY KEY
-- type            TEXT  ('ramp_input' | 'logistic_input')
-- c209_number     TEXT  e.g. 'FEB0001'
-- c208_number     TEXT  e.g. 'FEB0001' (only on logistic_input)
-- bar_number      TEXT  e.g. 'TA2009'
-- container_code  TEXT  (same as bar_number, kept for legacy)
-- flight_number   TEXT  e.g. 'TOM123'
-- origin          TEXT  e.g. 'MAN'
-- destination     TEXT  e.g. 'DXB'
-- pieces          INTEGER
-- signature       TEXT  e.g. 'RR'
-- notes           TEXT
-- flags           TEXT  e.g. 'RW'
-- is_new_build    BOOLEAN DEFAULT FALSE
-- is_rw_flight    BOOLEAN DEFAULT FALSE
-- month_year      TEXT  e.g. 'FEB-26'
-- created_by      TEXT
-- created_at      TIMESTAMPTZ DEFAULT NOW()
