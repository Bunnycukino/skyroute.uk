// ============================================================================
// c209-logic.ts - VBA AddEntry 1:1 migration
// Covers: Expiry Tracker (48h), Reallocation Register, helper functions
// Used by: src/app/api/entries/route.ts
// ============================================================================
import supabase from '@/lib/db';

// ── Expiry Tracker (mirrors VBA AddToExpiryTracker / RemoveFromExpiryTracker) ──

export async function addToExpiryTracker(
  c209Number: string,
  creationDate: Date
): Promise<void> {
  if (!c209Number || c209Number === 'NEW BUILD') return;
  await supabase.from('expiry_tracker').insert({
    c209_number: c209Number,
    creation_date: creationDate.toISOString(),
    last_checked: new Date().toISOString(),
    status: 'Active',
  });
}

export async function removeFromExpiryTracker(
  c209Number: string
): Promise<void> {
  if (!c209Number || c209Number === 'NEW BUILD') return;
  await supabase
    .from('expiry_tracker')
    .delete()
    .eq('c209_number', c209Number);
}

// mirrors VBA CheckExpiredC209Numbers - returns list of expired C209 numbers
export async function checkExpiredC209Numbers(): Promise<string[]> {
  const now = new Date();
  const { data, error } = await supabase
    .from('expiry_tracker')
    .select('id, c209_number, creation_date, status')
    .eq('status', 'Active');

  if (error || !data) return [];

  const expired: string[] = [];

  for (const row of data) {
    const creation = new Date(row.creation_date as string);
    const diffHours = (now.getTime() - creation.getTime()) / 3_600_000;

    if (diffHours >= 48) {
      // mirrors VBA IsC209Used check
      const { data: used } = await supabase
        .from('entries')
        .select('id, outbound_flight, outbound_signature')
        .eq('c209_number', row.c209_number)
        .limit(1)
        .maybeSingle();

      const isUsed = !!(used?.outbound_flight || used?.outbound_signature);

      if (!isUsed) {
        expired.push(row.c209_number as string);
        await supabase
          .from('expiry_tracker')
          .update({
            status: 'Expired',
            last_checked: now.toISOString(),
          })
          .eq('id', row.id);
      } else {
        // mirrors VBA: delete from tracker if C209 is already used
        await supabase
          .from('expiry_tracker')
          .delete()
          .eq('id', row.id);
      }
    } else {
      await supabase
        .from('expiry_tracker')
        .update({ last_checked: now.toISOString() })
        .eq('id', row.id);
    }
  }

  return expired;
}

// ── Reallocation Register (mirrors VBA FillReallocationRegister / FindC208Data) ──

export async function fillReallocationRegister(): Promise<void> {
  const { data: rows, error } = await supabase
    .from('reallocation_register')
    .select('id, c208_number, bar_number, c209_number, flight, flight_date');

  if (error || !rows) return;

  for (const row of rows) {
    if (!row.c208_number) continue;

    // mirrors VBA FindC208Data - looks up entry by c208_number
    const { data: entry } = await supabase
      .from('entries')
      .select(
        'bar_number, c209_number, flight_number, outbound_flight, created_at, outbound_date, c208_number'
      )
      .eq('c208_number', row.c208_number)
      .maybeSingle();

    if (!entry) continue;

    const flight =
      (entry.outbound_flight as string | null) ||
      (entry.flight_number as string | null) ||
      null;
    const flightDateRaw =
      (entry.outbound_date as string | null) ||
      (entry.created_at as string | null) ||
      null;
    const flightDate = flightDateRaw
      ? flightDateRaw.slice(0, 10)
      : null;

    const updates: Record<string, unknown> = {};
    if (!row.bar_number && entry.bar_number)
      updates.bar_number = entry.bar_number;
    if (!row.c209_number && entry.c209_number)
      updates.c209_number = entry.c209_number;
    if (!row.flight && flight) updates.flight = flight;
    if (!row.flight_date && flightDate) updates.flight_date = flightDate;

    if (Object.keys(updates).length) {
      await supabase
        .from('reallocation_register')
        .update(updates)
        .eq('id', row.id);
    }
  }
}

// ── Legacy export kept for backward compat with logistic/route.ts ──
export interface LogisticEntryInput {
  c209Number?: string;
  barNumber?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  pieces?: number;
  signature?: string;
  notes?: string;
  isNewBuild?: boolean;
  flags?: string | null;
}

// Thin stub - real logic lives in /api/entries route.ts
export async function createLogisticEntry(
  data: LogisticEntryInput,
  createdBy: string = 'system'
) {
  return {
    c209Number: data.c209Number ?? null,
    barNumber: data.barNumber ?? null,
    flightNumber: data.flightNumber ?? null,
    pieces: data.pieces ?? 0,
    origin: data.origin ?? '',
    destination: data.destination ?? '',
    signature: data.signature ?? null,
    isNewBuild: data.isNewBuild ?? false,
    flags: data.flags ?? null,
    createdBy,
  };
}
