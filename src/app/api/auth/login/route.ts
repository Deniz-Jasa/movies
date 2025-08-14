import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, initDb } from '@/lib/db';
import { SignJWT, type JWTPayload } from 'jose';

async function signJwt(payload: JWTPayload) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    await initDb();
    const allowed = process.env.ALLOWED_EMAIL;
    if (allowed && email.toLowerCase() !== allowed.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await signJwt({ sub: String(user.id), email: user.email });
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


