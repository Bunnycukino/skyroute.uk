export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// Fallback hardcoded users (used when DB users table doesn't exist)
const FALLBACK_USERS: Record<string, string> = {
  admin: 'skyroute2024',
  ramp: 'ramp2025',
  cargo: 'cargo2024',
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const usernameLower = username.toLowerCase();

    // Try DB users table first
    let valid = false;
    let userRole = '';
    let userActive = true;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, password, role, active')
        .eq('username', usernameLower)
        .single();

      if (!error && data) {
        valid = data.password === password;
        userRole = data.role;
        userActive = data.active;
      }
    } catch (dbErr) {
      // DB not available — fall through to hardcoded
    }

    // Fallback to hardcoded if DB didn't work
    if (!valid) {
      const expected = FALLBACK_USERS[usernameLower];
      if (expected && expected === password) {
        valid = true;
        userRole = usernameLower === 'admin' ? 'admin' : usernameLower === 'ramp' ? 'ramp' : 'cargo';
        userActive = true;
      }
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (!userActive) {
      return NextResponse.json({ error: 'Account disabled. Contact admin.' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, username: usernameLower, role: userRole });
    response.cookies.set('skyroute_user', usernameLower, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('skyroute_user');
  return response;
}
