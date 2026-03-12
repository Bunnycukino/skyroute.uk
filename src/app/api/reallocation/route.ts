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
