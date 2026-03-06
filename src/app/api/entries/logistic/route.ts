// src/app/api/entries/logistic/route.ts
import { NextResponse } from 'next/server';
import { createLogisticEntry } from '@/lib/c209-logic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const entry = await createLogisticEntry(
      {
        c209Number: body.c209Number,
        barNumber: body.barNumber,
        flightNumber: body.flightNumber,
        origin: body.origin,
        destination: body.destination,
        pieces: body.pieces ? Number(body.pieces) : undefined,
        signature: body.signature,
        notes: body.notes,
        isNewBuild: !!body.isNewBuild,
        flags: body.flags ?? null,
      },
      body.createdBy || 'system'
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('LOGISTIC POST error', error);
    return NextResponse.json(
      { error: error.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

