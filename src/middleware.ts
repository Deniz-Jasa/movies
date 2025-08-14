import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
  return jwtVerify(token, secret);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  try {
    await verifyJWT(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    '/home',
    '/movies/:path*',
    '/tv-shows/:path*',
    '/new-and-popular',
    '/sports',
    '/watch/:path*',
  ],
};


