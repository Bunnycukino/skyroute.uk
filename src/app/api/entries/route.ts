export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';


// ── helpers ──────────────────────────────────────────────────────────────
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

// Matches VBA GetNextC209Number / GetNextC208Number:
// Fetches ALL matching prefix rows, parses numeric part, returns max+1.
// Skips 'NEW BUILD' and 'RW' entries (mirrors VBA logic).
async function getNextSequence(type: 'c209' | 'c208', date: Date): Promise<number> {
  const prefix = getMonthPrefix(date);
  const col = type === 'c209' ? 'c209_number' : 'c208_number';

  const { data, error } = await supabase
    .from('entries')
    .select(col)
    .like(col, prefix + '%');

  if (error || !data || data.length === 0) return 1;

  let maxNum = 0;
  for (const row of data) {
    const val = ((row as any)[col] as string) || '';
    if (val.toUpperCase() === 'NEW BUILD' || val.toUpperCase() === 'RW') continue;
    if (val.length >= 7) {
      const numPart = parseInt(val.substring(3), 10);
      if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
    }
  }
  return maxNum + 1;
}

function buildNumber(prefix: string, seq: number): string {
  return prefix + String(seq).padStart(4, '0');
}

// ── POST ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const now = new Date();

    // ── RAMP INPUT (C209) ─────────────────────────────────────────────
    // Mirrors VBA: RAMP INPUT branch - creates new LOG row with C209, no C208 yet
    if (action === 'ramp_input') {
      const entryDate = body.date_received ? new Date(body.date_received) : now;
      const prefix = getMonthPrefix(entryDate);
      const monthYear = getMonthYear(entryDate);
      const seq = await getNextSequence('c209', entryDate);
      const c209 = buildNumber(prefix, seq);

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

      // Try to add status fields (will fail silently if columns don't exist yet)
      if (body.status && body.status !== 'ok') {
        try {
          await supabase.from('entries')
            .update({
              status: body.status || 'ok',
              seals_intact: body.seals_intact !== undefined ? body.seals_intact : true,
              all_parts_returned: body.all_parts_returned !== undefined ? body.all_parts_returned : true,
              items_returned: body.items_returned !== undefined ? body.items_returned : true
            })
            .eq('id', result.id);
        } catch (statusErr) {
          console.error('[STATUS] Could not save status fields:', statusErr);
        }
      }

      // Trigger email notification if status is ISSUE or MISSING
      const entryStatus = body.status || 'ok';
      if (entryStatus === 'issue' || entryStatus === 'missing') {
        try {
          const barNum = (body.container_code || '').toUpperCase();
          const flightNum = (body.flight_number || '').toUpperCase();
          const issues: string[] = [];
          if (body.seals_intact === false) issues.push('Seals NOT intact');
          if (body.all_parts_returned === false) issues.push('NOT all parts returned');
          if (body.items_returned === false) issues.push('Items sent did NOT return');
          if (body.notes) issues.push(`Comments: ${body.notes}`);

          const emailBody = `Ramp Issue Reported

C209: ${c209}
Bar Number: ${barNum}
Flight: ${flightNum}
Pieces: ${body.pieces || 0}
Signature: ${(body.signature || '').toUpperCase()}
Status: ${entryStatus.toUpperCase()}

Issues Found:
${issues.length > 0 ? issues.map(i => '  - ' + i).join('\n') : '  - Status marked as ' + entryStatus}

Reported by: ${user}
Time: ${entryDate.toLocaleString('en-GB')}

This is an automated notification from SkyRoute C209/C208 System.`;

          await fetch(`${req.nextUrl.origin}/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: `[ISSUE] C209 ${c209} — ${barNum} / ${flightNum}`,
              body: emailBody
            })
          });
        } catch (emailErr) {
          console.error('[NOTIFY] Failed to send email:', emailErr);
        }
      }

      return NextResponse.json({ success: true, c209, entry: result });
    }

    // ── LOGISTIC INPUT ─────────────────────────────────────────────────
    // Mirrors VBA AddEntry logistic branch:
    // - If c209 == 'NEW BUILD': create full new row with c209='NEW BUILD', c208=generated
    // - If RW flight prefix: c208='RW'
    // - Otherwise: find existing C209 row, generate C208, UPDATE that row
    if (action === 'logistic_input') {
      const c209Input = (body.c209_number || '').toUpperCase().trim();
      const flightNumber = (body.flight_number || '').toUpperCase().trim();
      const signName = (body.signature || '').toUpperCase().trim();
      const entryDate = body.date_received ? new Date(body.date_received) : now;
      const prefix = getMonthPrefix(entryDate);
      const monthYear = getMonthYear(entryDate);
      const isRW = flightNumber.startsWith('RW');

      if (!flightNumber) {
        return NextResponse.json(
          { error: 'Flight Number is required for LOGISTIC INPUT.' },
          { status: 400 }
        );
      }

      // ── NEW BUILD path ────────────────────────────────────────────
      // HMRC regulation: NEW BUILD = new flight built from scratch, no inbound.
      // Data goes ONLY into outbound (green/logistic) columns.
      // Ramp (yellow) columns stay empty — nothing returned.
      if (c209Input === 'NEW BUILD') {
        const seq208 = await getNextSequence('c208', entryDate);
        const c208 = buildNumber(prefix, seq208);
        const barNumber = (body.container_code || body.bar_number || '').toUpperCase();
        const pieces = body.pieces || 0;

        const { data: result, error } = await supabase
          .from('entries')
          .insert({
            type: 'logistic_input',
            c209_number: 'NEW BUILD',
            c208_number: c208,
            // Ramp (inbound) fields — EMPTY for NEW BUILD (not null, DB constraint)
            bar_number: '',
            container_code: '',
            flight_number: '',
            pieces: 0,
            signature: '',
            // Outbound (logistic) fields — filled with input data
            outbound_flight: flightNumber || null,
            outbound_signature: signName || null,
            outbound_date: entryDate.toISOString(),
            outbound_month_year: monthYear,
            outbound_bar_number: barNumber || null,
            outbound_pieces: pieces || null,
            notes: body.notes || null,
            is_new_build: true,
            is_rw_flight: isRW,
            month_year: monthYear,
            created_by: user,
            created_at: entryDate.toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, c209: 'NEW BUILD', c208, entry: result });
      }

      // ── Normal LOGISTIC path: find existing C209 ramp row ──────────
      // Mirrors VBA: FindC209Row => updates columns 9-16 of that row
      const { data: existing, error: findError } = await supabase
        .from('entries')
        .select('*')
        .eq('type', 'ramp_input')
        .ilike('c209_number', c209Input)
        .limit(1)
        .single();

      if (findError || !existing) {
        // Show available C209 numbers (mirrors VBA GetAvailableC209List)
        const { data: available } = await supabase
          .from('entries')
          .select('c209_number')
          .eq('type', 'ramp_input')
          .is('c208_number', null);

        const availableList = available
          ? available.map((r: any) => r.c209_number).join(', ')
          : 'none';

        return NextResponse.json(
          { error: `C209 '${c209Input}' not found. Available: ${availableList}. Register RAMP entry first.` },
          { status: 404 }
        );
      }

      // Generate C208 (or set 'RW' for rewarehouse flights)
      // Mirrors VBA: If isRWFlight Then c208 = 'RW'
      let c208: string;
      if (isRW) {
        c208 = 'RW';
      } else if (existing.c208_number) {
        // Already has C208 - keep existing (mirrors VBA existingC208 check)
        c208 = existing.c208_number;
      } else {
        const seq208 = await getNextSequence('c208', entryDate);
        c208 = buildNumber(prefix, seq208);
      }

      // Bar number / pieces: use logistic input if provided, else fall back to ramp values
      const barNumber = (body.container_code || body.bar_number || '').toUpperCase() || existing.bar_number;
      const pieces = body.pieces || existing.pieces || 0;

      // UPDATE the existing ramp row with C208 + outbound data
      // Mirrors VBA: writes to COL_C208_NUM, COL_NEW_FLIGHT, COL_NEW_SIGN, COL_NEW_DATE, etc.
      const { data: updated, error: updateError } = await supabase
        .from('entries')
        .update({
          c208_number: c208,
          flags: (body.flags || existing.flags || '').toUpperCase() || null,
          is_rw_flight: isRW,
          outbound_flight: flightNumber,
          outbound_signature: signName,
          outbound_date: entryDate.toISOString(),
          outbound_month_year: monthYear,
          outbound_bar_number: barNumber,
          outbound_pieces: pieces,
          updated_by: user,
          updated_at: now.toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, c209: existing.c209_number, c208, entry: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── GET ───────────────────────────────────────────────────────────────────
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
    return NextResponse.json({ entries: data || [], user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only admin can delete entries
  if (user !== 'admin') {
    return NextResponse.json({ error: 'Permission denied. Only admin can delete entries.' }, { status: 403 });
  }

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
