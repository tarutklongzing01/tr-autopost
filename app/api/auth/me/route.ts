import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthMarker } from '@/lib/auth/marker';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthMarker(req.cookies.get('fbautopost_auth')?.value);
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
    return NextResponse.json({ authenticated: true, uid: user.uid, email: user.email || '' });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
