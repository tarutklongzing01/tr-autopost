import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { createAuthMarker } from '@/lib/auth/marker';

const MAX_AGE = 60 * 60 * 24 * 5;

export async function POST(req: NextRequest) {
  if (!adminAuth) return NextResponse.json({ error: 'Firebase Admin is not configured' }, { status: 503 });
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    const decoded = await adminAuth.verifyIdToken(idToken);
    const allowed = process.env.AUTH_ALLOWED_EMAIL?.trim().toLowerCase();
    if (allowed && decoded.email?.toLowerCase() !== allowed) {
      return NextResponse.json({ error: 'บัญชีนี้ไม่ได้รับอนุญาต' }, { status: 403 });
    }
    const marker = await createAuthMarker({ expiresAt: Date.now() + MAX_AGE * 1000, email: decoded.email, uid: decoded.uid });
    const response = NextResponse.json({ ok: true, email: decoded.email });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: MAX_AGE };
    response.cookies.set('fbautopost_auth', marker, options);
    response.cookies.set('fbautopost_session', '', { ...options, maxAge: 0 });
    return response;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'auth/id-token-failed';
    console.error('Auth token verification failed', { code, message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: `เข้าสู่ระบบไม่สำเร็จ (${code})` }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 };
  response.cookies.set('fbautopost_session', '', options);
  response.cookies.set('fbautopost_auth', '', options);
  return response;
}
