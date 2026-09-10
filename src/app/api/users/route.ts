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
  // Check DB users table for role
  const { data } = await supabase.from('users').select('role').eq('username', user).single();
  if (data?.role === 'admin') return true;
  // Fallback to hardcoded admin
  return user === 'admin';
}

// GET — list all users (admin only)
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, active, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ users: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create user (admin only)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { username, password, role } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    if (!['admin', 'ramp', 'cargo'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ username: username.toLowerCase(), password, role })
      .select('id, username, role, active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — update user (admin only)
export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { id, username, password, role, active } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const updates: any = {};
    if (username) updates.username = username.toLowerCase();
    if (password) updates.password = password;
    if (role && ['admin', 'ramp', 'cargo'].includes(role)) updates.role = role;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, username, role, active, created_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete user (admin only)
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Prevent self-deletion
    const { data: target } = await supabase.from('users').select('username').eq('id', parseInt(id)).single();
    if (target?.username === user) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const { error } = await supabase.from('users').delete().eq('id', parseInt(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
