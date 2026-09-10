export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const user = getUser(req);
  if (!user) return false;
  const { data } = await supabase.from('users').select('role').eq('username', user).single();
  if (data?.role === 'admin') return true;
  return user === 'admin';
}

// GET — retrieve settings (admin only)
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const settings: Record<string, string> = {};
    (data || []).forEach((s: any) => { settings[s.key] = s.value; });
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — update settings (admin only)
export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { settings } = await req.json();
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object required' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from('settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
