export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// Temporary migration endpoint - creates tables directly using Supabase client DDL
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('skyroute_user');
  if (!cookie || cookie.value !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const results: string[] = [];

  // 1. Check if users table exists by trying to select from it
  const { data: usersCheck, error: usersErr } = await supabase.from('users').select('id').limit(1);
  const usersExists = !usersErr || !usersErr.message.includes('Could not find the table');
  
  if (!usersExists) {
    results.push('users table: does not exist — needs manual SQL migration');
  } else {
    results.push('users table: already exists');
    // Check if admin user exists
    const { data: adminUser } = await supabase.from('users').select('username, role, active').eq('username', 'admin').single();
    if (!adminUser) {
      results.push('admin user: missing — needs SQL migration');
    } else {
      results.push(`admin user: exists (${adminUser.role}, active=${adminUser.active})`);
    }
  }

  // 2. Check if settings table exists
  const { data: settingsCheck, error: settingsErr } = await supabase.from('settings').select('key').limit(1);
  const settingsExists = !settingsErr || !settingsErr.message.includes('Could not find the table');
  results.push(settingsExists ? 'settings table: already exists' : 'settings table: does not exist — needs manual SQL migration');

  // 3. Check entries columns
  const { data: entryData, error: entryErr } = await supabase.from('entries').select('*').limit(1);
  if (entryErr) {
    results.push(`entries: error — ${entryErr.message}`);
  } else if (entryData && entryData.length > 0) {
    const keys = Object.keys(entryData[0]);
    results.push(`entries columns: status=${keys.includes('status')}, seals_intact=${keys.includes('seals_intact')}, all_parts_returned=${keys.includes('all_parts_returned')}, items_returned=${keys.includes('items_returned')}`);
  } else {
    results.push('entries: no rows to check columns — assuming migration needed for new columns');
  }

  // 4. Check unique constraint
  results.push('unique constraint on c209_number: check SQL migration to drop if exists');

  const needsMigration = !usersExists || !settingsExists;
  
  return NextResponse.json({ 
    success: !needsMigration, 
    needsMigration,
    results,
    message: needsMigration 
      ? 'Migration v2 SQL needs to be run manually in Supabase Dashboard → SQL Editor → New Query. Copy the SQL from supabase-migration-v2.sql in the repo.'
      : 'All tables exist. Migration may still be needed for new columns.'
  });
}

export async function GET(req: NextRequest) {
  // GET just checks status, doesn't modify anything
  return POST(req);
}
