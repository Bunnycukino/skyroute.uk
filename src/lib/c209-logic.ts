// ============================================================================
// LOGISTIC ENTRY FACTORY (API helper)
// ============================================================================

export interface LogisticEntryInput {
  c209Number?: string;
  barNumber?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  pieces?: number;
  signature?: string;
  notes?: string;
  isNewBuild?: boolean;
  flags?: string | null;
}

export async function createLogisticEntry(
  data: LogisticEntryInput,
  createdBy: string = 'system'
) {
  const entry = {
    awb: data.c209Number || data.barNumber || '000-00000000',
    pieces: data.pieces ?? 0,
    weight: 1,
    origin: data.origin,
    destination: data.destination,
    flightNumber: data.flightNumber,
    status: data.isNewBuild ? 'NEW BUILD' : 'RW',
    remarks: data.notes ?? undefined,
    warehouse: data.flags ?? undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    flags: data.flags ?? null,
    c209Number: data.c209Number ?? null,
    barNumber: data.barNumber ?? null,
    signature: data.signature ?? null,
  };

  return entry;
}
