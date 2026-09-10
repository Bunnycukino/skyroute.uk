export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// Read-only migration status check
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('skyroute_user');
  if (!cookie || cookie.value !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const results: string[] = [];

  // Check users table
  const { error: usersErr } = await supabase.from('users').select('id').limit(1);
  const usersExists = !usersErr || !usersErr.message.includes('Could not find the table');
  results.push(usersExists ? 'users table: EXISTS' : 'users table: MISSING');

  // Check settings table
  const { error: settingsErr } = await supabase.from('settings').select('key').limit(1);
  const settingsExists = !settingsErr || !settingsErr.message.includes('Could not find the table');
  results.push(settingsExists ? 'settings table: EXISTS' : 'settings table: MISSING');

  // Check entries columns
  const { data: entryData } = await supabase.from('entries').select('*').limit(1);
  if (entryData && entryData.length > 0) {
    const keys = Object.keys(entryData[0]);
    results.push(`entries: status=${keys.includes('status')}, seals_intact=${keys.includes('seals_intact')}, all_parts_returned=${keys.includes('all_parts_returned')}, items_returned=${keys.includes('items_returned')}`);
  } else {
    results.push('entries: no rows to check columns');
  }

  const needsMigration = !usersExists || !settingsExists;
  
  return NextResponse.json({ 
    needsMigration,
    results,
    message: needsMigration 
      ? 'Run migration SQL in Supabase Dashboard → SQL Editor → New Query. File: supabase-migration-v2.sql in repo.'
      : 'All tables exist.'
  });
}
