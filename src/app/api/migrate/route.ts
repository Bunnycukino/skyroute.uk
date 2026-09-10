export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// Temporary migration endpoint - runs migration v2 SQL via Supabase REST API
export async function POST(req: NextRequest) {
  // Only allow with admin cookie
  const cookie = req.cookies.get('skyroute_user');
  if (!cookie || cookie.value !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase env vars not configured' }, { status: 500 });
  }

  // Supabase has a /pg/query endpoint that accepts raw SQL with service role key
  // We'll use the /rest/v1/ endpoint to create tables and insert data
  
  const results: string[] = [];

  // 1. Create users table via PostgREST (using the /rest/v1/ endpoint)
  // PostgREST doesn't support DDL, so we need to use the Supabase Management API or pg endpoint
  // Let's try the /pg/query endpoint (available in newer Supabase versions)
  
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'ramp' CHECK (role IN ('admin', 'ramp', 'cargo')),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    INSERT INTO users (username, password, role, active) VALUES
      ('admin', 'skyroute2024', 'admin', true),
      ('ramp', 'ramp2025', 'ramp', true),
      ('cargo', 'cargo2024', 'cargo', true)
    ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    
    INSERT INTO settings (key, value) VALUES
      ('notification_email', 'raf.rajkowski@dnata.com'),
      ('smtp_host', ''),
      ('smtp_port', '587'),
      ('smtp_user', ''),
      ('smtp_password', ''),
      ('from_email', 'noreply@skyroute.uk'),
      ('from_name', 'SkyRoute C209/C208 System')
    ON CONFLICT (key) DO NOTHING;
    
    ALTER TABLE entries
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ok',
      ADD COLUMN IF NOT EXISTS seals_intact BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS all_parts_returned BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS items_returned BOOLEAN DEFAULT true;
    
    ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_c209_number_key;
  `;

  // Try the /pg/query endpoint first (Supabase >= 1.44.0)
  try {
    const pgRes = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (pgRes.ok) {
      const data = await pgRes.text();
      results.push(`pg/query: SUCCESS - ${data.substring(0, 200)}`);
      return NextResponse.json({ success: true, results });
    } else {
      const errText = await pgRes.text();
      results.push(`pg/query failed (${pgRes.status}): ${errText.substring(0, 300)}`);
    }
  } catch (err: any) {
    results.push(`pg/query error: ${err.message}`);
  }

  // Fallback: try creating tables via PostgREST (insert into system tables won't work, but let's try direct table creation)
  // Actually, let's try the /rest/v1/rpc approach with a custom function
  // If that fails, we'll need the user to run SQL manually

  return NextResponse.json({ success: false, results, message: 'Could not execute SQL automatically. Please run the migration SQL manually in Supabase Dashboard.' });
}
