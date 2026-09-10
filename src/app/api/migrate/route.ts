export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// Temporary migration endpoint - runs migration v2 SQL via Supabase rpc
export async function POST(req: NextRequest) {
  // Only allow with admin cookie
  const cookie = req.cookies.get('skyroute_user');
  if (!cookie || cookie.value !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const results: string[] = [];

  // 1. Create users table
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'ramp' CHECK (role IN ('admin', 'ramp', 'cargo')),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  });
  if (e1) results.push(`users table: ${e1.message}`); else results.push('users table: OK');

  // 2. Seed users
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `INSERT INTO users (username, password, role, active) VALUES
      ('admin', 'skyroute2024', 'admin', true),
      ('ramp', 'ramp2025', 'ramp', true),
      ('cargo', 'cargo2024', 'cargo', true)
    ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;`
  });
  if (e2) results.push(`seed users: ${e2.message}`); else results.push('seed users: OK');

  // 3. Create settings table
  const { error: e3 } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );`
  });
  if (e3) results.push(`settings table: ${e3.message}`); else results.push('settings table: OK');

  // 4. Seed settings
  const { error: e4 } = await supabase.rpc('exec_sql', {
    sql: `INSERT INTO settings (key, value) VALUES
      ('notification_email', 'raf.rajkowski@dnata.com'),
      ('smtp_host', ''),
      ('smtp_port', '587'),
      ('smtp_user', ''),
      ('smtp_password', ''),
      ('from_email', 'noreply@skyroute.uk'),
      ('from_name', 'SkyRoute C209/C208 System')
    ON CONFLICT (key) DO NOTHING;`
  });
  if (e4) results.push(`seed settings: ${e4.message}`); else results.push('seed settings: OK');

  // 5. Add columns to entries
  const { error: e5 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE entries
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ok',
      ADD COLUMN IF NOT EXISTS seals_intact BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS all_parts_returned BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS items_returned BOOLEAN DEFAULT true;`
  });
  if (e5) results.push(`entries columns: ${e5.message}`); else results.push('entries columns: OK');

  // 6. Drop unique constraint
  const { error: e6 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_c209_number_key;`
  });
  if (e6) results.push(`drop constraint: ${e6.message}`); else results.push('drop constraint: OK');

  return NextResponse.json({ success: true, results });
}
