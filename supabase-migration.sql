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

-- ============================================================
-- NEW: Outbound (C208/logistic) columns
-- Mirrors VBA LOG sheet columns 10-16 (COL_NEW_DATE to COL_NEW_SIGN)
-- These are set when a RAMP entry is updated with logistic data
-- ============================================================
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS outbound_flight TEXT,
  ADD COLUMN IF NOT EXISTS outbound_signature TEXT,
  ADD COLUMN IF NOT EXISTS outbound_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS outbound_month_year TEXT,
  ADD COLUMN IF NOT EXISTS outbound_bar_number TEXT,
  ADD COLUMN IF NOT EXISTS outbound_pieces INTEGER,
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

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
-- id                  SERIAL PRIMARY KEY
-- type                TEXT ('ramp_input' | 'logistic_input')
-- c209_number         TEXT e.g. 'FEB0001' or 'NEW BUILD'
-- c208_number         TEXT e.g. 'FEB0001' or 'RW' (null until logistic entry)
-- bar_number          TEXT e.g. 'TA2009'
-- container_code      TEXT (same as bar_number, kept for legacy)
-- flight_number       TEXT e.g. 'TOM123' (inbound flight from RAMP)
-- origin              TEXT e.g. 'MAN'
-- destination         TEXT e.g. 'DXB'
-- pieces              INTEGER
-- signature           TEXT e.g. 'RR' (inbound signature)
-- notes               TEXT
-- flags               TEXT
-- is_new_build        BOOLEAN DEFAULT FALSE
-- is_rw_flight        BOOLEAN DEFAULT FALSE
-- month_year          TEXT e.g. 'FEB-26'
-- created_by          TEXT
-- created_at          TIMESTAMPTZ DEFAULT NOW()
-- outbound_flight     TEXT (C208 outbound flight number, mirrors VBA COL_NEW_FLIGHT)
-- outbound_signature  TEXT (C208 outbound signature, mirrors VBA COL_NEW_SIGN)
-- outbound_date       TIMESTAMPTZ (C208 outbound date, mirrors VBA COL_NEW_DATE)
-- outbound_month_year TEXT (mirrors VBA COL_NEW_MONTH)
-- outbound_bar_number TEXT (mirrors VBA COL_NEW_BAR_NUM)
-- outbound_pieces     INTEGER (mirrors VBA COL_NEW_PIECES)
-- updated_by          TEXT
-- updated_at          TIMESTAMPTZ

-- ============================================================
-- C209 Expiry Tracker (mirrors VBA SH_EXPIRY_TRACKER)
-- Tracks C209 numbers that haven't been used within 48h
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expiry_tracker (
  id BIGSERIAL PRIMARY KEY,
  c209_number TEXT NOT NULL,
  creation_date TIMESTAMPTZ NOT NULL,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired')),
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expiry_tracker_c209
  ON public.expiry_tracker (c209_number);

CREATE INDEX IF NOT EXISTS idx_expiry_tracker_status
  ON public.expiry_tracker (status);

-- ============================================================
-- Reallocation Register (mirrors VBA SH_REALLOCATION)
-- Auto-filled from entries table by C208 number lookup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reallocation_register (
  id BIGSERIAL PRIMARY KEY,
  bar_number TEXT,
  c209_number TEXT,
  flight TEXT,
  flight_date DATE,
  destination TEXT,
  c208_number TEXT,
  base TEXT,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realloc_c208
  ON public.reallocation_register (c208_number);

CREATE INDEX IF NOT EXISTS idx_realloc_c209
  ON public.reallocation_register (c209_number);
