export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// ── helpers ──────────────────────────────────────────────────────────
function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

function getMonthPrefix(date: Date): string {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return months[date.getMonth()];
}

function getMonthYear(date: Date): string {
  return getMonthPrefix(date) + '-' + date.getFullYear().toString().slice(-2);
}

async function getNextSequence(type: 'c209' | 'c208', date: Date): Promise<number> {
  const prefix = getMonthPrefix(date);
  const col = type === 'c209' ? 'c209_number' : 'c208_number';
  const { data, error } = await supabase
    .from('entries')
    .select(col)
    .like(col, prefix + '%')
    .order(col, { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return 1;
  const lastVal = (data[0] as any)[col] as string;
  const numPart = parseInt(lastVal.substring(3));
  return isNaN(numPart) ? 1 : numPart + 1;
}

function buildNumber(prefix: string, seq: number): string {
  return prefix + String(seq).padStart(4, '0');
}

// ── POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const now = new Date();
    const monthYear = getMonthYear(now);
    const prefix = getMonthPrefix(now);

    // ── RAMP INPUT (C209) ───────────────────────────────────────────
    if (action === 'ramp_input') {
      const seq = await getNextSequence('c209', now);
      const c209 = buildNumber(prefix, seq);

      const entryDate = body.date_received ? new Date(body.date_received) : now;

      const { data: result, error } = await supabase
        .from('entries')
        .insert({
          type: 'ramp_input',
          c209_number: c209,
          c208_number: null,
          bar_number: (body.container_code || '').toUpperCase() || null,
          container_code: (body.container_code || '').toUpperCase() || null,
          flight_number: (body.flight_number || '').toUpperCase() || null,
          origin: (body.origin || '').toUpperCase() || null,
          destination: (body.destination || '').toUpperCase() || null,
          pieces: body.pieces || 0,
          signature: (body.signature || '').toUpperCase() || null,
          notes: body.notes || null,
          flags: (body.flags || '').toUpperCase() || null,
          is_new_build: false,
          is_rw_flight: false,
          month_year: monthYear,
          created_by: user,
          created_at: entryDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, c209, entry: result });
    }

    // ── LOGISTIC INPUT (C208 podpiety do istniejacego C209) ─────────
    if (action === 'logistic_input') {
      const c209Search = (body.c209_number || '').toUpperCase();

      // znajdz istniejacy rekord C209
      const { data: existing, error: findError } = await supabase
        .from('entries')
        .select('*')
        .ilike('c209_number', c209Search)
        .limit(1)
        .single();

      if (findError || !existing) {
        return NextResponse.json(
          { error: `C209 '${c209Search}' not found. Please register RAMP entry first.` },
          { status: 404 }
        );
      }

      // generuj nowy C208
      const seq208 = await getNextSequence('c208', now);
      const c208 = buildNumber(prefix, seq208);

      const entryDate = body.date_received ? new Date(body.date_received) : now;

      const { data: result, error } = await supabase
        .from('entries')
        .insert({
          type: 'logistic_input',
          c209_number: existing.c209_number,
          c208_number: c208,
          bar_number: (body.container_code || '').toUpperCase() || existing.bar_number,
          container_code: (body.container_code || '').toUpperCase() || existing.container_code,
          flight_number: (body.flight_number || '').toUpperCase() || null,
          origin: (body.origin || '').toUpperCase() || null,
          destination: (body.destination || '').toUpperCase() || null,
          pieces: body.pieces || existing.pieces || 0,
          signature: (body.signature || '').toUpperCase() || null,
          notes: body.notes || null,
          flags: (body.flags || '').toUpperCase() || null,
          is_new_build: body.is_new_build || false,
          is_rw_flight: (body.flight_number || '').toUpperCase().startsWith('RW'),
          month_year: monthYear,
          created_by: user,
          created_at: entryDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({
        success: true,
        c209: existing.c209_number,
        c208,
        entry: result
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── GET ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    let query = supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(
        `c209_number.ilike.%${search}%,` +
        `c208_number.ilike.%${search}%,` +
        `bar_number.ilike.%${search}%,` +
        `container_code.ilike.%${search}%,` +
        `flight_number.ilike.%${search}%,` +
        `signature.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
