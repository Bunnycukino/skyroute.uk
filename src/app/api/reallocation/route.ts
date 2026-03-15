export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

// GET /api/reallocation - returns reallocation_register rows
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabase
      .from('reallocation_register')
      .select('*')
      .order('inserted_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return NextResponse.json({ rows: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/reallocation - add a new reallocation row
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { c208_number } = body;
    if (!c208_number) return NextResponse.json({ error: 'c208_number required' }, { status: 400 });

    const { data, error } = await supabase
      .from('reallocation_register')
      .insert({ c208_number })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ row: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/reallocation?id=xxx - delete a reallocation row
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('reallocation_register')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/reallocation - auto-fill bar/c209/flight from entries
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get all reallocations that are missing bar_number
    const { data: reallocations, error: rErr } = await supabase
      .from('reallocation_register')
      .select('*');
    if (rErr) throw rErr;

    // Get all c209 entries
    const { data: entries, error: eErr } = await supabase
      .from('c209_entries')
      .select('*');
    if (eErr) throw eErr;

    let updatedCount = 0;

    for (const realloc of (reallocations || [])) {
      if (realloc.c208_number && !realloc.bar_number) {
        const entry = (entries || []).find((e: any) => e.c208_number === realloc.c208_number);
        if (entry) {
          await supabase
            .from('reallocation_register')
            .update({
              bar_number: entry.new_bar_number || entry.bar_number,
              c209_number: entry.c209_number,
              flight_number: entry.new_flight_number || entry.flight_number,
              date: entry.flight_date || entry.entry_date,
            })
            .eq('id', realloc.id);
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
