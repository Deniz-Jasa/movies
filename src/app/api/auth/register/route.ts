import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, initDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Registration disabled when ALLOWED_EMAIL is set
    if (process.env.ALLOWED_EMAIL) {
      return NextResponse.json({ error: 'Registration disabled' }, { status: 403 });
    }
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    await initDb();
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


