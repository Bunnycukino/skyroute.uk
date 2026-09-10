export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Simple credential check - in production use a real auth system with hashed passwords
const USERS: Record<string, string> = {
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

    const expectedPassword = USERS[username.toLowerCase()];
    if (!expectedPassword || expectedPassword !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username });
    response.cookies.set('skyroute_user', username, {
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
